import React, { useEffect, useState, useMemo, Suspense, lazy, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, useMediaQuery, useTheme as useMuiTheme, IconButton, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen, Info } from '@mui/icons-material';
import { TbWorldSearch } from 'react-icons/tb';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { 
  useGetDailyDataQuery, 
  useGetRealtimePriceQuery, 
  useGetExchangeRateQuery,
  useGetAccuracyVisualizationQuery,
  useGetPredictionHistoryQuery,
  useGetEnhancedPredictionQuery,
  useGetModelInfoQuery,
  useGetPredictionStatsQuery,
  useGetPendingPredictionsQuery,
  useGetPredictionReasonsQuery
} from '../../store/api/goldApi';
import { useTheme } from '../../hooks/useTheme';
import CurrencyDropdown, { type CurrencyUnit } from './CurrencyDropdown';
import { convertPrice, convertChartData } from '../../utils/currencyConverter';
import Sidebar from './Sidebar';

// Lazy load heavy components including Chart (Plotly is ~6-7MB)
const Chart = lazy(() => import('./Chart'));
const AccuracyStats = lazy(() => import('./AccuracyStats'));
const AccuracyVisualizationChart = lazy(() => import('./AccuracyVisualizationChart'));
const PredictionHistoryTable = lazy(() => import('./PredictionHistoryTable'));
const PendingPredictions = lazy(() => import('./PendingPredictions'));

