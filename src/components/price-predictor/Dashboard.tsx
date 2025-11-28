import React, { useEffect, useState, useMemo, Suspense, lazy, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, useMediaQuery, useTheme as useMuiTheme, IconButton, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';
import { TbWorldSearch } from 'react-icons/tb';
import { 
  useGetDailyDataQuery, 
  useGetRealtimePriceQuery, 
  useGetExchangeRateQuery,
  useGetAccuracyVisualizationQuery,
  useGetPredictionHistoryQuery
} from '../../store/api/goldApi';
import { useTheme } from '../../hooks/useTheme';
import CurrencyDropdown, { type CurrencyUnit } from './CurrencyDropdown';
import { convertPrice, convertChartData } from '../../utils/currencyConverter';
import Sidebar from './Sidebar';

// Lazy load heavy components including Chart (Plotly is ~6-7MB)
const Chart = lazy(() => import('./Chart'));
const AccuracyStats = lazy(() => import('./AccuracyStats'));
const PredictionExplanation = lazy(() => import('./PredictionExplanation'));
const AccuracyVisualizationChart = lazy(() => import('./AccuracyVisualizationChart'));
const PredictionHistoryTable = lazy(() => import('./PredictionHistoryTable'));

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

  // Fetch daily data with extended history (request last 90 days to get data before Oct 5)
  // Calculate date 90 days ago to ensure we get more historical data
  const getDate90DaysAgo = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0] as string; // Format as YYYY-MM-DD
  };

  const startDate90DaysAgo = getDate90DaysAgo();

  const {
    data: dailyData,
    error: dailyError,
    isLoading: dailyLoading,
  } = useGetDailyDataQuery({ 
    days: 90, // Request 90 days to get more historical data
    start_date: startDate90DaysAgo, // Explicitly request from 90 days ago
  }, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  // Debug: Log data to see what dates we're receiving
  useEffect(() => {
    try {
      if (dailyData) {
        const marketDates = dailyData.data && Array.isArray(dailyData.data) 
          ? dailyData.data.map(d => d?.date).filter(Boolean).sort() 
          : [];
        const predictionDates = dailyData.historical_predictions && Array.isArray(dailyData.historical_predictions)
          ? dailyData.historical_predictions.map(p => p?.date).filter(Boolean).sort() 
          : [];
        
        // Count data points with predicted_price (from backend enhancement)
        const dataWithPredictions = dailyData.data && Array.isArray(dailyData.data)
          ? dailyData.data.filter(d => d && d.predicted_price != null).length 
          : 0;
        
        const allDates = [...new Set([...marketDates, ...predictionDates])].sort();
        const predictionsBeforeOct6 = predictionDates.filter(d => d && d < '2025-10-06');
        const dataBeforeOct6 = marketDates.filter(d => d && d < '2025-10-06');
        
        // Debug logging in development
        if (import.meta.env.DEV) {
          console.warn('📊 Chart Data (90-Day Extended):', {
            totalDataPoints: marketDates.length,
            totalPredictions: predictionDates.length,
            dataWithPredictedPrice: dataWithPredictions,
            dataBeforeOct6: dataBeforeOct6.length,
            predictionsBeforeOct6: predictionsBeforeOct6.length,
            marketDataRange: marketDates.length > 0 ? `${marketDates[0]} to ${marketDates[marketDates.length - 1]}` : 'No market data',
            predictionRange: predictionDates.length > 0 ? `${predictionDates[0]} to ${predictionDates[predictionDates.length - 1]}` : 'No predictions',
            fullDateRange: allDates.length > 0 ? `${allDates[0]} to ${allDates[allDates.length - 1]}` : 'No dates',
            note: 'Backend now includes predictions from Aug 7 and market data from July 23',
          });
        }
      }
    } catch (error) {
      console.error('Error in debug logging:', error);
    }
  }, [dailyData]);

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
  } = useGetAccuracyVisualizationQuery(undefined, {
    pollingInterval: 900000, // 15 minutes
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
      
      const updatedData = [...displayData.data];
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
  }, [displayData, displayData?.data, realtimePrice, currencyUnit, usdToLkrRate]);

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
  }, [displayData, displayData?.prediction?.predicted_price, currencyUnit, usdToLkrRate]);

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
              lg: 'calc(100vh - 240px)' 
            },
            overflowY: { xs: 'visible', lg: 'auto' },
            overflowX: 'hidden',
            pr: { xs: 0, lg: 2 },
            pb: 0,
            backgroundColor: isDark ? '#121212' : 'var(--background)',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              borderRadius: '5px',
              marginY: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              borderRadius: '5px',
              border: `2px solid ${isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
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
                    Lasso Regression
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

          {/* Accuracy Stats */}
          <Box sx={{ flexShrink: 0, mt: { xs: 0, lg: 0 } }}>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
                <CircularProgress size={24} />
              </Box>
            }>
              <AccuracyStats
                accuracyStats={displayData.accuracy_stats}
                isDark={isDark}
                {...(accuracyVisualizationData?.statistics ? { newStats: accuracyVisualizationData.statistics } : {})}
              />
            </Suspense>
          </Box>

          {/* Accuracy Visualization Chart */}
          {accuracyVisualizationData && accuracyVisualizationData.data && accuracyVisualizationData.data.length > 0 && (
            <Box sx={{ flexShrink: 0, marginTop: { xs: 1.5, sm: 2 } }}>
              <Suspense fallback={
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                  <CircularProgress size={24} />
                </Box>
              }>
                <AccuracyVisualizationChart
                  data={accuracyVisualizationData.data}
                  isDark={isDark}
                  height={400}
                />
              </Suspense>
            </Box>
          )}

          {/* Prediction History Table */}
          {predictionHistoryData && predictionHistoryData.predictions && !predictionHistoryError && (
            <Box sx={{ flexShrink: 0, marginTop: { xs: 1.5, sm: 2 } }}>
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

          {/* Prediction Explanation */}
          <Box sx={{ flexShrink: 0 }}>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
                <CircularProgress size={24} />
              </Box>
            }>
              <PredictionExplanation isDark={isDark} />
            </Suspense>
          </Box>
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
              gap: { xs: 1.5, sm: 2 } 
            }}>
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? '#cccccc' : '#666666',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                This sidebar can contain additional information, filters, or controls related to the chart.
              </Typography>
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
                   ? { historicalPredictions: displayData.historical_predictions } 
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

