import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { Box, Typography, CircularProgress, Alert, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { 
  useGetDailyDataQuery, 
  useGetRealtimePriceQuery, 
  useGetExchangeRateQuery,
  useGetAccuracyVisualizationQuery,
  useGetPredictionHistoryQuery
} from '../../store/api/goldApi';
import { useTheme } from '../../hooks/useTheme';
import type { CurrencyUnit } from './CurrencyDropdown';
import { convertPrice, convertChartData } from '../../utils/currencyConverter';

// Lazy load heavy components including Chart (Plotly is ~6-7MB)
const Chart = lazy(() => import('./Chart'));
const AccuracyStats = lazy(() => import('./AccuracyStats'));
const PredictionExplanation = lazy(() => import('./PredictionExplanation'));
const AccuracyVisualizationChart = lazy(() => import('./AccuracyVisualizationChart'));
const PredictionHistoryTable = lazy(() => import('./PredictionHistoryTable'));

interface DashboardProps {
  currencyUnit: CurrencyUnit;
}

const Dashboard: React.FC<DashboardProps> = ({ currencyUnit }) => {
  const { isDark } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [realtimePrice, setRealtimePrice] = useState<number | null>(null);
  
  // Calculate chart height to fit viewport with better balance
  const chartHeight = useMemo(() => {
    const viewportHeight = window.innerHeight;
    const headerHeight = 64; // Main app header
    const pageHeaderHeight = isMobile ? 60 : isTablet ? 70 : 80; // Title
    const padding = isMobile ? 30 : isTablet ? 50 : 60;
    const availableHeight = viewportHeight - headerHeight - pageHeaderHeight - padding;
    
    // Increased chart height - chart takes more space
    if (isMobile) {
      return Math.max(400, Math.min(500, availableHeight * 0.75));
    }
    if (isTablet) {
      return Math.max(500, Math.min(650, availableHeight * 0.8));
    }
    return Math.max(600, Math.min(750, availableHeight * 0.85));
  }, [isMobile, isTablet]);

  // WebSocket connection disabled - using REST API polling instead
  const wsData = null;
  const wsConnected = false;
  const wsError = null;

  // Fetch daily data with extended history (request last 90 days to get data before Oct 5)
  // Calculate date 90 days ago to ensure we get more historical data
  const getDate90DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const {
    data: dailyData,
    error: dailyError,
    isLoading: dailyLoading,
  } = useGetDailyDataQuery({ 
    days: 90, // Request 90 days to get more historical data
    start_date: getDate90DaysAgo(), // Explicitly request from 90 days ago
  }, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  // Debug: Log data to see what dates we're receiving
  useEffect(() => {
    if (dailyData) {
      const marketDates = dailyData.data ? dailyData.data.map(d => d.date).sort() : [];
      const predictionDates = dailyData.historical_predictions 
        ? dailyData.historical_predictions.map(p => p.date).sort() 
        : [];
      
      // Count data points with predicted_price (from backend enhancement)
      const dataWithPredictions = dailyData.data 
        ? dailyData.data.filter(d => d.predicted_price != null).length 
        : 0;
      
      const allDates = [...new Set([...marketDates, ...predictionDates])].sort();
      const predictionsBeforeOct6 = predictionDates.filter(d => d < '2025-10-06');
      const dataBeforeOct6 = marketDates.filter(d => d < '2025-10-06');
      
      console.log('📊 Chart Data (90-Day Extended):', {
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
    isLoading: accuracyVizLoading,
  } = useGetAccuracyVisualizationQuery(undefined, {
    pollingInterval: 900000, // 15 minutes
  });

  // Fetch prediction history
  const {
    data: predictionHistoryData,
    isLoading: predictionHistoryLoading,
  } = useGetPredictionHistoryQuery({ days: 30 }, {
    pollingInterval: 900000, // 15 minutes
  });

  // Use WebSocket data if available, otherwise fall back to REST API
  const displayData = wsData || dailyData;
  const displayError = wsError || dailyError;
  const displayLoading = !wsConnected && dailyLoading;

  // Use real-time price if available, otherwise fall back to daily data
  const currentPrice = realtimePrice || displayData?.current_price || 0;
  
  // Get exchange rate for conversion
  const usdToLkrRate = exchangeRateData?.exchange_rate || 300; // Fallback to 300 if API fails

  // Update real-time price when data changes
  useEffect(() => {
    if (realtimeData?.current_price) {
      setRealtimePrice(realtimeData.current_price);
    }
  }, [realtimeData]);


  // Update chart data with real-time price and convert based on currency unit
  const chartData = useMemo(() => {
    if (!displayData?.data) return [];
    
    const updatedData = [...displayData.data];
    if (realtimePrice && updatedData.length > 0) {
      // Update the last data point with real-time price (realtimePrice is always in USD)
      const lastDataPoint = updatedData[updatedData.length - 1];
      updatedData[updatedData.length - 1] = {
        ...lastDataPoint,
        close: realtimePrice
      };
    }
    
    // Convert data based on selected currency unit
    return convertChartData(updatedData, currencyUnit, usdToLkrRate);
  }, [displayData?.data, realtimePrice, currencyUnit, usdToLkrRate]);

  // Convert current price for display
  const convertedCurrentPrice = useMemo(() => {
    return convertPrice(currentPrice, currencyUnit, usdToLkrRate);
  }, [currentPrice, currencyUnit, usdToLkrRate]);

  // Convert prediction price for display
  const convertedPredictionPrice = useMemo(() => {
    if (!displayData?.prediction?.predicted_price) return null;
    return convertPrice(displayData.prediction.predicted_price, currencyUnit, usdToLkrRate);
  }, [displayData?.prediction?.predicted_price, currencyUnit, usdToLkrRate]);

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

  if (!displayData || displayData.status !== 'success') {
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
      className="w-full"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Typography 
        variant="h1" 
        className={`${isDark ? 'text-white' : 'text-black'} text-center`}
        sx={{
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: { xs: '1rem', sm: '1.5rem', md: '2rem' },
          paddingX: { xs: '0.5rem', sm: 0 },
          color: isDark ? '#FFFFFF' : '#000000',
          flexShrink: 0,
        }}
      >
        Gold Price Prediction
      </Typography>

      {/* Main Layout: Stats on Left, Chart on Right */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, sm: 2.5, lg: 3 },
          alignItems: { xs: 'stretch', lg: 'flex-start' },
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left Side: Price Cards and Stats */}
        <Box 
          sx={{
            width: { xs: '100%', lg: '380px' },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, sm: 2 },
            alignSelf: 'flex-start',
            overflowY: 'auto',
            maxHeight: '100%',
            height: '100%',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#555' : '#bbb',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: isDark ? '#666' : '#999',
            },
          }}
        >
          {/* Price Information Cards */}
          <Box>
            <Box 
              sx={{ 
                backgroundColor: isDark ? '#111111' : '#FFFFFF',
                border: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
                borderRadius: '10px',
                padding: { xs: '1rem', sm: '1.25rem', lg: '1.5rem' },
              }}
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
                backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                borderRadius: '10px',
                padding: { xs: '1rem', sm: '1.25rem' },
                minHeight: { xs: '100px', sm: '110px', lg: '120px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography 
                variant="body2" 
                className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
                sx={{ 
                  color: isDark ? '#cccccc' : '#666666',
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
                className="text-yellow-500 font-bold"
                sx={{ 
                  color: '#F5D300',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', lg: '1.5rem' },
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                }}
              >
                {convertedCurrentPrice.displayText}
              </Typography>
            </Box>

            {/* Prediction Card */}
            {displayData.prediction && displayData.prediction.predicted_price && (
              <>
                <Box 
                  sx={{ 
                    backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                    borderRadius: '10px',
                    padding: '1rem',
                    minHeight: { xs: '100px', lg: '120px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
                    sx={{ 
                      color: isDark ? '#cccccc' : '#666666',
                      fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    Next Day Prediction
                  </Typography>
                  <Typography 
                    variant="h6" 
                    className="text-prediction-green font-bold"
                    sx={{ 
                      color: '#26d4b4',
                      fontSize: { xs: '1rem', sm: '1.125rem', lg: '1.375rem' },
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                    }}
                  >
                    {convertedPredictionPrice?.displayText || `$${displayData.prediction.predicted_price.toFixed(2)}`}
                  </Typography>
                </Box>

                {/* Expected Change Card */}
                <Box 
                  sx={{ 
                    backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                    borderRadius: '10px',
                    padding: '1rem',
                    minHeight: { xs: '100px', lg: '120px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
                    sx={{ 
                      color: isDark ? '#cccccc' : '#666666',
                      fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    Expected Change
                  </Typography>
                  <Typography 
                    variant="body1" 
                    className="font-bold"
                    sx={{ 
                      color: (() => {
                        if (!convertedPredictionPrice) return '#666666';
                        const priceChange = convertedPredictionPrice.price - convertedCurrentPrice.price;
                        return priceChange >= 0 ? '#26d4b4' : '#ff4757';
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
                    backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                    borderRadius: '10px',
                    padding: '1rem',
                    minHeight: { xs: '100px', lg: '120px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
                    sx={{ 
                      color: isDark ? '#cccccc' : '#666666',
                      fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    Method
                  </Typography>
                  <Typography 
                    variant="body1" 
                    className={`${isDark ? 'text-gray-400' : 'text-gray-600'} font-bold`}
                    sx={{ 
                      color: isDark ? '#888888' : '#666666',
                      fontSize: { xs: '0.8125rem', sm: '0.875rem', lg: '1rem' },
                      fontWeight: 'bold',
                      lineHeight: 1.3,
                    }}
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
          <Box sx={{ flexShrink: 0 }}>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
                <CircularProgress size={24} />
              </Box>
            }>
              <AccuracyStats
                accuracyStats={displayData.accuracy_stats}
                isDark={isDark}
                newStats={accuracyVisualizationData?.statistics}
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
          {predictionHistoryData && predictionHistoryData.predictions && (
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
            alignSelf: 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" height={600}>
              <CircularProgress />
            </Box>
          }>
            <Chart
              key={`chart-${realtimePrice || displayData?.current_price || 0}-${currencyUnit}`}
              data={chartData}
              prediction={displayData.prediction}
              historicalPredictions={displayData.historical_predictions}
              isDark={isDark}
              height={chartHeight}
              realtimePrice={realtimePrice || undefined}
              currencyUnit={currencyUnit}
              usdToLkrRate={usdToLkrRate}
            />
          </Suspense>
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