interface DashboardProps {
  currencyUnit: CurrencyUnit;
  onCurrencyUnitChange: (unit: CurrencyUnit) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currencyUnit, onCurrencyUnitChange }) => {
  const { isDark } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [realtimePrice, setRealtimePrice] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  
  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 1, 5));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 1, -3));
  }, []);
  
  const handleResetZoom = useCallback(() => {
    setZoomLevel(0);
  }, []);
  
  // Calculate chart height to match sidebar height - both should align at bottom
  const chartHeight = useMemo(() => {
    if (typeof window === 'undefined') return 600;
    
    const viewportHeight = window.innerHeight;
    const headerHeight = 64; // Main app header
    const pageHeaderHeight = isMobile ? 100 : isTablet ? 120 : 140; // Title + description + spacing
    const currencyDropdownHeight = isMobile ? 50 : isTablet ? 60 : 70; // Currency dropdown height
    const topPadding = isMobile ? 32 : isTablet ? 40 : 48; // Top padding (pt-8 = 32px)
    const containerPadding = 16; // Container px-4 = 16px
    
    // For desktop, sidebar maxHeight is calc(100vh - 240px)
    // We need to calculate the exact same height for the chart
    // The 240px accounts for: header (64) + pageHeader (~140) + topPadding (48) + containerPadding (16) + gap/margin (~-28)
    if (isMobile) {
      const availableHeight = viewportHeight - headerHeight - pageHeaderHeight - currencyDropdownHeight - topPadding - containerPadding;
      return Math.max(400, availableHeight);
    }
    if (isTablet) {
      const availableHeight = viewportHeight - headerHeight - pageHeaderHeight - currencyDropdownHeight - topPadding - containerPadding;
      return Math.max(500, availableHeight);
    }
    // Desktop: match sidebar maxHeight exactly (calc(100vh - 240px))
    const sidebarHeight = viewportHeight - 240;
    return Math.max(600, sidebarHeight);
  }, [isMobile, isTablet]);

  // WebSocket connection disabled - using REST API polling instead
  const wsData = null;
  const wsConnected = false;
  const wsError = null;

  // Fetch daily data for the last 60 days (2 months)
  // Calculate date 60 days ago
  const getDate60DaysAgo = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 60);
    return date.toISOString().split('T')[0] as string; // Format as YYYY-MM-DD
  };

  const startDate60DaysAgo = getDate60DaysAgo();

  const {
    data: dailyData,
    error: dailyError,
    isLoading: dailyLoading,
  } = useGetDailyDataQuery({ 
    days: 60, // Request 60 days (2 months) of data
    start_date: startDate60DaysAgo, // Explicitly request from 60 days ago
  }, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  // Debug logging removed to prevent console warnings

  // Fetch real-time price (fallback)
  const {
    data: realtimeData,
    error: realtimeError,
    isLoading: realtimeLoading,
  } = useGetRealtimePriceQuery(undefined, {
    pollingInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  // Fetch USD/LKR exchange rate
  const {
    data: exchangeRateData,
  } = useGetExchangeRateQuery({ from: 'USD', to: 'LKR' }, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  // Fetch accuracy visualization data (auto-refresh every 15 minutes as per guide)
  const {
    data: accuracyVisualizationData,
    error: accuracyVisualizationError,
    isLoading: _accuracyVisualizationLoading,
  } = useGetAccuracyVisualizationQuery(undefined, {
    pollingInterval: 900000, // 15 minutes
    // Skip polling if we get a 404 error (endpoint doesn't exist)
    skip: false,
  });

  // Fetch prediction history (skip if endpoint doesn't exist to prevent 404 errors)
  const {
    data: predictionHistoryData,
    isLoading: predictionHistoryLoading,
    error: predictionHistoryError,
  } = useGetPredictionHistoryQuery({ days: 30 }, {
    pollingInterval: 900000, // 15 minutes
    skip: false, // Keep enabled, but handle errors gracefully
  });

  // Fetch enhanced prediction with model details and sentiment
  const {
    data: enhancedPrediction,
    error: enhancedPredictionError,
    isLoading: enhancedPredictionLoading,
  } = useGetEnhancedPredictionQuery(undefined, {
    pollingInterval: 300000, // 5 minutes
    refetchOnMountOrArgChange: true,
  });

  // Fetch detailed model info with live accuracy metrics
  const {
    data: modelInfo,
    error: modelInfoError,
    isLoading: modelInfoLoading,
  } = useGetModelInfoQuery(undefined, {
    pollingInterval: 600000, // 10 minutes
    refetchOnMountOrArgChange: true,
  });

  // Fetch comprehensive prediction stats
  const {
    data: predictionStats,
    error: _predictionStatsError,
    isLoading: _predictionStatsLoading,
  } = useGetPredictionStatsQuery(undefined, {
    pollingInterval: 600000, // 10 minutes
    refetchOnMountOrArgChange: true,
  });

  // Fetch pending predictions
  const {
    data: pendingPredictionsData,
    error: _pendingPredictionsError,
    isLoading: pendingPredictionsLoading,
    refetch: refetchPendingPredictions,
  } = useGetPendingPredictionsQuery(undefined, {
    pollingInterval: 300000, // 5 minutes - refresh more frequently since these change as market closes
    refetchOnMountOrArgChange: true,
  });

  // Fetch prediction reasons
  const {
    data: predictionReasonsData,
    error: predictionReasonsError,
    isLoading: predictionReasonsLoading,
  } = useGetPredictionReasonsQuery(undefined, {
    pollingInterval: 300000, // 5 minutes - refresh when prediction updates
    refetchOnMountOrArgChange: true,
  });

  // Use WebSocket data if available, otherwise fall back to REST API
  const displayData = wsData || dailyData;
  const displayError = wsError || dailyError;
  const displayLoading = !wsConnected && dailyLoading;

  // Use real-time price if available, otherwise fall back to daily data
  const currentPrice = realtimePrice || displayData?.current_price || 0;
  
  // Get exchange rate for conversion with safety check
  const usdToLkrRate = useMemo(() => {
    const rate = exchangeRateData?.exchange_rate;
    // Ensure rate is a valid positive number
    if (typeof rate === 'number' && rate > 0 && isFinite(rate)) {
      return rate;
    }
    return 300; // Fallback to 300 if API fails or returns invalid data
  }, [exchangeRateData?.exchange_rate]);

  // Update real-time price when data changes
  useEffect(() => {
    if (realtimeData?.current_price && typeof realtimeData.current_price === 'number' && isFinite(realtimeData.current_price)) {
      setRealtimePrice(realtimeData.current_price);
    }
  }, [realtimeData]);


  // Update chart data with real-time price and convert based on currency unit
  const chartData = useMemo(() => {
    try {
      if (!displayData || !displayData.data || !Array.isArray(displayData.data)) return [];
      
      // Filter to show only last 60 days (2 months)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const cutoffDate: string = sixtyDaysAgo.toISOString().split('T')[0] || '';
      
      if (!cutoffDate) {
        console.error('Failed to calculate cutoff date for chart data');
        return [];
      }
      
      // Filter data to only include last 60 days (inclusive of cutoff date)
      const filteredData = displayData.data.filter(d => {
        if (!d || !d.date) return false;
        // Compare dates as strings (YYYY-MM-DD format)
        return d.date >= cutoffDate;
      });
      
      // Debug logging removed to prevent console warnings
      
      const updatedData = [...filteredData];
      if (realtimePrice && typeof realtimePrice === 'number' && isFinite(realtimePrice) && updatedData.length > 0) {
        // Update the last data point with real-time price (realtimePrice is always in USD)
        const lastDataPoint = updatedData[updatedData.length - 1];
        if (lastDataPoint && typeof lastDataPoint === 'object') {
          updatedData[updatedData.length - 1] = {
            ...lastDataPoint,
            close: realtimePrice
          };
        }
      }
      
      // Convert data based on selected currency unit
      if (!usdToLkrRate || usdToLkrRate <= 0) {
        console.warn('Invalid exchange rate, using fallback');
        return updatedData;
      }
      
      return convertChartData(updatedData, currencyUnit, usdToLkrRate);
    } catch (error) {
      console.error('Error processing chart data:', error);
      return [];
    }
  }, [displayData, realtimePrice, currencyUnit, usdToLkrRate]);

  // Convert current price for display
  const convertedCurrentPrice = useMemo(() => {
    try {
      if (!currentPrice || typeof currentPrice !== 'number' || !isFinite(currentPrice)) {
        return {
          price: 0,
          currency: currencyUnit === 'pawn' ? 'LKR' : 'USD',
          unit: currencyUnit === 'pawn' ? '1 Pawn' : 'Troy Ounce',
          displayText: currencyUnit === 'pawn' ? 'LKR 0' : '$0.00'
        };
      }
      if (!usdToLkrRate || usdToLkrRate <= 0) {
        console.warn('Invalid exchange rate for price conversion');
        return {
          price: currentPrice,
          currency: 'USD',
          unit: 'Troy Ounce',
          displayText: `$${currentPrice.toFixed(2)}`
        };
      }
      return convertPrice(currentPrice, currencyUnit, usdToLkrRate);
    } catch (error) {
      console.error('Error converting current price:', error);
      return {
        price: 0,
        currency: currencyUnit === 'pawn' ? 'LKR' : 'USD',
        unit: currencyUnit === 'pawn' ? '1 Pawn' : 'Troy Ounce',
        displayText: currencyUnit === 'pawn' ? 'LKR 0' : '$0.00'
      };
    }
  }, [currentPrice, currencyUnit, usdToLkrRate]);

  // Convert prediction price for display
  const convertedPredictionPrice = useMemo(() => {
    try {
      if (!displayData || !displayData.prediction) {
        return null;
      }
      const predictedPrice = displayData.prediction.predicted_price;
      if (predictedPrice == null || typeof predictedPrice !== 'number' || !isFinite(predictedPrice)) {
        return null;
      }
      if (!usdToLkrRate || usdToLkrRate <= 0) {
        console.warn('Invalid exchange rate for prediction price conversion');
        return {
          price: predictedPrice,
          currency: 'USD',
          unit: 'Troy Ounce',
          displayText: `$${predictedPrice.toFixed(2)}`
        };
      }
      return convertPrice(predictedPrice, currencyUnit, usdToLkrRate);
    } catch (error) {
      console.error('Error converting prediction price:', error);
      return null;
    }
  }, [displayData, currencyUnit, usdToLkrRate]);

  // Helper function to shorten method names
  const shortenMethod = (method: string): string => {
    if (!method) return 'LR (F)';
    
    const methodLower = method.toLowerCase();
    if (methodLower.includes('news-enhanced') || methodLower.includes('enhanced')) {
      return 'NELR (P)';
    }
    if (methodLower.includes('lasso')) {
      return 'LR (F)';
    }
    return method; // Fallback to original if pattern doesn't match
  };

  // Get the current prediction method dynamically
  const currentPredictionMethod = useMemo(() => {
    // Try enhanced prediction first (more detailed)
    if (enhancedPrediction?.prediction?.method) {
      return shortenMethod(enhancedPrediction.prediction.method);
    }
    // Fall back to daily data prediction method
    if (displayData?.prediction?.prediction_method) {
      return shortenMethod(displayData.prediction.prediction_method);
    }
    // Default fallback
    return 'LR (F)';
  }, [enhancedPrediction?.prediction?.method, displayData?.prediction?.prediction_method]);

  if (displayLoading) {
    return (
      <Box className="flex items-center justify-center h-96">
        <CircularProgress />
      </Box>
    );
  }

  if (displayError) {
    return (
      <Box className="p-4">
        <Alert severity="error">
          Unable to fetch data. Please check if the backend is running.
        </Alert>
      </Box>
    );
  }

  if (!displayData || (displayData.status && displayData.status !== 'success')) {
    return (
      <Box className="p-4">
        <Alert severity="warning">
          No data available
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      className="w-full h-full"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        pb: 0,
        mb: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Main Layout: Stats on Left, Chart on Right */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 3, sm: 4, lg: 4 },
          alignItems: { xs: 'stretch', lg: 'stretch' },
          minHeight: 0,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left Side: Price Cards and Stats */}
        <Box 
          sx={{
            width: { xs: '100%', lg: '400px' },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 2.5 },
            height: { 
              xs: 'auto', 
              lg: chartHeight 
            },
            maxHeight: { 
              xs: 'none', 
              lg: chartHeight 
            },
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: { xs: 0, lg: 2 },
            pb: 0,
            backgroundColor: isDark ? '#121212' : 'var(--background)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? 'rgba(255, 255, 255, 0.3)' : '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: isDark ? 'rgba(255, 255, 255, 0.5)' : '#666',
            },
          }}
        >
          {/* Price Information Cards */}
          <Box sx={{ flexShrink: 0 }}>
            <Box 
              sx={{ 
                padding: { xs: '1.25rem', sm: '1.5rem', lg: '1.75rem' },
              }}
              className="bg-card text-card-foreground border rounded-xl flex flex-col gap-6"
            >
          {/* Grid layout for cards - 2 columns on left sidebar */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr' },
              gap: { xs: '0.75rem', sm: '1rem' },
            }}
          >
            {/* Current Price Card */}
            <Box 
              sx={{ 
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                padding: { xs: '1rem', sm: '1.25rem' },
                minHeight: { xs: '100px', sm: '110px', lg: '120px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              className="bg-muted rounded-lg"
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'var(--muted-foreground)',
                  fontSize: { xs: '0.75rem', sm: '0.8125rem', lg: '0.875rem' },
                  fontWeight: 500,
                  marginBottom: { xs: '0.25rem', sm: '0.5rem' },
                  lineHeight: 1.3,
                }}
              >
                🔴 LIVE PRICE
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'var(--primary)',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', lg: '1.5rem' },
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                }}
              >
                {convertedCurrentPrice.displayText}
              </Typography>
            </Box>

            {/* Prediction Card */}
            {displayData?.prediction && 
             displayData.prediction.predicted_price != null && 
             typeof displayData.prediction.predicted_price === 'number' && 
             isFinite(displayData.prediction.predicted_price) && (
              <>
                <Box 
                  sx={{ 
                    backgroundColor: 'var(--muted)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    minHeight: { xs: '100px', lg: '120px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                  className="bg-muted rounded-lg"
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'var(--muted-foreground)',
                      fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                    className="text-muted-foreground"
                  >
                    Next Day Prediction
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#26d4b4',
                      fontSize: { xs: '1rem', sm: '1.125rem', lg: '1.375rem' },
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                    }}
                    className="font-bold"
                  >
                    {convertedPredictionPrice?.displayText || 
                      (displayData.prediction?.predicted_price != null && 
                       typeof displayData.prediction.predicted_price === 'number' && 
                       isFinite(displayData.prediction.predicted_price)
                        ? `$${displayData.prediction.predicted_price.toFixed(2)}`
                        : 'N/A')}
                  </Typography>
                </Box>

                {/* Expected Change Card */}
                <Box 
                  sx={{ 
                    backgroundColor: 'var(--muted)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    minHeight: { xs: '100px', lg: '120px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                  className="bg-muted rounded-lg"
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'var(--muted-foreground)',
                      fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                    className="text-muted-foreground"
                  >
                    Expected Change
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: (() => {
                        if (!convertedPredictionPrice) return 'var(--muted-foreground)';
                        const priceChange = convertedPredictionPrice.price - convertedCurrentPrice.price;
                        return priceChange >= 0 ? 'var(--secondary)' : 'var(--destructive)';
                      })(),
                      fontSize: { xs: '0.8125rem', sm: '0.9375rem', lg: '1.125rem' },
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                    }}
                  >
                    {(() => {
                      if (!convertedPredictionPrice) return 'N/A';
                      const priceChange = convertedPredictionPrice.price - convertedCurrentPrice.price;
                      const priceChangePct = convertedCurrentPrice.price > 0 ? (priceChange / convertedCurrentPrice.price) * 100 : 0;
                      const isPositive = priceChange >= 0;
                      const trendSymbol = isPositive ? "↗" : "↘";
                      const currencySymbol = currencyUnit === 'pawn' ? 'LKR ' : '$';
                      return `${trendSymbol} ${currencySymbol}${Math.abs(priceChange).toFixed(currencyUnit === 'pawn' ? 0 : 2)} (${priceChangePct >= 0 ? '+' : ''}${priceChangePct.toFixed(2)}%)`;
                    })()}
                  </Typography>
                </Box>

                {/* Method Card */}
                <Box 
                  sx={{ 
                    backgroundColor: 'var(--muted)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    minHeight: { xs: '100px', lg: '120px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                  className="bg-muted rounded-lg"
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'var(--muted-foreground)',
                      fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                    className="text-muted-foreground"
                  >
                    Method
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'var(--muted-foreground)',
                      fontSize: { xs: '0.8125rem', sm: '0.875rem', lg: '1rem' },
                      fontWeight: 'bold',
                      lineHeight: 1.3,
                    }}
                    className="text-muted-foreground font-bold"
                  >
                    {currentPredictionMethod}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

          {/* Accuracy Stats */}
          <Box sx={{ flexShrink: 0, mt: { xs: -1, sm: -1.3, lg: -1.3 } }}>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
                <CircularProgress size={24} />
              </Box>
            }>
              <AccuracyStats
                accuracyStats={displayData.accuracy_stats}
                isDark={isDark}
                {...(accuracyVisualizationData?.statistics ? { newStats: accuracyVisualizationData.statistics } : {})}
                {...(predictionStats?.data ? { predictionStats: predictionStats.data } : {})}
              />
            </Suspense>
          </Box>

          {/* Accuracy Visualization Chart */}
          {accuracyVisualizationData && 
           accuracyVisualizationData.data && 
           accuracyVisualizationData.data.length > 0 && 
           !accuracyVisualizationError && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
              className="bg-card border rounded-xl"
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: { xs: '0.75rem', sm: '1rem' },
                }}
              >
                Prediction Accuracy
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  color: isDark ? '#9ca3af' : '#6b7280',
                  marginBottom: { xs: '0.75rem', sm: '1rem' },
                  lineHeight: 1.5,
                }}
              >
                Compare predicted prices with actual prices to see model performance
              </Typography>
              <Suspense fallback={
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                  <CircularProgress size={24} />
                </Box>
              }>
                <AccuracyVisualizationChart
                  data={accuracyVisualizationData.data}
                  isDark={isDark}
                  height={300}
                />
              </Suspense>
            </Box>
          )}

          {/* Show message if accuracy visualization data is empty */}
          {accuracyVisualizationData && 
           accuracyVisualizationData.data && 
           accuracyVisualizationData.data.length === 0 && 
           !accuracyVisualizationError && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
              className="bg-card border rounded-xl"
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: { xs: '0.5rem', sm: '0.75rem' },
                }}
              >
                Prediction Accuracy
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  color: isDark ? '#9ca3af' : '#6b7280',
                  marginBottom: { xs: '0.75rem', sm: '1rem' },
                  lineHeight: 1.5,
                }}
              >
                Compare predicted prices with actual prices to see model performance
              </Typography>
              <Alert severity="info" sx={{ mt: 1 }}>
                No accuracy data available yet. The chart will appear once predictions are evaluated with actual prices.
              </Alert>
            </Box>
          )}

          {/* Show error if API call fails */}
          {accuracyVisualizationError && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
              className="bg-card border rounded-xl"
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: { xs: '0.5rem', sm: '0.75rem' },
                }}
              >
                Prediction Accuracy
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  color: isDark ? '#9ca3af' : '#6b7280',
                  marginBottom: { xs: '0.75rem', sm: '1rem' },
                  lineHeight: 1.5,
                }}
              >
                Compare predicted prices with actual prices to see model performance
              </Typography>
              <Alert 
                severity="warning" 
                sx={{ mt: 1 }}
              >
                Unable to load accuracy data. {("status" in accuracyVisualizationError && accuracyVisualizationError.status === 404) 
                  ? 'Endpoint not available.' 
                  : 'Please try again later.'}
              </Alert>
            </Box>
          )}

          {/* Pending Predictions Section */}
          {pendingPredictionsData && pendingPredictionsData.status === 'success' && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
              className="bg-card border rounded-xl"
            >
              <Suspense fallback={
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress size={24} />
                </Box>
              }>
                <PendingPredictions
                  predictions={pendingPredictionsData.data?.predictions || []}
                  isLoading={pendingPredictionsLoading}
                  isDark={isDark}
                  onRefetch={refetchPendingPredictions}
                />
              </Suspense>
            </Box>
          )}

          {/* Prediction History Table */}
          {predictionHistoryData && predictionHistoryData.predictions && !predictionHistoryError && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
              className="bg-card border rounded-xl"
            >
              <Suspense fallback={
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress size={24} />
                </Box>
              }>
                <PredictionHistoryTable
                  predictions={predictionHistoryData.predictions}
                  isLoading={predictionHistoryLoading}
                  isDark={isDark}
                />
              </Suspense>
            </Box>
          )}

          {/* Enhanced Prediction Section */}
          {enhancedPrediction && enhancedPrediction.status === 'success' && !enhancedPredictionError && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
              className="bg-card border rounded-xl"
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: { xs: '0.5rem', sm: '0.75rem' },
                }}
              >
                Enhanced Prediction
              </Typography>
              
              {/* Prediction Details */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 700,
                    color: enhancedPrediction.prediction.change >= 0 ? '#10b981' : '#ef4444',
                    mb: 0.5,
                  }}
                >
                  ${enhancedPrediction.prediction.next_day_price.toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    color: isDark ? '#9ca3af' : '#6b7280',
                  }}
                >
                  Current: ${enhancedPrediction.prediction.current_price.toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    color: enhancedPrediction.prediction.change >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                  }}
                >
                  {enhancedPrediction.prediction.change >= 0 ? '+' : ''}
                  {enhancedPrediction.prediction.change.toFixed(2)} (
                  {enhancedPrediction.prediction.change >= 0 ? '+' : ''}
                  {enhancedPrediction.prediction.change_percentage.toFixed(2)}%)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    color: isDark ? '#9ca3af' : '#6b7280',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  Method: {enhancedPrediction.prediction.method}
                </Typography>
              </Box>

              {/* Model Information */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    fontWeight: 600,
                    color: isDark ? '#FFFFFF' : '#111827',
                    mb: 1,
                  }}
                >
                  Model Details
                </Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      color: isDark ? '#d1d5db' : '#374151',
                      mb: 0.5,
                    }}
                  >
                    <strong>Name:</strong> {enhancedPrediction.model.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      color: isDark ? '#d1d5db' : '#374151',
                      mb: 0.5,
                    }}
                  >
                    <strong>Type:</strong> {enhancedPrediction.model.type}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      color: isDark ? '#d1d5db' : '#374151',
                      mb: 0.5,
                    }}
                  >
                    <strong>Accuracy (R²):</strong> {enhancedPrediction.model.r2_score 
                      ? `${(enhancedPrediction.model.r2_score * 100).toFixed(2)}%` 
                      : 'N/A'}
                  </Typography>
                  {enhancedPrediction.model.training_r2_score !== null && enhancedPrediction.model.training_r2_score !== undefined && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: isDark ? '#9ca3af' : '#6b7280',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Training R²: {(enhancedPrediction.model.training_r2_score * 100).toFixed(2)}%
                    </Typography>
                  )}
                  {enhancedPrediction.model.live_r2_score !== null && enhancedPrediction.model.live_r2_score !== undefined && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: '#10b981',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Live R²: {(enhancedPrediction.model.live_r2_score * 100).toFixed(2)}% (from {enhancedPrediction.model.live_accuracy_stats?.evaluated_predictions || 0} predictions)
                    </Typography>
                  )}
                  {enhancedPrediction.model.live_accuracy_stats && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: isDark ? '#9ca3af' : '#6b7280',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Avg Accuracy: {(enhancedPrediction.model.live_accuracy_stats.average_accuracy * 100).toFixed(2)}% ({enhancedPrediction.model.live_accuracy_stats.evaluated_predictions}/{enhancedPrediction.model.live_accuracy_stats.total_predictions} evaluated)
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      color: isDark ? '#d1d5db' : '#374151',
                      mb: 0.5,
                    }}
                  >
                    <strong>Features:</strong> {enhancedPrediction.model.features.selected}/{enhancedPrediction.model.features.total} selected
                  </Typography>
                  {enhancedPrediction.model.features.top_features.length > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: isDark ? '#9ca3af' : '#6b7280',
                        display: 'block',
                        mt: 0.5,
                      }}
                    >
                      Top Features: {enhancedPrediction.model.features.top_features.slice(0, 3).join(', ')}
                    </Typography>
                  )}
                  {enhancedPrediction.model.fallback_available && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: '#10b981',
                        display: 'block',
                        mt: 0.5,
                      }}
                    >
                      ✓ Fallback model available
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Sentiment Analysis */}
              {(enhancedPrediction.sentiment.news_volume > 0 || 
                enhancedPrediction.sentiment.combined_sentiment !== 0) && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      fontWeight: 600,
                      color: isDark ? '#FFFFFF' : '#111827',
                      mb: 1,
                    }}
                  >
                    Sentiment Analysis
                  </Typography>
                  <Box sx={{ pl: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        color: isDark ? '#d1d5db' : '#374151',
                        mb: 0.5,
                      }}
                    >
                      <strong>Combined Sentiment:</strong> {enhancedPrediction.sentiment.combined_sentiment.toFixed(3)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        color: isDark ? '#d1d5db' : '#374151',
                        mb: 0.5,
                      }}
                    >
                      <strong>News Volume:</strong> {enhancedPrediction.sentiment.news_volume}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        color: isDark ? '#d1d5db' : '#374151',
                      }}
                    >
                      <strong>Sentiment Trend:</strong> {enhancedPrediction.sentiment.sentiment_trend.toFixed(3)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Detailed Model Info Section */}
          {modelInfo?.status === 'success' && !modelInfoError && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: { xs: '0.75rem', sm: '1rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                📊 Live Model Accuracy
              </Typography>

              {/* R² Score Comparison */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 2,
                mb: 2,
              }}>
                {/* Training R² Score */}
                <Box sx={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                      color: isDark ? '#93c5fd' : '#3b82f6',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Training R² Score
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontWeight: 700,
                      color: isDark ? '#60a5fa' : '#2563eb',
                      mt: 0.5,
                    }}
                  >
                    {modelInfo.model.training_r2_score != null 
                      ? `${(modelInfo.model.training_r2_score * 100).toFixed(2)}%` 
                      : 'N/A'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.65rem' },
                      color: isDark ? '#9ca3af' : '#6b7280',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    From historical test data
                  </Typography>
                </Box>

                {/* Live R² Score */}
                <Box sx={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                      color: isDark ? '#6ee7b7' : '#10b981',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Live R² Score
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontWeight: 700,
                      color: isDark ? '#34d399' : '#059669',
                      mt: 0.5,
                    }}
                  >
                    {modelInfo.model.live_r2_score != null 
                      ? `${(modelInfo.model.live_r2_score * 100).toFixed(2)}%` 
                      : 'N/A'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.65rem' },
                      color: isDark ? '#9ca3af' : '#6b7280',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    From actual predictions
                  </Typography>
                </Box>
              </Box>

              {/* Live Accuracy Stats */}
              {modelInfo.model.live_accuracy_stats && (
                <Box sx={{ 
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  mb: 2,
                }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      fontWeight: 600,
                      color: isDark ? '#FFFFFF' : '#111827',
                      mb: 1,
                    }}
                  >
                    Prediction Statistics
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 1,
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: isDark ? '#d1d5db' : '#374151',
                      }}
                    >
                      <strong>Total:</strong> {modelInfo.model.live_accuracy_stats.total_predictions}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: isDark ? '#d1d5db' : '#374151',
                      }}
                    >
                      <strong>Evaluated:</strong> {modelInfo.model.live_accuracy_stats.evaluated_predictions}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: isDark ? '#d1d5db' : '#374151',
                        gridColumn: 'span 2',
                      }}
                    >
                      <strong>Avg Accuracy:</strong>{' '}
                      <span style={{ color: isDark ? '#34d399' : '#059669', fontWeight: 600 }}>
                        {modelInfo.model.live_accuracy_stats.average_accuracy != null 
                          ? `${modelInfo.model.live_accuracy_stats.average_accuracy.toFixed(2)}%` 
                          : 'N/A'}
                      </span>
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Selected Features */}
              {modelInfo.model.selected_features && modelInfo.model.selected_features.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      fontWeight: 600,
                      color: isDark ? '#FFFFFF' : '#111827',
                      mb: 1,
                    }}
                  >
                    Top Selected Features ({modelInfo.model.selected_features_count}/{modelInfo.model.features_count})
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5,
                  }}>
                    {modelInfo.model.selected_features.slice(0, 5).map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                          border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: { xs: '0.6rem', sm: '0.65rem' },
                            color: isDark ? '#c4b5fd' : '#7c3aed',
                            fontFamily: 'monospace',
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Timestamp */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  color: isDark ? '#6b7280' : '#9ca3af',
                  display: 'block',
                  mt: 1.5,
                  textAlign: 'right',
                }}
              >
                Updated: {new Date(modelInfo.timestamp).toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Model Info Loading State */}
          {modelInfoLoading && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100px',
              }}
            >
              <CircularProgress size={20} />
              <Typography
                variant="body2"
                sx={{
                  ml: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  color: isDark ? '#9ca3af' : '#6b7280',
                }}
              >
                Loading model info...
              </Typography>
            </Box>
          )}

          {/* Enhanced Prediction Loading State */}
          {enhancedPredictionLoading && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '150px',
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Enhanced Prediction Error State */}
          {enhancedPredictionError && (
            <Box 
              sx={{ 
                flexShrink: 0, 
                marginTop: { xs: 1.5, sm: 2 },
                backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: { xs: '0.5rem', sm: '0.75rem' },
                }}
              >
                Enhanced Prediction
              </Typography>
              <Alert severity="warning" sx={{ mt: 1 }}>
                Unable to load enhanced prediction. Please try again later.
              </Alert>
            </Box>
          )}
        </Box>

        {/* Right Side: Chart */}
        <Box 
          sx={{
            flex: 1,
            minWidth: 0,
            width: { xs: '100%', lg: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            height: { xs: 'auto', lg: chartHeight },
          }}
        >
          {/* Controls and Currency Dropdown - Above Chart */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
              flexShrink: 0,
              gap: 1.5,
            }}
          >
            {/* Chart Controls - Left Side of Dropdown */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {/* Sidebar Toggle Button */}
              <Tooltip title="Chart Information" placement="top">
                <IconButton
                  size="small"
                  onClick={() => setSidebarOpen(true)}
                  sx={{
                    color: '#26d4b4',
                    backgroundColor: isDark ? 'rgba(38, 212, 180, 0.1)' : 'rgba(38, 212, 180, 0.1)',
                    border: `1px solid rgba(38, 212, 180, 0.3)`,
                    padding: { xs: '6px', sm: '8px' },
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(38, 212, 180, 0.2)' : 'rgba(38, 212, 180, 0.2)',
                      borderColor: 'rgba(38, 212, 180, 0.5)',
                    },
                  }}
                >
                  <TbWorldSearch size={18} style={{ width: '18px', height: '18px', color: '#26d4b4' }} />
                </IconButton>
              </Tooltip>

              {/* Zoom Controls */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  padding: { xs: '2px', sm: '4px' },
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#ddd'}`,
                }}
              >
                <Tooltip title="Zoom In" placement="top">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 5}
                      sx={{
                        color: isDark ? '#fff' : '#000',
                        padding: { xs: '4px', sm: '6px' },
                        '&:disabled': {
                          color: isDark ? '#555' : '#ccc',
                        },
                      }}
                    >
                      <ZoomIn fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Zoom Out" placement="top">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= -3}
                      sx={{
                        color: isDark ? '#fff' : '#000',
                        padding: { xs: '4px', sm: '6px' },
                        '&:disabled': {
                          color: isDark ? '#555' : '#ccc',
                        },
                      }}
                    >
                      <ZoomOut fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Reset Zoom" placement="top">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleResetZoom}
                      disabled={zoomLevel === 0}
                      sx={{
                        color: isDark ? '#fff' : '#000',
                        padding: { xs: '4px', sm: '6px' },
                        '&:disabled': {
                          color: isDark ? '#555' : '#ccc',
                        },
                      }}
                    >
                      <FitScreen fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Currency Dropdown - Right Side */}
            <CurrencyDropdown
              value={currencyUnit}
              onChange={onCurrencyUnitChange}
            />
          </Box>
          
          {/* Chart Sidebar */}
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            title="Chart Information"
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 2, sm: 2.5 },
              padding: { xs: 2, sm: 2.5 },
            }}>
              {/* Price Info Row - Current Price and Prediction Side by Side */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1.5,
                  justifyContent: 'space-between',
                }}
              >
                {/* Current Price Info */}
                <Box
                  sx={{
                    flex: 1,
                    padding: 1.25,
                    borderRadius: 1,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: '0.7rem',
                      marginBottom: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Current Price
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#F5D300',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    {convertedCurrentPrice.displayText}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? '#6b7280' : '#9ca3af',
                      fontSize: '0.65rem',
                      marginTop: 0.5,
                    }}
                  >
                    {convertedCurrentPrice.unit}
                  </Typography>
                </Box>

                {/* Prediction Info */}
                {convertedPredictionPrice && (
                  <Box
                    sx={{
                      flex: 1,
                      padding: 1.25,
                      borderRadius: 1,
                      backgroundColor: isDark ? 'rgba(38, 212, 180, 0.1)' : 'rgba(38, 212, 180, 0.05)',
                      border: `1px solid ${isDark ? 'rgba(38, 212, 180, 0.3)' : 'rgba(38, 212, 180, 0.2)'}`,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: isDark ? '#9ca3af' : '#6b7280',
                        fontSize: '0.7rem',
                        marginBottom: 0.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Next Day Prediction
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#26d4b4',
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {convertedPredictionPrice.displayText}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDark ? '#6b7280' : '#9ca3af',
                        fontSize: '0.65rem',
                        marginTop: 0.5,
                      }}
                    >
                      {displayData?.prediction?.next_day && new Date(displayData.prediction.next_day).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Exchange Rate Info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 1, borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? '#6b7280' : '#9ca3af',
                    fontSize: '0.6875rem',
                  }}
                >
                  USD/LKR Rate
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? '#9ca3af' : '#6b7280',
                    fontWeight: 500,
                    fontSize: '0.6875rem',
                  }}
                >
                  {usdToLkrRate.toFixed(2)}
                </Typography>
              </Box>

              {/* Prediction Reasons Section */}
              {convertedPredictionPrice && (
                <>
                  <Box 
                    sx={{ 
                      paddingTop: 2, 
                      borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      marginTop: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 1.5,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: isDark ? '#9ca3af' : '#6b7280',
                          fontSize: '0.95rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: '#26d4b4',
                            display: 'inline-block',
                            boxShadow: isDark 
                              ? '0 0 8px rgba(38, 212, 180, 0.6)' 
                              : '0 0 6px rgba(38, 212, 180, 0.4)',
                          }}
                        />
                        Prediction Analysis
                      </Typography>
                      <Tooltip
                        title="AI-generated explanation of the prediction"
                        arrow
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                              color: isDark ? '#e5e7eb' : '#111827',
                              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                              boxShadow: isDark 
                                ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                                : '0 4px 6px rgba(0, 0, 0, 0.1)',
                              '& .MuiTooltip-arrow': {
                                color: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                              },
                            },
                          },
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{
                            color: isDark ? '#9ca3af' : '#6b7280',
                            padding: '4px',
                            '&:hover': {
                              color: '#26d4b4',
                              backgroundColor: isDark ? 'rgba(38, 212, 180, 0.1)' : 'rgba(38, 212, 180, 0.08)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Info sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    {predictionReasonsLoading ? (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5, 
                          paddingY: 2,
                          paddingX: 1.5,
                          backgroundColor: isDark ? 'rgba(38, 212, 180, 0.05)' : 'rgba(38, 212, 180, 0.03)',
                          borderRadius: 1.5,
                          border: `1px solid ${isDark ? 'rgba(38, 212, 180, 0.15)' : 'rgba(38, 212, 180, 0.1)'}`,
                        }}
                      >
                        <CircularProgress 
                          size={18} 
                          sx={{ 
                            color: '#26d4b4',
                            filter: isDark ? 'drop-shadow(0 0 4px rgba(38, 212, 180, 0.5))' : 'none',
                          }} 
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark ? '#9ca3af' : '#6b7280',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                          }}
                        >
                          Generating analysis...
                        </Typography>
                      </Box>
                    ) : predictionReasonsError || !predictionReasonsData?.reasons ? (
                      <Box
                        sx={{
                          paddingY: 1.5,
                          paddingX: 1.5,
                          backgroundColor: isDark ? 'rgba(107, 114, 128, 0.05)' : 'rgba(156, 163, 175, 0.05)',
                          borderRadius: 1.5,
                          border: `1px solid ${isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(156, 163, 175, 0.15)'}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDark ? '#6b7280' : '#9ca3af',
                            fontSize: '0.8125rem',
                            fontStyle: 'italic',
                            textAlign: 'center',
                          }}
                        >
                          {predictionReasonsError 
                            ? (() => {
                                const error = predictionReasonsError as FetchBaseQueryError;
                                if (error?.data && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
                                  return (error.data as { message?: string }).message || 'Error loading analysis';
                                }
                                return 'Error loading analysis';
                              })()
                            : predictionReasonsData?.message || 'Analysis unavailable'}
                        </Typography>
                        {predictionReasonsError && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDark ? '#6b7280' : '#9ca3af',
                              fontSize: '0.75rem',
                              display: 'block',
                              marginTop: 0.5,
                              textAlign: 'center',
                            }}
                          >
                            Please check backend configuration or try again later.
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(38, 212, 180, 0.12) 0%, rgba(38, 212, 180, 0.06) 100%)'
                            : 'linear-gradient(135deg, rgba(38, 212, 180, 0.08) 0%, rgba(38, 212, 180, 0.03) 100%)',
                          border: `1px solid ${isDark ? 'rgba(38, 212, 180, 0.25)' : 'rgba(38, 212, 180, 0.18)'}`,
                          borderRadius: 2,
                          padding: 2,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #26d4b4, transparent)',
                            opacity: isDark ? 0.6 : 0.4,
                          },
                        }}
                      >
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{
                            color: isDark ? '#e5e7eb' : '#1f2937',
                            fontSize: '0.875rem',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-line',
                            '& ul, & ol': {
                              margin: 0,
                              paddingLeft: 2,
                            },
                            '& li': {
                              marginBottom: 0.875,
                              '&:last-child': {
                                marginBottom: 0,
                              },
                            },
                          }}
                        >
                          {predictionReasonsData.reasons.split('\n').map((line: string, index: number) => {
                            // Check if line is a bullet point
                            const isBullet = line.trim().startsWith('•') || 
                                           line.trim().startsWith('-') || 
                                           line.trim().startsWith('*') ||
                                           /^\d+\./.test(line.trim());
                            
                            if (isBullet || line.trim().length === 0) {
                              return (
                                <Box
                                  key={index}
                                  component="span"
                                  sx={{
                                    display: 'block',
                                    marginBottom: line.trim().length === 0 ? 0.75 : 1,
                                    paddingLeft: isBullet ? 0 : 0,
                                  }}
                                >
                                  {line.trim().length > 0 && (
                                    <Box
                                      component="span"
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'flex-start',
                                        gap: 1.25,
                                      }}
                                    >
                                      <Box
                                        component="span"
                                        sx={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          background: 'linear-gradient(135deg, #26d4b4, #20b89a)',
                                          marginTop: '7px',
                                          flexShrink: 0,
                                          boxShadow: isDark 
                                            ? '0 0 8px rgba(38, 212, 180, 0.5)' 
                                            : '0 0 6px rgba(38, 212, 180, 0.3)',
                                        }}
                                      />
                                      <Box 
                                        component="span" 
                                        sx={{ 
                                          flex: 1,
                                          color: isDark ? '#d1d5db' : '#374151',
                                        }}
                                      >
                                        {line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '')}
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              );
                            }
                            
                            return (
                              <Box
                                key={index}
                                component="span"
                                sx={{
                                  display: 'block',
                                  marginBottom: 1,
                                  color: isDark ? '#d1d5db' : '#374151',
                                }}
                              >
                                {line}
                              </Box>
                            );
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Sidebar>
          
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
          }}
        >
          <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <CircularProgress />
            </Box>
          }>
            <Chart
                key={`chart-${realtimePrice || displayData?.current_price || 0}-${currencyUnit}-${zoomLevel}`}
              data={chartData}
              {...(displayData?.prediction && 
                   displayData.prediction.predicted_price != null && 
                   typeof displayData.prediction.predicted_price === 'number' && 
                   isFinite(displayData.prediction.predicted_price)
                   ? { prediction: displayData.prediction } 
                   : {})}
              {...(displayData?.historical_predictions && 
                   Array.isArray(displayData.historical_predictions) && 
                   displayData.historical_predictions.length > 0
                   ? { 
                       historicalPredictions: (() => {
                         // Filter to show only last 60 days (2 months)
                         const sixtyDaysAgo = new Date();
                         sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                         const cutoffDate: string = sixtyDaysAgo.toISOString().split('T')[0] || '';
                         if (!cutoffDate) {
                           console.error('Failed to calculate cutoff date for historical predictions');
                           return [];
                         }
                         return displayData.historical_predictions.filter(p => 
                           p && p.date && p.date >= cutoffDate
                         );
                       })()
                     } 
                   : {})}
              isDark={isDark}
                height={chartHeight - (isMobile ? 50 : isTablet ? 60 : 70)}
              realtimePrice={realtimePrice || undefined}
              currencyUnit={currencyUnit}
              usdToLkrRate={usdToLkrRate}
                zoomLevel={zoomLevel}
            />
          </Suspense>
          </Box>
        </Box>
      </Box>

      {/* Real-time loading indicator */}
      {realtimeLoading && (
        <Box className="fixed bottom-4 right-4">
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Real-time error */}
      {realtimeError && (
        <Box className="fixed bottom-4 right-4">
          <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
            Real-time updates unavailable
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;

