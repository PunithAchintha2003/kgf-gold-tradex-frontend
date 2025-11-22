import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { Box, Typography, CircularProgress, Alert, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { useGetDailyDataQuery, useGetRealtimePriceQuery, useGetExchangeRateQuery } from '../store/api/goldApi';
import { useTheme } from '../hooks/useTheme';
import type { CurrencyUnit } from './CurrencyDropdown';
import { convertPrice, convertChartData } from '../utils/currencyConverter';

// Lazy load heavy components including Chart (Plotly is ~6-7MB)
// Wrap lazy imports to ensure they always return a valid component
const ChartFallback: React.FC = () => <div>Failed to load Chart</div>;
ChartFallback.displayName = 'ChartFallback';

const AccuracyStatsFallback: React.FC = () => <div>Failed to load AccuracyStats</div>;
AccuracyStatsFallback.displayName = 'AccuracyStatsFallback';

const Chart = lazy(() => 
  import('./Chart').catch((error) => {
    console.error('Failed to load Chart component:', error);
    return { default: ChartFallback };
  })
);
const AccuracyStats = lazy(() => 
  import('./AccuracyStats').catch((error) => {
    console.error('Failed to load AccuracyStats component:', error);
    return { default: AccuracyStatsFallback };
  })
);

interface DashboardProps {
  currencyUnit: CurrencyUnit;
}

const Dashboard: React.FC<DashboardProps> = ({ currencyUnit }) => {
  const { isDark } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [realtimePrice, setRealtimePrice] = useState<number | null>(null);
  
  // Calculate chart height based on screen size
  const chartHeight = useMemo(() => {
    if (isMobile) return 400;
    if (isTablet) return 500;
    return 600;
  }, [isMobile, isTablet]);

  // WebSocket connection disabled - using REST API polling instead
  const wsData = null;
  const wsConnected = false;
  const wsError = null;

  // Fetch daily data for last 2 months (60 days)
  const getDate60DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 60);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const {
    data: dailyData,
    error: dailyError,
    isLoading: dailyLoading,
  } = useGetDailyDataQuery({ 
    days: 60, // Request 60 days (2 months)
    start_date: getDate60DaysAgo(), // Explicitly request from 60 days ago
  }, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  // Debug: Log data to see what dates we're receiving
  useEffect(() => {
    // Data logging removed for production
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
  // FILTER TO SHOW ONLY LAST 60 DAYS (2 MONTHS)
  const chartData = useMemo(() => {
    if (!displayData?.data || !Array.isArray(displayData.data)) return [];
    
    // Calculate cutoff date (60 days ago from today)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];
    
    // Filter to only include data from last 60 days
    const filteredData = displayData.data.filter(d => d.date >= cutoffDateString);
    
    const updatedData = [...filteredData];
    if (realtimePrice && updatedData.length > 0) {
      // Update the last data point with real-time price (realtimePrice is always in USD)
      const lastDataPoint = updatedData[updatedData.length - 1];
      updatedData[updatedData.length - 1] = {
        ...lastDataPoint,
        close: realtimePrice
      };
    }
    
    // Convert data based on selected currency unit
    const convertedData = convertChartData(updatedData, currencyUnit, usdToLkrRate);
    
    return convertedData;
  }, [displayData?.data, realtimePrice, currencyUnit, usdToLkrRate]);

  // Filter historical predictions to show only last 60 days
  const filteredHistoricalPredictions = useMemo(() => {
    if (!displayData?.historical_predictions || !Array.isArray(displayData.historical_predictions)) return undefined;
    
    // Calculate cutoff date (60 days ago from today)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];
    
    // Filter to only include predictions from last 60 days
    return displayData.historical_predictions.filter(p => p.date >= cutoffDateString);
  }, [displayData?.historical_predictions]);

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
    <Box className="w-full">
      {/* Header */}
      <Typography 
        variant="h1" 
        className={`${isDark ? 'text-white' : 'text-black'} text-center mb-4`}
        sx={{
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '2.8rem' },
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: { xs: '0.75rem', sm: '1rem' },
          paddingX: { xs: '0.5rem', sm: 0 },
          color: isDark ? '#FFFFFF' : '#000000',
        }}
      >
        Gold Price Prediction
      </Typography>

      {/* Main Layout: Stats on Left, Chart on Right */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 1.5, sm: 2, lg: 3 },
          alignItems: { xs: 'stretch', lg: 'flex-start' },
          alignContent: 'flex-start',
        }}
      >
        {/* Left Side: Price Cards and Stats */}
        <Box 
          sx={{
            width: { xs: '100%', lg: '320px' },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1, sm: 1.5 },
            alignSelf: 'flex-start',
            marginTop: { xs: 0, lg: '2rem' },
          }}
        >
          {/* Price Information Cards */}
          <Box>
            <Box 
              sx={{ 
                backgroundColor: isDark ? '#111111' : '#FFFFFF',
                border: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
                borderRadius: '10px',
                padding: { xs: '0.75rem', sm: '1rem', lg: '1.25rem' },
              }}
            >
          {/* Grid layout for cards - 2 columns on left sidebar */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr' },
              gap: { xs: '0.5rem', sm: '0.75rem' },
            }}
          >
            {/* Current Price Card */}
            <Box 
              sx={{ 
                backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                borderRadius: '10px',
                padding: { xs: '0.75rem', sm: '1rem' },
                minHeight: { xs: '90px', sm: '100px', lg: '110px' },
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
                    minHeight: { xs: '100px', lg: '110px' },
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
                    minHeight: { xs: '100px', lg: '110px' },
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
                    minHeight: { xs: '100px', lg: '110px' },
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
          <Box>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            }>
              {displayData.accuracy_stats && (
                <AccuracyStats
                  accuracyStats={displayData.accuracy_stats}
                  isDark={isDark}
                />
              )}
            </Suspense>
          </Box>

        </Box>

        {/* Right Side: Chart */}
        <Box 
          sx={{
            flex: 1,
            minWidth: 0, // Allow flexbox to shrink
            width: { xs: '100%', lg: 'auto' },
            alignSelf: 'flex-start',
          }}
        >
          <Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" height={600}>
              <CircularProgress />
            </Box>
          }>
            <Chart
              key={`chart-${realtimePrice || displayData?.current_price || 0}-${currencyUnit}`}
              data={chartData || []}
              prediction={displayData.prediction}
              historicalPredictions={filteredHistoricalPredictions}
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

Dashboard.displayName = 'Dashboard';

export default Dashboard;
