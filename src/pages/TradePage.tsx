import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Snackbar,
  CircularProgress,
  Divider,
  useTheme as useMuiTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  Skeleton,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, AttachMoney, ShowChart, History, Add, Remove } from '@mui/icons-material';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { createAppTheme } from '../theme/theme';
import { useApp } from '../contexts/AppContext';
import Sidebar from '../components/price-predictor/Sidebar';
import { 
  useGetSpotTradePriceQuery,
  usePlaceBuyOrderMutation,
  usePlaceSellOrderMutation,
  useGetSpotTradeBalanceQuery,
  useGetSpotTradeHistoryQuery,
  useGetSpotTradeWalletTransactionsQuery,
  useGetDailyDataQuery,
  useGetExchangeRateQuery,
  useDepositFundsMutation,
  useConfirmDepositMutation,
  useWithdrawFundsMutation,
} from '../store/api/goldApi';
import Chart from '../components/price-predictor/Chart';
import { convertChartData, PAWN_GRAMS } from '../utils/currencyConverter';

/** Status chip colors for wallet transactions in Transaction History sidebar */
function getWalletTransactionStatusChipSx(
  status: string,
  isDark: boolean,
): { backgroundColor: string; color: string } {
  switch (status) {
    case 'APPROVED':
      return isDark
        ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }
        : { backgroundColor: '#d1fae5', color: '#065f46' };
    case 'COMPLETED':
      return isDark
        ? { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }
        : { backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'PENDING':
      return isDark
        ? { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }
        : { backgroundColor: '#fef3c7', color: '#92400e' };
    default:
      return isDark
        ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }
        : { backgroundColor: '#fee2e2', color: '#991b1b' };
  }
}

const TradePage: React.FC = () => {
  const { isDark, mode } = useTheme();
  const { isAuthenticated } = useApp();
  const muiTheme = useMuiTheme();
  const theme = createAppTheme(mode);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));

  // State
  const [quantity, setQuantity] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState<'deposit' | 'withdraw' | 'transactions' | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankAccountName, setBankAccountName] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // API Queries
  const { data: priceData, isLoading: priceLoading } = useGetSpotTradePriceQuery(undefined, {
    pollingInterval: 2000, // Poll every 2 seconds for real-time updates (like predictor page)
  });

  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useGetSpotTradeBalanceQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 10000, // Poll every 10 seconds
  });

  const { data: historyData, isLoading: historyLoading } = useGetSpotTradeHistoryQuery(
    { limit: 20, offset: 0 },
    {
      skip: !isAuthenticated,
    },
  );

  const { data: walletTransactionData, isLoading: walletTransactionLoading } = useGetSpotTradeWalletTransactionsQuery(
    { limit: 50, offset: 0 },
    {
      skip: !isAuthenticated,
    },
  );

  // Fetch daily data for the last 30 days - for trade page chart
  // Calculate date 30 days ago
  const getDate30DaysAgo = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0] as string; // Format as YYYY-MM-DD
  };

  const startDate30DaysAgo = getDate30DaysAgo();

  // Get daily data for chart - with polling like predictor page
  const { data: dailyData } = useGetDailyDataQuery({ 
    days: 30, // Request 30 days of data for trade page
    start_date: startDate30DaysAgo, // Explicitly request from 30 days ago
  }, {
    pollingInterval: 10000, // Poll every 10 seconds (like predictor page)
  });
  
  const { data: exchangeRateData } = useGetExchangeRateQuery({ from: 'USD', to: 'LKR' }, {
    pollingInterval: 30000, // Poll every 30 seconds (like predictor page)
  });

  // Mutations
  const [placeBuyOrder, { isLoading: buyLoading }] = usePlaceBuyOrderMutation();
  const [placeSellOrder, { isLoading: sellLoading }] = usePlaceSellOrderMutation();
  const [depositFunds, { isLoading: depositLoading }] = useDepositFundsMutation();
  const [confirmDeposit] = useConfirmDepositMutation();
  const [withdrawFunds, { isLoading: withdrawLoading }] = useWithdrawFundsMutation();

  // Handle redirect from Stripe success/cancel pages.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const depositStatus = params.get('deposit');
    const sessionId = params.get('session_id');

    if (!depositStatus) return;

    const cleanupUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('deposit');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    };

    if (depositStatus === 'cancelled') {
      toast.error('Deposit was cancelled');
      cleanupUrl();
      return;
    }

    if (depositStatus === 'success' && sessionId) {
      void (async () => {
        try {
          await confirmDeposit({ session_id: sessionId }).unwrap();
          toast.success('Deposit completed successfully');
          refetchBalance();
        } catch (err: unknown) {
          const message =
            err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'detail' in err.data
              ? String((err.data as { detail: unknown }).detail)
              : 'Deposit confirmation pending. Balance will update shortly.';
          toast.error(message);
        } finally {
          cleanupUrl();
        }
      })();
    }
  }, [confirmDeposit, refetchBalance]);


  // Chart data - update last point with real-time price like predictor page
  const chartData = useMemo(() => {
    if (!dailyData?.data || !exchangeRateData?.exchange_rate) return [];
    
    // Convert data to pawn
    const convertedData = convertChartData(dailyData.data, 'pawn', exchangeRateData.exchange_rate);
    
    // Update the last data point with real-time price if available (like predictor page)
    if (priceData?.current_price_lkr && typeof priceData.current_price_lkr === 'number' && isFinite(priceData.current_price_lkr) && convertedData.length > 0) {
      const updatedData = [...convertedData];
      const lastDataPoint = updatedData[updatedData.length - 1];
      if (lastDataPoint && typeof lastDataPoint === 'object') {
        updatedData[updatedData.length - 1] = {
          ...lastDataPoint,
          close: priceData.current_price_lkr, // Update with current price in LKR per pawn
          high: Math.max(lastDataPoint.high || priceData.current_price_lkr, priceData.current_price_lkr),
          low: Math.min(lastDataPoint.low || priceData.current_price_lkr, priceData.current_price_lkr),
        };
      }
      return updatedData;
    }
    
    return convertedData;
  }, [dailyData, exchangeRateData, priceData?.current_price_lkr]);

  const usdToLkrRate = exchangeRateData?.exchange_rate || 300;

  // Calculate order total (quantity entered in grams; API price is per pawn)
  const orderTotal = useMemo(() => {
    if (!quantity || !priceData) return 0;
    const grams = parseFloat(quantity);
    if (Number.isNaN(grams) || grams <= 0) return 0;
    // Use buy price per pawn to estimate order total; convert to per-gram price
    const buyPricePerPawn = priceData.buy_price_lkr || priceData.current_price_lkr;
    if (!buyPricePerPawn || buyPricePerPawn <= 0) return 0;
    const pricePerGram = buyPricePerPawn / PAWN_GRAMS;
    return grams * pricePerGram;
  }, [quantity, priceData]);

  // Calculate max buyable quantity (in grams)
  const maxBuyable = useMemo(() => {
    if (!balanceData || !priceData) return 0;
    const buyPricePerPawn = priceData.buy_price_lkr || priceData.current_price_lkr;
    if (!buyPricePerPawn || buyPricePerPawn <= 0) return 0;
    const pricePerGram = buyPricePerPawn / PAWN_GRAMS;
    return balanceData.lkr_balance / pricePerGram;
  }, [balanceData, priceData]);

  // Calculate max sellable quantity (in grams; balance is returned in pawn)
  const maxSellable = useMemo(() => {
    if (!balanceData) return 0;
    return balanceData.gold_balance * PAWN_GRAMS;
  }, [balanceData]);

  // Minimum buy is 0.5 g (for "You can buy up to" only when >= this)
  const MIN_GOLD_GRAMS = 0.5;

  // Quick fill functions
  const fillMaxBuy = useCallback(() => {
    if (maxBuyable > 0) {
      setQuantity(maxBuyable.toFixed(4));
    }
  }, [maxBuyable]);


  const fillPercentage = useCallback((percentage: number, isBuy: boolean) => {
    const max = isBuy ? maxBuyable : maxSellable;
    if (max > 0) {
      setQuantity((max * percentage).toFixed(4));
    }
  }, [maxBuyable, maxSellable]);

  // Handle BUY order
  const handleBuy = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('You need to register or login to trade.');
      return;
    }

    if (!quantity) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid quantity in grams',
        severity: 'error',
      });
      return;
    }

    const grams = parseFloat(quantity);
    if (Number.isNaN(grams) || grams <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid quantity in grams',
        severity: 'error',
      });
      return;
    }

    // Enforce 0.5–50 g range
    if (grams < 0.5 || grams > 50) {
      toast.error('Quantity must be between 0.5 and 50 grams');
      return;
    }

    // Enforce 0.5g step (circular numbers like 0.5, 1.0, 1.5, ...)
    const multipleOfHalfSell = Math.round(grams * 2) / 2;
    if (Math.abs(grams - multipleOfHalfSell) > 1e-6) {
      toast.error('Quantity must be in steps of 0.5 grams (e.g. 0.5, 1.0, 1.5, ..., 50)');
      return;
    }

    // Enforce 0.5g step (circular numbers like 0.5, 1.0, 1.5, ...)
    const multipleOfHalfBuy = Math.round(grams * 2) / 2;
    if (Math.abs(grams - multipleOfHalfBuy) > 1e-6) {
      toast.error('Quantity must be in steps of 0.5 grams (e.g. 0.5, 1.0, 1.5, ..., 50)');
      return;
    }

    if (grams > maxBuyable) {
      setSnackbar({
        open: true,
        message: `Insufficient LKR balance. Maximum: ${maxBuyable.toFixed(2)} grams`,
        severity: 'error',
      });
      return;
    }

    if (!balanceData || balanceData.lkr_balance < orderTotal) {
      setSnackbar({
        open: true,
        message: `Insufficient LKR balance. Required: ${formatCurrency(orderTotal)}, Available: ${formatCurrency(balanceData?.lkr_balance || 0)}`,
        severity: 'error',
      });
      return;
    }

    try {
      const quantityPawn = grams / PAWN_GRAMS;
      await placeBuyOrder({ quantity: quantityPawn }).unwrap();
      const buyPricePerPawn = priceData?.buy_price_lkr || priceData?.current_price_lkr || 0;
      const buyPricePerGram = buyPricePerPawn > 0 ? buyPricePerPawn / PAWN_GRAMS : 0;
      setSnackbar({
        open: true,
        message: `✅ Successfully bought ${grams.toFixed(2)} grams at ${formatCurrency(buyPricePerGram)}/g`,
        severity: 'success',
      });
      setQuantity('');
      refetchBalance();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { detail?: string } }).data?.detail
        : error && typeof error === 'object' && 'message' in error
        ? (error as { message?: string }).message
        : 'Failed to place buy order';
      setSnackbar({
        open: true,
        message: errorMessage || 'Failed to place buy order',
        severity: 'error',
      });
    }
  }, [isAuthenticated, quantity, balanceData, orderTotal, maxBuyable, placeBuyOrder, refetchBalance, priceData]);

  // Handle SELL order
  const handleSell = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('You need to register or login to trade.');
      return;
    }

    if (!quantity) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid quantity in grams',
        severity: 'error',
      });
      return;
    }

    const grams = parseFloat(quantity);
    if (Number.isNaN(grams) || grams <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid quantity in grams',
        severity: 'error',
      });
      return;
    }

    // Enforce 0.5–50 g range
    if (grams < 0.5 || grams > 50) {
      toast.error('Quantity must be between 0.5 and 50 grams');
      return;
    }

    if (grams > maxSellable) {
      setSnackbar({
        open: true,
        message: `Insufficient gold balance. Maximum: ${maxSellable.toFixed(2)} grams`,
        severity: 'error',
      });
      return;
    }

    const quantityPawn = grams / PAWN_GRAMS;
    if (!balanceData || balanceData.gold_balance < quantityPawn) {
      const availableGrams = (balanceData?.gold_balance ?? 0) * PAWN_GRAMS;
      setSnackbar({
        open: true,
        message: `Insufficient gold balance. Required: ${grams.toFixed(2)} grams, Available: ${availableGrams.toFixed(2)} grams`,
        severity: 'error',
      });
      return;
    }

    try {
      await placeSellOrder({ quantity: quantityPawn }).unwrap();
      const sellPricePerPawn = priceData?.sell_price_lkr || priceData?.current_price_lkr || 0;
      const sellPricePerGram = sellPricePerPawn > 0 ? sellPricePerPawn / PAWN_GRAMS : 0;
      const sellValue = grams * sellPricePerGram;
      setSnackbar({
        open: true,
        message: `✅ Successfully sold ${grams.toFixed(2)} grams at ${formatCurrency(sellPricePerGram)}/g for ${formatCurrency(sellValue)}`,
        severity: 'success',
      });
      setQuantity('');
      refetchBalance();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { detail?: string } }).data?.detail
        : error && typeof error === 'object' && 'message' in error
        ? (error as { message?: string }).message
        : 'Failed to place sell order';
      setSnackbar({
        open: true,
        message: errorMessage || 'Failed to place sell order',
        severity: 'error',
      });
    }
  }, [isAuthenticated, quantity, balanceData, maxSellable, placeSellOrder, refetchBalance, priceData]);

  // Format currency with compact suffix (K/M)
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `LKR ${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `LKR ${(value / 1000).toFixed(2)}K`;
    }
    return `LKR ${value.toFixed(2)}`;
  };

  // Format currency with full amount (no K/M suffix)
  const formatCurrencyFull = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return 'LKR 0';
    return `LKR ${Math.round(value).toLocaleString('en-LK')}`;
  };

  // Format currency for order total in Place Order (no K/M suffix, always rounded up)
  const formatCurrencyOrderTotal = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return 'LKR 0';
    const rounded = Math.ceil(value);
    return `LKR ${rounded.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Format gold quantity (in grams)
  const formatGold = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '0.000 g';
    return `${value.toFixed(3)} g`;
  };

  const formatDateTime = (dateValue: string) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  // Calculate chart height to match sidebar height - both should align at bottom
  const chartHeight = useMemo(() => {
    if (typeof window === 'undefined') return 600;
    
    const viewportHeight = window.innerHeight;
    const headerHeight = 64; // Main app header
    const pageHeaderHeight = isMobile ? 100 : isTablet ? 120 : 140; // Title + description + spacing
    const controlsBoxHeight = isMobile ? 50 : isTablet ? 60 : 70; // Controls box height (Deposit/Withdraw buttons)
    const topPadding = isMobile ? 32 : isTablet ? 40 : 48; // Top padding (pt-8 = 32px)
    const containerPadding = 16; // Container px-4 = 16px
    
    if (isMobile) {
      const availableHeight = viewportHeight - headerHeight - pageHeaderHeight - controlsBoxHeight - topPadding - containerPadding;
      return Math.max(400, availableHeight);
    }
    if (isTablet) {
      const availableHeight = viewportHeight - headerHeight - pageHeaderHeight - controlsBoxHeight - topPadding - containerPadding;
      return Math.max(500, availableHeight);
    }
    // Desktop: match sidebar maxHeight exactly (calc(100vh - 240px))
    const sidebarHeight = viewportHeight - 240;
    return Math.max(600, sidebarHeight);
  }, [isMobile, isTablet]);

  return (
    <div className="h-screen overflow-hidden pt-8 pb-0">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">Spot Trading</h1>
          <p className="text-muted-foreground">
            Trade gold at live market prices in LKR
          </p>
        </div>
        
        {/* Wrap Dashboard with MUI ThemeProvider for its internal MUI components */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="w-full flex-1 min-h-0 overflow-hidden">
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

      {/* Main Layout: Trading Panel on Left, Chart on Right */}
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
        {/* Left Side: Trading Panel */}
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
          {/* Price Information Card */}
          <Box 
            sx={{ 
              flexShrink: 0, 
              marginTop: { xs: 0, sm: 0 },
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
              Price Information
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
              Current gold price and trading spread
            </Typography>

            {/* Current Price Card */}
            <Box 
              sx={{ 
                backgroundColor: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(245, 211, 0, 0.05)',
                border: `1px solid ${isDark ? 'rgba(245, 211, 0, 0.3)' : 'rgba(245, 211, 0, 0.2)'}`,
                borderRadius: '8px',
                padding: { xs: '0.75rem', sm: '1rem' },
                minHeight: { xs: '100px', sm: '110px', lg: '120px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
                {priceLoading ? (
                  <Skeleton variant="text" width="60%" height={40} />
                ) : priceData ? (
                  <>
                    <Typography variant="caption" sx={{ color: isDark ? '#fbbf24' : '#d97706', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Current Market Price
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#F5D300', fontWeight: 700, marginY: 1 }}>
                      {formatCurrencyFull(priceData.current_price_lkr)} / 8 grams
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, marginTop: 1.5, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', fontSize: '0.65rem' }}>
                          Buy Price
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDark ? '#34d399' : '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>
                          {formatCurrencyFull(priceData.buy_price_lkr)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', fontSize: '0.65rem' }}>
                          Sell Price
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDark ? '#fca5a5' : '#ef4444', fontWeight: 600, fontSize: '0.875rem' }}>
                          {formatCurrencyFull(priceData.sell_price_lkr)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: isDark ? '#cccccc' : '#666666', display: 'block' }}>
                          Spread
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDark ? '#888888' : '#999999', fontWeight: 600 }}>
                          {formatCurrencyFull(priceData.spread_lkr)}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666666' }}>
                    Loading price...
                  </Typography>
                )}
            </Box>
          </Box>

          {/* Balance Card */}
          <Box 
            sx={{ 
              flexShrink: 0,
              backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
              borderRadius: '12px',
              padding: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: { xs: '0.75rem', sm: '1rem' } }}>
              <AccountBalance sx={{ marginRight: 1, color: isDark ? '#FFFFFF' : '#111827', fontSize: 20 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                }}
              >
                Your Balance
              </Typography>
            </Box>
            {!isAuthenticated ? (
              <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                Sign in to view your balance
              </Typography>
            ) : balanceLoading ? (
              <Box>
                <Skeleton variant="text" width="80%" height={30} />
                <Skeleton variant="text" width="60%" height={30} />
              </Box>
            ) : balanceData ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ marginRight: 1, color: isDark ? '#34d399' : '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: '0.875rem' }}>
                      LKR Balance
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: isDark ? '#34d399' : '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                    {formatCurrency(balanceData.lkr_balance)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShowChart sx={{ marginRight: 1, color: '#F5D300', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: '0.875rem' }}>
                      Gold Balance
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#F5D300', fontWeight: 700, fontSize: '1rem' }}>
                    {formatGold(balanceData.gold_balance * PAWN_GRAMS)}
                  </Typography>
                </Box>
                <Divider sx={{ marginY: 1.5, borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: 600, fontSize: '0.875rem' }}>
                    Total Portfolio Value
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#F5D300', fontWeight: 700, fontSize: '1rem' }}>
                    {formatCurrency(balanceData.total_value_lkr)}
                  </Typography>
                </Box>
                {maxBuyable >= MIN_GOLD_GRAMS && (
                  <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginTop: 1, fontSize: '0.75rem' }}>
                    You can buy up to {formatGold(maxBuyable)}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                Loading balance...
              </Typography>
            )}
          </Box>

          {/* Trading Panel */}
          <Box 
            sx={{ 
              flexShrink: 0,
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
              }}
            >
              Place Order
            </Typography>

              {/* Quantity Input */}
              <Box sx={{ marginBottom: 2 }}>
                <TextField
                  fullWidth
                  label="Quantity (grams)"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                      setQuantity(val);
                    }
                  }}
                  InputProps={{
                    inputProps: { min: 0.5, max: 50, step: 0.5 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" sx={{ color: isDark ? '#888888' : '#999999' }}>
                          g
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    quantity && parseFloat(quantity) > 0
                      ? `Total: ${formatCurrencyOrderTotal(orderTotal)}`
                      : 'Enter quantity between 0.5 and 50 grams (steps of 0.5g)'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
                      '& fieldset': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                      },
                      '&:hover fieldset': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isDark ? '#F5D300' : '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: isDark ? '#9ca3af' : '#6b7280',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: isDark ? '#F5D300' : '#1976d2',
                    },
                    '& .MuiInputBase-input': {
                      color: isDark ? '#FFFFFF' : '#111827',
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDark ? '#9ca3af' : '#6b7280',
                    },
                  }}
                />
                
                {/* Quick Fill Buttons */}
                <Box sx={{ display: 'flex', gap: 1, marginTop: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillPercentage(0.25, true)}
                    disabled={!maxBuyable || maxBuyable <= 0}
                    sx={{ 
                      fontSize: '0.75rem', 
                      paddingX: 1,
                      color: isDark ? '#9ca3af' : '#6b7280',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                      '&:hover': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      },
                      '&.Mui-disabled': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af',
                      },
                    }}
                  >
                    25%
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillPercentage(0.5, true)}
                    disabled={!maxBuyable || maxBuyable <= 0}
                    sx={{ 
                      fontSize: '0.75rem', 
                      paddingX: 1,
                      color: isDark ? '#9ca3af' : '#6b7280',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                      '&:hover': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      },
                      '&.Mui-disabled': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af',
                      },
                    }}
                  >
                    50%
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillPercentage(0.75, true)}
                    disabled={!maxBuyable || maxBuyable <= 0}
                    sx={{ 
                      fontSize: '0.75rem', 
                      paddingX: 1,
                      color: isDark ? '#9ca3af' : '#6b7280',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                      '&:hover': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      },
                      '&.Mui-disabled': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af',
                      },
                    }}
                  >
                    75%
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={fillMaxBuy}
                    disabled={!maxBuyable || maxBuyable <= 0}
                    sx={{ 
                      fontSize: '0.75rem', 
                      paddingX: 1,
                      color: isDark ? '#9ca3af' : '#6b7280',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                      '&:hover': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      },
                      '&.Mui-disabled': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af',
                      },
                    }}
                  >
                    Max
                  </Button>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={buyLoading ? <CircularProgress size={20} color="inherit" /> : <TrendingUp />}
                  onClick={handleBuy}
                  disabled={!!(buyLoading || sellLoading || !quantity || parseFloat(quantity) <= 0 || (balanceData && balanceData.lkr_balance < orderTotal))}
                  sx={{
                    backgroundColor: isDark ? '#10b981' : '#10b981',
                    color: '#FFFFFF',
                    '&:hover': { 
                      backgroundColor: isDark ? '#059669' : '#059669',
                      boxShadow: isDark ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.5)',
                      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                    },
                    paddingY: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: isDark ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  {buyLoading ? 'Processing...' : `BUY GOLD`}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={sellLoading ? <CircularProgress size={20} color="inherit" /> : <TrendingDown />}
                  onClick={handleSell}
                  disabled={Boolean(
                    buyLoading ||
                      sellLoading ||
                      !quantity ||
                      parseFloat(quantity) <= 0 ||
                      (balanceData && balanceData.gold_balance < parseFloat(quantity || '0') / PAWN_GRAMS)
                  )}
                  sx={{
                    backgroundColor: isDark ? '#ef4444' : '#ef4444',
                    color: '#FFFFFF',
                    '&:hover': { 
                      backgroundColor: isDark ? '#f87171' : '#dc2626',
                      boxShadow: isDark ? '0 4px 12px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.5)',
                      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                    },
                    paddingY: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: isDark ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {sellLoading ? 'Processing...' : `SELL GOLD`}
                </Button>
              </Box>
          </Box>

          {/* Recent Trades */}
          <Box 
            sx={{ 
              flexShrink: 0,
              backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
              borderRadius: '12px',
              padding: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: { xs: '0.75rem', sm: '1rem' } }}>
              <History sx={{ marginRight: 1, color: isDark ? '#FFFFFF' : '#111827', fontSize: 20 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#111827',
                }}
              >
                Recent Trades
              </Typography>
            </Box>
              {!isAuthenticated ? (
                <Box sx={{ textAlign: 'center', padding: 3 }}>
                  <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                    Sign in to view your trade history
                  </Typography>
                </Box>
              ) : historyLoading ? (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ marginBottom: 1, borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ marginBottom: 1, borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                </Box>
              ) : historyData?.trades && historyData.trades.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.875rem', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }}>Type</TableCell>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.875rem', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }}>Quantity</TableCell>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.875rem', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }}>Price</TableCell>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.875rem', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData.trades.slice(0, 5).map((trade) => (
                        <TableRow key={trade.id} hover>
                          <TableCell>
                            <Chip
                              label={trade.order_type}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                backgroundColor: trade.order_type === 'BUY' 
                                  ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5')
                                  : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
                                color: trade.order_type === 'BUY'
                                  ? (isDark ? '#10b981' : '#065f46')
                                  : (isDark ? '#ef4444' : '#991b1b'),
                                border: `1px solid ${trade.order_type === 'BUY'
                                  ? (isDark ? 'rgba(16, 185, 129, 0.3)' : '#10b981')
                                  : (isDark ? 'rgba(239, 68, 68, 0.3)' : '#ef4444')}`,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: '0.875rem', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }}>
                            {formatGold(trade.quantity * PAWN_GRAMS)}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: '0.875rem', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }}>
                            {formatCurrency(trade.price)}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.875rem', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }}>
                            {formatCurrency(trade.total_value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', padding: 3 }}>
                  <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                    No trades yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginTop: 1, fontSize: '0.75rem' }}>
                    Your trading history will appear here
                  </Typography>
                </Box>
              )}
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
          {/* Controls Above Chart - Deposit and Withdraw Buttons */}
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
            {/* Deposit and Withdraw Buttons */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('You need to register or login to view transaction history.');
                    return;
                  }
                  setSidebarType('transactions');
                  setSidebarOpen(true);
                }}
                sx={{
                  color: isDark ? '#93c5fd' : '#2563eb',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  padding: { xs: '4px 8px', sm: '6px 12px' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)',
                  },
                }}
              >
                Transactions
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('You need to register or login to deposit funds.');
                    return;
                  }
                  setSidebarType('deposit');
                  setSidebarOpen(true);
                }}
                sx={{
                  color: isDark ? '#34d399' : '#10b981',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  padding: { xs: '4px 8px', sm: '6px 12px' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.5)',
                  },
                }}
              >
                Deposit
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('You need to register or login to withdraw funds.');
                    return;
                  }
                  setSidebarType('withdraw');
                  setSidebarOpen(true);
                }}
                sx={{
                  color: isDark ? '#fca5a5' : '#ef4444',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: { xs: '4px 8px', sm: '6px 12px' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                  },
                }}
              >
                Withdraw
              </Button>
            </Box>
          </Box>
          
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {chartData.length > 0 ? (
              <Chart
                data={chartData}
                isDark={isDark}
                height={chartHeight - (isMobile ? 50 : isTablet ? 60 : 70)}
                realtimePrice={priceData?.current_price_lkr}
                currencyUnit="pawn"
                usdToLkrRate={usdToLkrRate}
                buyPrice={priceData?.buy_price_lkr}
                sellPrice={priceData?.sell_price_lkr}
                prediction={undefined}
                historicalPredictions={undefined}
                showAccuracyLine={false}
                showPredictionLine={false}
                realtimePriceAlreadyConverted={true}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Deposit/Withdraw Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false);
          setSidebarType(null);
          setDepositAmount('');
          setWithdrawAmount('');
          setBankName('');
          setBankAccountNumber('');
          setBankAccountName('');
        }}
        title={
          sidebarType === 'deposit'
            ? 'Deposit Funds'
            : sidebarType === 'withdraw'
            ? 'Withdraw Funds'
            : sidebarType === 'transactions'
            ? 'Transaction History'
            : 'Transaction'
        }
        width={400}
      >
        {sidebarType === 'deposit' && (
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: 3,
                fontSize: '0.875rem',
                lineHeight: 1.6,
              }}
            >
              Deposit LKR to your trading account to buy gold. Minimum deposit amount is LKR 5,000.
            </Typography>
            <TextField
              fullWidth
              label="Deposit Amount (LKR)"
              type="number"
              placeholder="Enter amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              inputProps={{ min: 5000, step: 500 }}
              sx={{
                marginBottom: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDark ? '#10b981' : '#10b981',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? '#9ca3af' : '#6b7280',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: isDark ? '#10b981' : '#10b981',
                },
                '& .MuiInputBase-input': {
                  color: isDark ? '#FFFFFF' : '#111827',
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={depositLoading || !depositAmount || parseFloat(depositAmount) < 5000}
              startIcon={depositLoading ? <CircularProgress size={20} color="inherit" /> : <Add />}
              onClick={async () => {
                if (!isAuthenticated) {
                  toast.error('You need to register or login to deposit funds.');
                  return;
                }
                const amount = parseFloat(depositAmount);
                if (Number.isNaN(amount) || amount < 5000) {
                  toast.error('Please enter at least 5,000 LKR');
                  return;
                }
                try {
                  const checkout = await depositFunds({ amount }).unwrap();
                  if (!checkout?.checkout_url) {
                    throw new Error('Unable to initiate Stripe checkout');
                  }
                  toast.success('Redirecting to secure Stripe checkout...');
                  window.location.href = checkout.checkout_url;
                  setDepositAmount('');
                  refetchBalance();
                  setSidebarOpen(false);
                  setSidebarType(null);
                } catch (err: unknown) {
                  const message = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'detail' in err.data
                    ? String((err.data as { detail: unknown }).detail)
                    : 'Deposit failed';
                  toast.error(message);
                }
              }}
              sx={{
                backgroundColor: isDark ? '#10b981' : '#10b981',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: isDark ? '#059669' : '#059669',
                  boxShadow: isDark ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                },
                paddingY: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Deposit
            </Button>
          </Box>
        )}
        {sidebarType === 'withdraw' && (
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: 3,
                fontSize: '0.875rem',
                lineHeight: 1.6,
              }}
            >
              Withdraw LKR from your trading account.
            </Typography>
            <Box sx={{ marginBottom: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: 1,
                  fontSize: '0.875rem',
                }}
              >
                Available Balance
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: isDark ? '#34d399' : '#10b981',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                }}
              >
                {balanceData ? formatCurrency(balanceData.lkr_balance) : 'Loading...'}
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Withdraw Amount (LKR)"
              type="number"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              inputProps={{ min: 5000, step: 100, max: balanceData?.lkr_balance ?? 0 }}
              sx={{
                marginBottom: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDark ? '#ef4444' : '#ef4444',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? '#9ca3af' : '#6b7280',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: isDark ? '#ef4444' : '#ef4444',
                },
                '& .MuiInputBase-input': {
                  color: isDark ? '#FFFFFF' : '#111827',
                },
              }}
            />
            <TextField
              fullWidth
              label="Bank Name"
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Bank Account Number"
              placeholder="Enter account number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Bank Account Name"
              placeholder="Enter account holder name"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', mb: 1 }}>
              Minimum withdrawal amount is LKR 5,000. Withdrawal fee: LKR 100.
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', mb: 2 }}>
              Withdrawals are processed after admin approval and may take up to 3 days.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={
                withdrawLoading ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) < 5000 ||
                (balanceData != null && parseFloat(withdrawAmount) > balanceData.lkr_balance) ||
                !bankName.trim() ||
                !bankAccountNumber.trim() ||
                !bankAccountName.trim()
              }
              startIcon={withdrawLoading ? <CircularProgress size={20} color="inherit" /> : <Remove />}
              onClick={async () => {
                if (!isAuthenticated) {
                  toast.error('You need to register or login to withdraw funds.');
                  return;
                }
                const amount = parseFloat(withdrawAmount);
                if (Number.isNaN(amount) || amount < 5000) {
                  toast.error('Please enter at least 5,000 LKR');
                  return;
                }
                if (balanceData != null && amount > balanceData.lkr_balance) {
                  toast.error('Insufficient balance');
                  return;
                }
                if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountName.trim()) {
                  toast.error('Please enter bank name, account number, and account name');
                  return;
                }
                try {
                  await withdrawFunds({
                    amount,
                    bank_name: bankName.trim(),
                    bank_account_number: bankAccountNumber.trim(),
                    bank_account_name: bankAccountName.trim(),
                  }).unwrap();
                  toast.success(`Withdrawal request for ${formatCurrency(amount)} is pending approval`);
                  setWithdrawAmount('');
                  setBankName('');
                  setBankAccountNumber('');
                  setBankAccountName('');
                  refetchBalance();
                  setSidebarOpen(false);
                  setSidebarType(null);
                } catch (err: unknown) {
                  const message = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'detail' in err.data
                    ? String((err.data as { detail: unknown }).detail)
                    : 'Withdraw failed';
                  toast.error(message);
                }
              }}
              sx={{
                backgroundColor: isDark ? '#ef4444' : '#ef4444',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: isDark ? '#f87171' : '#dc2626',
                  boxShadow: isDark ? '0 4px 12px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                },
                paddingY: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Withdraw
            </Button>
          </Box>
        )}
        {sidebarType === 'transactions' && (
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: 2,
                fontSize: '0.875rem',
                lineHeight: 1.6,
              }}
            >
              View your deposit and withdraw fund history.
            </Typography>
            {walletTransactionLoading ? (
              <Box>
                <Skeleton variant="rectangular" height={56} sx={{ marginBottom: 1, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={56} sx={{ marginBottom: 1, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Box>
            ) : (() => {
              const transactions = (walletTransactionData?.transactions || []).filter(
                (transaction) =>
                  transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'WITHDRAWAL',
              );
              if (transactions.length === 0) {
                return (
                  <Box sx={{ textAlign: 'center', padding: 3 }}>
                    <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                      No deposit or withdrawal transactions yet
                    </Typography>
                  </Box>
                );
              }
              return (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.8rem' }}>Type</TableCell>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.8rem' }}>Amount</TableCell>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.8rem' }}>Status</TableCell>
                        <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600, fontSize: '0.8rem' }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: '0.8rem' }}>
                            {transaction.transaction_type === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: '0.8rem', fontWeight: 600 }}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              size="small"
                              sx={{
                                textTransform: 'capitalize',
                                ...getWalletTransactionStatusChipSx(transaction.status, isDark),
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.75rem' }}>
                            {formatDateTime(transaction.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              );
            })()}
          </Box>
        )}
      </Sidebar>

            </Box>
          </div>
        </ThemeProvider>
      </div>

      {/* Snackbar for notifications - outside ThemeProvider */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', fontSize: '0.9rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TradePage;
