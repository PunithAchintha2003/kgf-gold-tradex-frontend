import React, { useMemo, useCallback, useState, useEffect, useRef, Component } from 'react';
import type { ErrorInfo } from 'react';
// Assuming these types are correctly defined elsewhere:
import type { DailyDataPoint, HistoricalPrediction, Prediction } from '../store/api/goldApi';
import type { CurrencyUnit } from './CurrencyDropdown';
// Assuming this utility is correctly defined elsewhere:
import { convertPrice } from '../utils/currencyConverter';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';
import { TbWorldSearch } from 'react-icons/tb';
import Sidebar from './Sidebar';

// Import Plotly directly to avoid React module resolution issues
import Plot from 'react-plotly.js';

// Placeholder for Plotly.js type (if not available globally)
declare type PlotlyData = Plotly.Data;

// Error Boundary to catch infinite loops and other errors
class ChartErrorBoundary extends Component<
  { children: React.ReactNode; isDark: boolean; height: number },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode; isDark: boolean; height: number }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${this.props.height}px`,
            backgroundColor: this.props.isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
            border: `1px solid ${this.props.isDark ? '#333' : '#ddd'}`,
            padding: 3,
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: this.props.isDark ? '#ff6b6b' : '#d32f2f',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            Chart Error
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: this.props.isDark ? '#888' : '#666',
              textAlign: 'center',
            }}
          >
            {this.state.errorMessage || 'An error occurred while rendering the chart.'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: this.props.isDark ? '#666' : '#999',
              textAlign: 'center',
              fontSize: '0.75rem',
            }}
          >
            Please refresh the page.
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to safely handle Plot with proper displayName
// This prevents React DevTools errors about missing context displayName
const SafePlot: React.FC<React.ComponentProps<typeof Plot>> = (props) => {
  if (typeof Plot === 'undefined') {
    return <div>Plotly.js failed to load</div>;
  }
  return <Plot {...props} />;
};

SafePlot.displayName = 'SafePlotlyChart';

// Ensure Plot component has displayName for React DevTools
// Also ensure any internal context has displayName to prevent DevTools errors
if (typeof Plot !== 'undefined' && Plot !== null) {
  try {
    const PlotComponent = Plot as unknown as { 
      displayName?: string; 
      _context?: { displayName?: string } | null; 
      context?: { displayName?: string } | null;
      type?: { displayName?: string } | null;
      $$typeof?: symbol;
    };
    
    // Set displayName on the component itself
    if (!PlotComponent.displayName) {
      PlotComponent.displayName = 'PlotlyChart';
    }
    
    // Set displayName on type if it exists (for wrapped components)
    if (PlotComponent.type && typeof PlotComponent.type === 'object' && !PlotComponent.type.displayName) {
      PlotComponent.type.displayName = 'PlotlyChartType';
    }
    
    // Ensure _context has displayName if it exists
    if (PlotComponent._context && typeof PlotComponent._context === 'object') {
      if (!PlotComponent._context.displayName) {
        (PlotComponent._context as { displayName: string }).displayName = 'PlotlyChartContext';
      }
    }
    
    // Ensure context has displayName if it exists
    if (PlotComponent.context && typeof PlotComponent.context === 'object') {
      if (!PlotComponent.context.displayName) {
        (PlotComponent.context as { displayName: string }).displayName = 'PlotlyChartContext';
      }
    }
  } catch (error) {
    // Silently ignore if we can't set displayName
    console.warn('Unable to set displayName on Plot component:', error);
  }
}

// Verify Plot is available at module load time
if (typeof Plot === 'undefined') {
  console.error('CRITICAL: Plot component from react-plotly.js is undefined at module load');
}

// Note: React DevTools error suppression is handled globally in /public/disable-devtools.js
// which loads before React to prevent initialization errors

interface ChartProps {
  data: DailyDataPoint[];
  prediction?: Prediction;
  historicalPredictions?: HistoricalPrediction[];
  isDark: boolean;
  height?: number;
  realtimePrice?: number;
  currencyUnit: CurrencyUnit;
  usdToLkrRate: number;
}

// Global render tracker to detect loops across ALL Chart instances
const globalRenderTracker = {
  lastRenderTime: Date.now(),
  rapidRenderCount: 0,
  totalRenders: 0,
  halted: false,
  mountTime: Date.now(),
};

const Chart: React.FC<ChartProps> = ({
  data = [],
  prediction,
  historicalPredictions,
  isDark,
  height = 600,
  realtimePrice,
  currencyUnit,
  usdToLkrRate,
}) => {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional logic or early returns
  // Zoom state: 0 = default (10% padding), positive = zoomed in, negative = zoomed out
  const [zoomLevel, setZoomLevel] = useState(0);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hash refs to track content changes without causing remounts
  const lastDataHashRef = useRef<string>('');
  const lastLayoutHashRef = useRef<string>('');
  const isMountedRef = useRef(true);
  const plotInstanceRef = useRef<HTMLElement | null>(null);
  const computingPlotDataRef = useRef(false);
  const plotDataCacheRef = useRef<PlotlyData[]>([]);
  const plotDataDepsRef = useRef<string>('');
  // Critical refs for infinite loop detection - must be defined early
  const shouldRenderPlotRef = useRef(true);
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const mountTimeRef = useRef(Date.now());
  const totalRenderCountRef = useRef(0);
  
  // Track if Plotly failed to load
  const [plotlyError, setPlotlyError] = useState<string | null>(null);
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  const [plotlyAvailable, setPlotlyAvailable] = useState(true);
  
  // Use refs to prevent infinite loops from callbacks
  const initializationAttemptedRef = useRef(false);
  const errorReportedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  
  // Layout cache refs
  const layoutCacheRef = useRef<Record<string, unknown> | null>(null);
  const layoutStringRef = useRef<string>('');
  
  // Data cache refs
  const dataCacheRef = useRef<PlotlyData[]>([]);
  const dataStringRef = useRef<string>('');
  
  // Helper to get hasData and hasPredictions (used in early returns)
  const hasData = data && Array.isArray(data) && data.length > 0;
  const hasPredictions = historicalPredictions && Array.isArray(historicalPredictions) && historicalPredictions.length > 0;
  
  // CRITICAL: Global loop detection AFTER all hooks are called
  const now = Date.now();
  const timeSinceMountGlobal = now - globalRenderTracker.mountTime;
  
  if (!globalRenderTracker.halted && timeSinceMountGlobal > 500) {
    // Only enforce strict checking after 500ms to allow Plotly to initialize
    globalRenderTracker.totalRenders += 1;
    const timeSinceLastGlobalRender = now - globalRenderTracker.lastRenderTime;
    
    if (timeSinceLastGlobalRender < 5) {
      // Extremely fast renders (<5ms) indicate a tight loop
      globalRenderTracker.rapidRenderCount += 1;
      if (globalRenderTracker.rapidRenderCount > 15) {
        globalRenderTracker.halted = true;
        console.error('🚨 GLOBAL: Infinite loop detected across all Chart instances, halting');
        throw new Error('Chart rendering halted: Infinite loop detected');
      }
    } else if (timeSinceLastGlobalRender > 100) {
      globalRenderTracker.rapidRenderCount = 0;
    }
    globalRenderTracker.lastRenderTime = now;
  } else if (timeSinceMountGlobal <= 500) {
    // During initial mount, just track time
    globalRenderTracker.lastRenderTime = now;
  }
  
  // If globally halted, don't render at all (but hooks must be called first)
  const isGloballyHalted = globalRenderTracker.halted;
  
  // SYNCHRONOUS loop detection - runs immediately on each render BEFORE any useMemo/useEffect
  const componentStartTime = Date.now();
  const timeSinceLastRender = componentStartTime - lastRenderTimeRef.current;
  const timeSinceMount = componentStartTime - mountTimeRef.current;
  totalRenderCountRef.current += 1;
  
  // Allow rapid renders during first 500ms of mount (initial React + Plotly setup)
  // After that, enforce strict rate limiting
  if (timeSinceMount > 500 && shouldRenderPlotRef.current) {
    if (timeSinceLastRender < 10) {
      renderCountRef.current += 1;
      
      // Only warn if we're getting close to the threshold (5+ rapid renders)
      if (renderCountRef.current >= 5) {
        console.warn(`⚠️ SYNC: Rapid render #${renderCountRef.current} (${timeSinceLastRender}ms, total: ${totalRenderCountRef.current})`);
      }
      
      // After 20 rapid renders, halt to prevent stack overflow
      // Increased to allow Plotly's initialization renders
      if (renderCountRef.current > 20) {
        console.error('🚨 SYNC: Infinite loop detected after mount, halting rendering');
        shouldRenderPlotRef.current = false;
        computingPlotDataRef.current = false;
      }
    } else if (timeSinceLastRender >= 50) {
      // Reset only if renders are reasonably spaced (50ms = 20fps)
      // Don't log normalization to reduce console noise
      renderCountRef.current = 0;
    }
  }
  lastRenderTimeRef.current = componentStartTime;
  
  // Convert realtime price if it exists and we're in LKR mode (pawn)
  const convertedRealtimePrice = useMemo(() => {
    if (!realtimePrice) return realtimePrice;
    
    return currencyUnit === 'pawn' 
      ? convertPrice(realtimePrice, currencyUnit, usdToLkrRate).price 
      : realtimePrice;
  }, [realtimePrice, currencyUnit, usdToLkrRate]);
  
  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 1, 5)); // Max 5 levels zoom in
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 1, -3)); // Max 3 levels zoom out
  }, []);
  
  const handleResetZoom = useCallback(() => {
    setZoomLevel(0);
  }, []);
  
  // Calculate current price (this will be the converted price from the data)
  // Use a more stable approach to prevent unnecessary recalculations
  const currentPrice = useMemo(() => {
    if (convertedRealtimePrice) return convertedRealtimePrice;
    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    const lastItem = data[data.length - 1];
    return lastItem?.close ?? 0;
  }, [convertedRealtimePrice, data]);
  
  // Helper function to format LKR values in user-friendly way
  const formatLKRValue = useCallback((value: number) => {
    if (currencyUnit === 'pawn') {
      if (value >= 1000000) {
        return `LKR ${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `LKR ${(value / 1000).toFixed(0)}K`;
      } else {
        return `LKR ${value.toFixed(0)}`;
      }
    } else {
      return `$${value.toFixed(2)}`;
    }
  }, [currencyUnit]);

  const plotData = useMemo(() => {
    // CRITICAL: Circuit breaker - if we're already computing or loop detected, return cache
    if (computingPlotDataRef.current || !shouldRenderPlotRef.current) {
      if (!shouldRenderPlotRef.current) {
        console.warn('⛔ plotData circuit breaker: Loop detected, using cache');
      }
      if (plotDataCacheRef.current.length > 0) {
        return plotDataCacheRef.current;
      }
      return [];
    }

    // Create dependency hash to check if we need to recompute
    const depsHash = JSON.stringify({
      dataLength: Array.isArray(data) ? data.length : 0,
      hasPrediction: !!prediction?.predicted_price,
      historicalPredictionsLength: Array.isArray(historicalPredictions) ? historicalPredictions.length : 0,
      currentPrice,
      currencyUnit,
      usdToLkrRate,
    });

    // If dependencies haven't changed, return cached data
    if (plotDataDepsRef.current === depsHash && plotDataCacheRef.current.length > 0) {
      return plotDataCacheRef.current;
    }

    // Only log when actually recomputing (first time or deps changed)
    // Dependencies changed, will recompute below

    computingPlotDataRef.current = true;
    
    try {
      // Use data if available, otherwise create empty array (predictions will still be shown)
      const dataToUse = (data && Array.isArray(data)) ? data.filter(d => d != null) : [];

    // Sort data by date to ensure proper chronological order
    const sortedData = dataToUse.length > 0 ? [...dataToUse].sort((a, b) => {
      const dateA = a && a.date ? new Date(a.date).getTime() : 0;
      const dateB = b && b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    }) : [];


    const traces: PlotlyData[] = [];

    // Main price line (gold yellow) - use close values when available, show all data points
    // For dates before market data (before Oct 6), use predicted_price as fallback
    // Note: Data from Dashboard is already converted via convertChartData, so we use it directly
    const goldLineData = sortedData
      .filter(d => d != null && (d.close != null || d.predicted_price != null))
      .map(d => {
        if (!d) return null;
        // Use close if available (market data), otherwise use predicted_price (for dates before Oct 6)
        // Data is already converted by convertChartData in Dashboard, so use directly
        let price: number | null = null;
        
        if (d.close != null) {
          // close is already in the target currency (converted by convertChartData)
          price = d.close;
        } else if (d.predicted_price != null) {
          // predicted_price is still in USD/troy-ounce, so convert it
          price = convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price;
        }
        
        return {
          date: d.date || '',
          price: price,
          isPrediction: d.close == null && d.predicted_price != null, // Mark if this is prediction-only data
          hasPrediction: d.predicted_price != null && d.predicted_price !== undefined, // CRITICAL: Check if THIS data point has a prediction
          predictedPrice: d.predicted_price != null ? convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price : null, // CRITICAL: Use predicted_price from THIS data point
        };
      })
      .filter(d => d != null && d.price != null) as Array<{ date: string; price: number; isPrediction: boolean; hasPrediction: boolean; predictedPrice: number | null }>; // Remove any null prices

    if (goldLineData.length > 0) {
      // CRITICAL FIX: Ensure customdata array matches x/y arrays exactly (same length, same order)
      // This prevents index mismatch bugs where hovering Nov 6 shows Nov 7's data
      const goldLineX = goldLineData.map(d => d.date);
      const goldLineY = goldLineData.map(d => d.price!);
      const goldLineCustomData = goldLineData.map((d, index) => {
        // CRITICAL: Validate index alignment - each customdata entry must match its x/y pair
        const expectedDate = d.date;
        const actualDate = goldLineX[index];
        
        if (expectedDate !== actualDate) {
          console.error('🚨 CRITICAL BUG: Index mismatch in Gold Price Line!', {
            index,
            expectedDate,
            actualDate,
            message: 'customdata index does not match x array index - this causes wrong tooltip data!'
          });
        }
        
        // CRITICAL: Use d.predictedPrice (from this data point), NOT prediction.predicted_price
        if (d.hasPrediction && d.predictedPrice != null) {
          return `Date: ${d.date}<br>Actual Price: ${formatLKRValue(d.price!)}<br>Predicted Price: ${formatLKRValue(d.predictedPrice)}`;
        } else {
          return `Date: ${d.date}<br>Price: ${formatLKRValue(d.price!)}<br>Predicted Price: N/A`;
        }
      });
      
      
      traces.push({
        x: goldLineX,
        y: goldLineY,
        type: 'scatter',
        mode: 'lines',
        name: 'Gold Price Line',
        line: {
          color: '#F5D300',
          width: 2,
        },
        // CRITICAL FIX: Show prediction info ONLY if THIS data point has a prediction
        // Use predicted_price from the data point itself, NOT from global prediction object
        hovertemplate: `%{customdata}<extra></extra>`,
        customdata: goldLineCustomData,
      });
    }

    // Accuracy Line - show all predicted prices with specified color #0055ff
    // Show historical predictions (for accuracy comparison) AND future predictions
    const allPredictions: HistoricalPrediction[] = [];
    
    // Add all historical predictions (both past and future)
    // Past predictions allow accuracy comparison, future predictions show upcoming predictions
    if (historicalPredictions && Array.isArray(historicalPredictions) && historicalPredictions.length > 0) {
      historicalPredictions.forEach(p => {
        if (p && p.predicted_price != null && p.date) {
          // Check if this date already exists to avoid duplicates
          const exists = allPredictions.some(existing => existing.date === p.date);
          if (!exists) {
            allPredictions.push({
              date: p.date,
              predicted_price: p.predicted_price,
            });
          }
        }
      });
    }
    
    // Also add predictions from data array if they don't have actual prices (future dates)
    if (sortedData && Array.isArray(sortedData) && sortedData.length > 0) {
      sortedData.forEach(d => {
        if (d && d.predicted_price != null && d.date) {
          const hasActualPrice = d.close != null && d.close !== undefined;
          
          // Only add if there's no actual price (future date) and it doesn't already exist
          if (!hasActualPrice) {
            const exists = allPredictions.some(p => p.date === d.date);
            if (!exists) {
              allPredictions.push({
                date: d.date,
                predicted_price: d.predicted_price,
              });
            }
          }
        }
      });
    }
    
    // CRITICAL FIX: Always use prediction.next_day as the date, NEVER use last data point date
    // The prediction object is for FUTURE dates only (next_day)
    if (prediction && prediction.predicted_price && prediction.next_day) {
      const predictionDate = prediction.next_day; // ✅ CORRECT: Use next_day as the date
      const predictionPrice = prediction.predicted_price; // ✅ CORRECT: Price for next_day
      
      // Verify this is a future date (should be after last data point)
      const lastDataDate = sortedData && sortedData.length > 0 
        ? sortedData[sortedData.length - 1].date 
        : null;
      
      // Only add if it's not already included and it's actually a future prediction
      const alreadyIncluded = allPredictions.some(p => p.date === predictionDate);
      if (!alreadyIncluded) {
        // Double-check: prediction should be for a future date
        if (!lastDataDate || predictionDate > lastDataDate) {
          allPredictions.push({
            date: predictionDate, // ✅ Use next_day, NOT last data point date
            predicted_price: predictionPrice,
          });
        } else {
          console.warn('⚠️ Prediction date is not in the future:', {
            predictionDate,
            lastDataDate,
            message: 'Prediction should use next_day which should be after last data point'
          });
        }
      }
    }
    
    // Sort predictions by date to ensure proper line drawing (ascending order)
    allPredictions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Remove Nov 6 and Nov 7 if they somehow got in (these should not be predictions)
    if (allPredictions.length > 0) {
      const nov06Prediction = allPredictions.find(p => p.date === '2025-11-06');
      const nov07Prediction = allPredictions.find(p => p.date === '2025-11-07');
      
      if (nov06Prediction) {
        console.warn('⚠️ Removing Nov 06 prediction from Accuracy Line:', nov06Prediction);
        const index = allPredictions.findIndex(p => p.date === '2025-11-06');
        if (index > -1) {
          allPredictions.splice(index, 1);
        }
      }
      
      if (nov07Prediction) {
        console.warn('⚠️ Removing Nov 07 prediction from Accuracy Line:', nov07Prediction);
        const index = allPredictions.findIndex(p => p.date === '2025-11-07');
        if (index > -1) {
          allPredictions.splice(index, 1);
        }
      }
    }

    if (allPredictions.length > 0) {
      // Keep all predictions for accuracy line - both historical (for comparison) and future predictions
      // The accuracy line shows predictions that can be compared to actual prices
      const finalPredictionsToUse = allPredictions.filter(p => {
        if (!p.date) return false;
        // Remove Nov 6 and Nov 7 as a final safety check
        if (p.date === '2025-11-06' || p.date === '2025-11-07') {
          return false;
        }
        return true;
      });
      
      if (finalPredictionsToUse.length > 0) {
        // Convert predictions to current currency unit
        const convertedGhostData = finalPredictionsToUse.map(p => ({
          ...p,
          predicted_price: convertPrice(p.predicted_price, currencyUnit, usdToLkrRate).price
        }));

        // Debug: Log accuracy line data
        console.log('📊 Accuracy Line data:', {
          count: convertedGhostData.length,
          dates: convertedGhostData.map(p => p.date),
          firstDate: convertedGhostData[0]?.date,
          lastDate: convertedGhostData[convertedGhostData.length - 1]?.date,
        });

        traces.push({
          x: convertedGhostData.map(p => p.date),
          y: convertedGhostData.map(p => p.predicted_price),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Accuracy Line',
          line: {
            color: '#0055ff', // Your specified color
            width: 3,
            dash: 'solid',
          },
          marker: {
            color: '#0055ff',
            size: 8,
            symbol: 'circle',
          },
          opacity: 0.8,
          hovertemplate: `Predicted: %{x}<br>Price: %{customdata}<extra></extra>`,
          customdata: convertedGhostData.map(p => formatLKRValue(p.predicted_price)),
        });
      } else {
        console.warn('⚠️ No predictions to show in Accuracy Line', {
          allPredictionsCount: allPredictions.length,
          historicalPredictionsCount: historicalPredictions?.length || 0,
          message: 'Check if historical_predictions data is available'
        });
      }
    }

    let predDate: string | undefined;
    let predPrice: number | undefined;

    if (prediction && prediction.predicted_price) {
      predDate = prediction.next_day;
      predPrice = convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price;
    }

    // Current price marker - use last available date from sorted data
    const lastDate = (sortedData && Array.isArray(sortedData) && sortedData.length > 0)
      ? sortedData[sortedData.length - 1].date 
      : (historicalPredictions && Array.isArray(historicalPredictions) && historicalPredictions.length > 0
          ? historicalPredictions[historicalPredictions.length - 1].date
          : new Date().toISOString().split('T')[0]);

    traces.push({
      x: [lastDate],
      y: [currentPrice],
      type: 'scatter',
      mode: 'markers',
      name: 'Current Price',
      marker: {
        color: '#F5D300', // Back to original yellow
        size: 9,
      },
      hovertemplate: `Current Price<br>Date: %{x}<br>Price: ${formatLKRValue(currentPrice)}<extra></extra>`,
    });

    // Current price horizontal line
    traces.push({
      x: [(sortedData && Array.isArray(sortedData) && sortedData.length > 0) ? sortedData[0].date : lastDate, lastDate],
      y: [currentPrice, currentPrice],
      type: 'scatter',
      mode: 'lines',
      name: 'Current Price Level',
      line: {
        color: '#F5D300', // Back to original yellow
        width: 1.5,
        dash: 'dot',
      },
      showlegend: false,
      hoverinfo: 'skip',
    });

    // Prediction line and level
    if (predDate && predPrice !== undefined) {
      // CRITICAL FIX: Prediction line connects lastDate (Nov 07) to predDate (Nov 10)
      // The first point (Nov 07) should show currentPrice, NOT predPrice
      // Only the second point (Nov 10) should show predPrice
      // Use customdata to show correct price for each point
      traces.push({
        x: [lastDate, predDate],
        y: [currentPrice, predPrice],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Prediction',
        line: {
          color: '#00fa2e',
          width: 2,
          dash: 'dot',
        },
        marker: {
          color: '#00fa2e',
          size: 7,
        },
        // CRITICAL FIX: Show correct price for each point using customdata
        // First point (lastDate/Nov 07) = currentPrice, Second point (predDate/Nov 10) = predPrice
        hovertemplate: `%{customdata}<extra></extra>`,
        customdata: [
          `Date: ${lastDate}<br>Current Price: ${formatLKRValue(currentPrice)}`, // First point: Nov 07 with current price
          `Prediction Date: ${predDate}<br>Predicted Price: ${formatLKRValue(predPrice)}` // Second point: Nov 10 with predicted price
        ],
      });

      // Prediction horizontal line
      traces.push({
        x: [(sortedData && Array.isArray(sortedData) && sortedData.length > 0) ? sortedData[0].date : predDate, predDate],
        y: [predPrice, predPrice],
        type: 'scatter',
        mode: 'lines',
        name: 'Prediction Level',
        line: {
          color: '#26d4b4',
          width: 1.5,
          dash: 'dot',
        },
        showlegend: false,
        hoverinfo: 'skip',
      });
    }

      // Return clean traces without circular references
      // Validate and clean all trace data
      try {
        const result = traces
          .filter(trace => {
            const traceAny = trace as unknown as Record<string, unknown>;
            // Ensure trace has valid x and y arrays
            if (!trace || !Array.isArray(traceAny.x) || !Array.isArray(traceAny.y)) {
              console.warn('Invalid trace detected, skipping:', trace);
              return false;
            }
            if ((traceAny.x as unknown[]).length === 0 || (traceAny.y as unknown[]).length === 0) {
              console.warn('Empty trace arrays, skipping:', traceAny.name);
              return false;
            }
            if ((traceAny.x as unknown[]).length !== (traceAny.y as unknown[]).length) {
              console.warn('Mismatched trace array lengths, skipping:', traceAny.name);
              return false;
            }
            return true;
          })
          .map(trace => {
            const traceAny = trace as unknown as Record<string, unknown>;
            const cleanTrace: Record<string, unknown> = {
              x: Array.isArray(traceAny.x) ? (traceAny.x as unknown[]).filter((val: unknown) => val != null) : [],
              y: Array.isArray(traceAny.y) ? (traceAny.y as unknown[]).filter((val: unknown) => val != null && !isNaN(Number(val))) : [],
              type: traceAny.type,
              mode: traceAny.mode,
              name: traceAny.name,
              line: traceAny.line ? { ...(traceAny.line as Record<string, unknown>) } : undefined,
              marker: traceAny.marker ? { ...(traceAny.marker as Record<string, unknown>) } : undefined,
              hovertemplate: traceAny.hovertemplate,
              customdata: Array.isArray(traceAny.customdata) ? [...(traceAny.customdata as unknown[])] : undefined,
              showlegend: traceAny.showlegend,
              hoverinfo: traceAny.hoverinfo,
              opacity: traceAny.opacity,
            };
            // Ensure x and y arrays match in length after filtering
            const xArray = cleanTrace.x as unknown[];
            const yArray = cleanTrace.y as unknown[];
            // CRITICAL FIX: Ensure arrays exist and are valid before accessing .length
            if (!Array.isArray(xArray) || !Array.isArray(yArray)) {
              console.warn('Invalid trace arrays detected, skipping:', traceAny.name);
              return null; // Return null to filter out later
            }
            const minLength = Math.min(xArray.length, yArray.length);
            cleanTrace.x = xArray.slice(0, minLength);
            cleanTrace.y = yArray.slice(0, minLength);
            if (cleanTrace.customdata && Array.isArray(cleanTrace.customdata)) {
              cleanTrace.customdata = (cleanTrace.customdata as unknown[]).slice(0, minLength);
            }
            // Remove undefined properties
            Object.keys(cleanTrace).forEach(key => {
              if (cleanTrace[key] === undefined) {
                delete cleanTrace[key];
              }
            });
            return cleanTrace;
          })
          .filter(trace => trace != null) // CRITICAL FIX: Remove null traces from previous filter
          .filter(trace => {
            const xArray = trace.x as unknown[];
            const yArray = trace.y as unknown[];
            // CRITICAL FIX: Check if arrays exist before accessing .length
            return Array.isArray(xArray) && Array.isArray(yArray) && xArray.length > 0 && yArray.length > 0;
          }); // Only return traces with valid data
      
        // Cache the result before returning
        plotDataCacheRef.current = result;
        plotDataDepsRef.current = depsHash;
        computingPlotDataRef.current = false;
        return result;
      } catch (error) {
        console.error('Error cleaning traces:', error);
        computingPlotDataRef.current = false;
        return plotDataCacheRef.current.length > 0 ? plotDataCacheRef.current : [];
      }
    } catch (error) {
      console.error('Error in plotData useMemo:', error);
      computingPlotDataRef.current = false;
      return plotDataCacheRef.current.length > 0 ? plotDataCacheRef.current : [];
    }
  }, [data, prediction, historicalPredictions, currentPrice, currencyUnit, usdToLkrRate, formatLKRValue]);

  const layout = useMemo(() => {
    try {
      // Use data if available, otherwise prepare for predictions-only display
      const hasData = data && Array.isArray(data) && data.length > 0;
      const hasPredictions = historicalPredictions && Array.isArray(historicalPredictions) && historicalPredictions.length > 0;
    
    // If no data and no predictions, return minimal layout
    if (!hasData && !hasPredictions) {
      return {
        title: undefined,
        xaxis: { showgrid: true },
        yaxis: { showgrid: true },
        plot_bgcolor: isDark ? '#000000' : '#FFFFFF',
        paper_bgcolor: isDark ? '#000000' : '#FFFFFF',
        font: { color: isDark ? '#FFFFFF' : '#000000' },
        height,
      };
    }
    
    // Use data if available, otherwise use empty array
    const dataToUse = (data && Array.isArray(data)) ? data : [];

    // Dynamic LKR tick calculation for clean chart
    const getLKRTickVals = () => {
      const allPrices: number[] = [];
      // close values are already converted by convertChartData
      if (dataToUse && Array.isArray(dataToUse)) {
        const closePrices = dataToUse.filter(d => d != null && d.close != null).map(d => d.close!);
        allPrices.push(...closePrices);
        // Also include predicted_price values for y-axis range (convert from USD)
        dataToUse.forEach(d => {
          if (d != null && d.predicted_price != null && d.close == null) {
            allPrices.push(convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price);
          }
        });
      }
      if (currentPrice > 0) allPrices.push(currentPrice);
      if (prediction && prediction.predicted_price) {
        allPrices.push(convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price);
      }
      
      if (!allPrices || allPrices.length === 0) return [0];
      
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      const range = maxPrice - minPrice;
      
      let tickStep = 0;
      
      // Determine a dynamic step based on the range for a clean look
      if (range >= 50000) {
        tickStep = 10000; // 10K step for large fluctuations
      } else if (range >= 10000) {
        tickStep = 5000; // 5K step
      } else if (range >= 2000) {
        tickStep = 1000; // 1K step
      } else {
        tickStep = 500; // 500 LKR for small ranges
      }
      
      // Calculate a "clean" starting point by rounding down the minPrice to the nearest tickStep
      const start = Math.floor(minPrice / tickStep) * tickStep;
      
      const levels: number[] = [];
      let currentLevel = start;
      // Generate ticks until they exceed the max price
      while (currentLevel <= maxPrice) {
        levels.push(currentLevel);
        currentLevel += tickStep;
      }
      
      // Ensure we have at least 5 ticks if possible, even if the step needs slight adjustment
      if (levels.length < 3 && range > 0) {
          // If the range is very small, use an even smaller step
          tickStep = Math.max(100, Math.ceil(range / 50) * 10);
          levels.length = 0; // Reset
          currentLevel = Math.floor(minPrice / tickStep) * tickStep;
           while (currentLevel <= maxPrice) {
               levels.push(currentLevel);
               currentLevel += tickStep;
           }
      }
      
      const filteredLevels = levels.filter(val => val > 0);
      // CRITICAL: Never return empty array - Plotly needs at least one tick value
      return filteredLevels.length > 0 ? filteredLevels : [0];
    };

    const predPriceConverted = prediction && prediction.predicted_price 
        ? convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price 
        : undefined;

    // Calculate y-axis range with padding for zoom out effect
    const getAllPrices = () => {
      const prices: number[] = [];
      // Include close prices from data (already converted by convertChartData)
      if (dataToUse && Array.isArray(dataToUse)) {
        const closePrices = dataToUse.filter(d => d != null && d.close != null).map(d => d.close!);
        prices.push(...closePrices);
        // Also include predicted_price as fallback for dates without close values
        // Note: predicted_price is still in USD, so convert it
        dataToUse.forEach(d => {
          if (d != null && d.predicted_price != null && d.close == null) {
            prices.push(convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price);
          }
        });
      }
      if (currentPrice > 0) prices.push(currentPrice);
      if (predPriceConverted !== undefined) prices.push(predPriceConverted);
      // Include all prediction prices from historical_predictions (convert from USD)
      if (historicalPredictions && Array.isArray(historicalPredictions) && historicalPredictions.length > 0) {
        historicalPredictions.forEach(p => {
          if (p && p.predicted_price) {
            prices.push(convertPrice(p.predicted_price, currencyUnit, usdToLkrRate).price);
          }
        });
      }
      return prices;
    };

    const allPrices = getAllPrices();
    // Safety check: ensure allPrices is not empty before using Math.min/max
    if (!allPrices || !Array.isArray(allPrices) || allPrices.length === 0) {
      // Return default layout if no prices available
      return {
        title: undefined,
        xaxis: { showgrid: true },
        yaxis: { showgrid: true },
        plot_bgcolor: isDark ? '#000000' : '#FFFFFF',
        paper_bgcolor: isDark ? '#000000' : '#FFFFFF',
        font: { color: isDark ? '#FFFFFF' : '#000000' },
        height,
        annotations: [], // CRITICAL: Always arrays
        shapes: [], // CRITICAL: Always arrays
        images: [], // CRITICAL: Always arrays
        updatemenus: [], // CRITICAL: Always arrays
        sliders: [], // CRITICAL: Always arrays
      };
    }
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const range = maxPrice - minPrice;
    
    // Calculate padding based on zoom level
    // zoomLevel 0 = 10% padding (default)
    // Positive zoomLevel = less padding (zoom in)
    // Negative zoomLevel = more padding (zoom out)
    const basePadding = 0.1; // 10% base padding
    const zoomFactor = Math.pow(0.7, zoomLevel); // Exponential zoom
    const padding = range * basePadding * zoomFactor;
    
    const yAxisRange = [minPrice - padding, maxPrice + padding];

    return {
      title: undefined,
      xaxis: {
        showgrid: true,
        gridwidth: 1,
        gridcolor: isDark ? '#1f1f1f' : '#E0E0E0',
        color: isDark ? '#888888' : '#666666',
        showline: true,
        linewidth: 1,
        linecolor: isDark ? '#333333' : '#CCCCCC',
        zeroline: false,
        // Better date formatting for 2 months view
        tickformat: '%b %d',
        // Show ticks every 7 days for 2 months view (7 days * 24 hours * 60 min * 60 sec * 1000 ms)
        dtick: (data && Array.isArray(data) && data.length > 30) ? 7 * 24 * 60 * 60 * 1000 : undefined,
        // Explicitly set range to show all dates from data AND predictions, including dates before Oct 6
        // Combine market data dates with prediction dates to get full range
        range: (() => {
          try {
            // Collect all dates from market data
            const dataDates = (dataToUse && Array.isArray(dataToUse) && dataToUse.length > 0) 
              ? dataToUse.map(d => d.date).filter(d => d) 
              : [];
            
            // Collect all dates from predictions (including before Oct 6)
            const predictionDates = (historicalPredictions && Array.isArray(historicalPredictions) && historicalPredictions.length > 0)
              ? historicalPredictions.map(p => p && p.date ? p.date : '').filter(d => d !== '')
              : [];
            
            // Add main prediction date if exists
            if (prediction && prediction.next_day) {
              predictionDates.push(prediction.next_day);
            }
            
            // Combine and find earliest and latest
            const allDates = [...new Set([...dataDates, ...predictionDates])].sort();
            
            // CRITICAL: Return undefined (Plotly will auto-range) if no dates
            if (allDates.length === 0) return undefined;
            
            const earliestDate = new Date(allDates[0]);
            const latestDate = new Date(allDates[allDates.length - 1]);
            
            // Validate dates are valid
            if (isNaN(earliestDate.getTime()) || isNaN(latestDate.getTime())) {
              console.warn('Invalid dates in range calculation');
              return undefined;
            }
            
            // Add 2 days padding on each side to ensure full visibility
            earliestDate.setDate(earliestDate.getDate() - 2);
            latestDate.setDate(latestDate.getDate() + 2);
            
            const rangeStart = earliestDate.toISOString();
            const rangeEnd = latestDate.toISOString();
            
            
            return [rangeStart, rangeEnd];
          } catch (error) {
            console.error('Error calculating xaxis range:', error);
            return undefined; // Let Plotly auto-range
          }
        })(),
        // Show all available data, don't limit to recent dates
        rangeslider: { visible: false }, // Can be enabled if needed
        type: 'date' as const, // Ensure proper date handling
      },
      yaxis: {
        showgrid: true,
        gridwidth: 1,
        gridcolor: isDark ? '#1f1f1f' : '#E0E0E0',
        color: isDark ? '#888888' : '#666666',
        showline: true,
        linewidth: 1,
        linecolor: isDark ? '#333333' : '#CCCCCC',
        zeroline: false,
        range: yAxisRange, // Set zoomed out range with padding
        // Plotly will automatically format the ticks based on the data and range
        tickformat: currencyUnit === 'pawn' ? ',.0f' : '$,.2f',
        ticksuffix: currencyUnit === 'pawn' ? ' LKR' : '',
        side: 'right' as const,
        // Dynamic LKR tick values for clean, representative gaps
        ...(currencyUnit === 'pawn' ? {
          tickmode: 'array' as const,
          tickvals: getLKRTickVals() || [0], // CRITICAL: Fallback to [0] if undefined
        } : {
          tickmode: 'auto' as const,
        }),
      },
      plot_bgcolor: isDark ? '#000000' : '#FFFFFF',
      paper_bgcolor: isDark ? '#000000' : '#FFFFFF',
      font: {
        color: isDark ? '#FFFFFF' : '#000000',
        family: 'Segoe UI, Roboto, sans-serif',
      },
      // CRITICAL FIX: Use 'closest' mode to show only the tooltip for the point being hovered
      // This prevents showing tooltips from other traces (e.g., Current Price at Nov 7 when hovering Nov 6)
      hovermode: 'closest' as const,
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
        bordercolor: isDark ? '#333333' : '#CCCCCC',
        borderwidth: 1,
        font: {
          size: height < 500 ? 8 : 10,
        },
      },
      margin: {
        l: height < 500 ? 5 : 10,
        r: height < 500 ? 50 : 80,
        t: height < 500 ? 15 : 20,
        b: height < 500 ? 30 : 40,
      },
      height,
      // CRITICAL: Initialize ALL Plotly array properties to prevent undefined.length errors in production
      shapes: [], // CRITICAL: Always empty array
      images: [], // CRITICAL: Always empty array
      updatemenus: [], // CRITICAL: UI controls
      sliders: [], // CRITICAL: Slider controls
      annotations: [
        // Current price annotation - ALWAYS use last data point date, NOT prediction date
        // CRITICAL FIX: Current price is for the last market data date, not the future prediction date
        ...((dataToUse && Array.isArray(dataToUse) && dataToUse.length > 0) ? [{
          x: dataToUse[dataToUse.length - 1].date, // ✅ Use last data point date (e.g., Nov 07)
          y: currentPrice,
          text: formatLKRValue(currentPrice),
          showarrow: false,
          font: {
            color: '#F5D300',
            size: height < 500 ? 11 : 14,
            family: 'Segoe UI, Roboto, sans-serif'
          },
          xanchor: 'left' as const,
          yanchor: 'middle' as const,
          xshift: 10
        }] : []),
        // Prediction price annotation - ALWAYS use prediction.next_day as the date
        // CRITICAL FIX: Prediction is for a FUTURE date (next_day), not the last data point date
        ...(predPriceConverted !== undefined && prediction && prediction.next_day ? [{
          x: prediction.next_day, // ✅ Use next_day (e.g., Nov 10), NOT last data point date
          y: predPriceConverted, // Use the converted price
          text: formatLKRValue(predPriceConverted),
          showarrow: false,
          font: {
            color: '#26d4b4',
            size: height < 500 ? 11 : 14,
            family: 'Segoe UI, Roboto, sans-serif'
          },
          xanchor: 'left' as const,
          yanchor: 'middle' as const,
          xshift: 10
        }] : [])
      ].filter(a => a && a.x !== undefined && a.y !== undefined), // Filter invalid annotations
    };
    } catch (error) {
      console.error('Error in layout useMemo:', error);
      // Return safe default layout on error
      return {
        title: undefined,
        xaxis: { showgrid: true, type: 'date' as const },
        yaxis: { showgrid: true },
        plot_bgcolor: isDark ? '#000000' : '#FFFFFF',
        paper_bgcolor: isDark ? '#000000' : '#FFFFFF',
        font: { color: isDark ? '#FFFFFF' : '#000000' },
        height,
        annotations: [], // CRITICAL: Always arrays
        shapes: [], // CRITICAL: Always arrays
        images: [], // CRITICAL: Always arrays
        updatemenus: [], // CRITICAL: Always arrays
        sliders: [], // CRITICAL: Always arrays
      };
    }
  }, [isDark, height, currentPrice, prediction, data, historicalPredictions, currencyUnit, usdToLkrRate, formatLKRValue, zoomLevel]);

  // Memoize config to prevent new object on every render
  const config = useMemo(() => ({
    displayModeBar: false,
    displaylogo: false,
    responsive: true,
  }), []);
  
  // Track mount status and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear plot instance reference on unmount
      plotInstanceRef.current = null;
    };
  }, []);

  // Check if Plot component is available on mount
  useEffect(() => {
    if (typeof Plot === 'undefined') {
      console.error('Plot component is undefined - Plotly.js may not have loaded');
      setPlotlyError('Plotly.js failed to load. Please refresh the page.');
      setPlotlyAvailable(false);
    } else {
      setPlotlyAvailable(true);
    }
  }, []);
  
  // Check if Plotly loads within 10 seconds (increased for production builds)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!plotlyLoaded && !plotlyError && plotlyAvailable) {
        // Only warn in development - in production, chart might still be rendering
        if (import.meta.env.DEV) {
          console.warn('Plotly initialization callback has not fired after 10 seconds');
        }
        // Chart may still be rendering successfully, don't show error to user
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [plotlyLoaded, plotlyError, plotlyAvailable]);

  // Safe layout - deep clone to ensure stable reference
  // Use refs to cache and only update when content actually changes
  const safeLayout = useMemo(() => {
    // CRITICAL: If we've detected an infinite loop, return cached layout immediately
    if (!shouldRenderPlotRef.current && layoutCacheRef.current) {
      return layoutCacheRef.current;
    }
    
    if (!layout) {
      const empty: Record<string, unknown> = {
        xaxis: { type: 'date' as const },
        yaxis: {},
        autosize: true,
        annotations: [], // CRITICAL: Always arrays
        shapes: [], // CRITICAL: Always arrays
        images: [], // CRITICAL: Always arrays
        updatemenus: [], // CRITICAL: Always arrays
        sliders: [], // CRITICAL: Always arrays
      };
      layoutCacheRef.current = empty;
      layoutStringRef.current = JSON.stringify(empty);
      lastLayoutHashRef.current = '';
      return empty;
    }
    
    try {
      // Sanitize layout to remove any undefined arrays that could cause issues
      const sanitizeValue = (value: unknown): unknown => {
        if (value === undefined || value === null) {
          return null;
        }
        if (typeof value === 'function') {
          return null;
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (Array.isArray(value)) {
          // Ensure arrays don't have undefined elements
          return value.map(sanitizeValue).filter(v => v !== null);
        }
        if (typeof value === 'object') {
          const sanitized: Record<string, unknown> = {};
          for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            const sanitizedVal = sanitizeValue(val);
            if (sanitizedVal !== null) {
              sanitized[key] = sanitizedVal;
            }
          }
          return sanitized;
        }
        return value;
      };
      
      const sanitizedLayout = sanitizeValue(layout) as Record<string, unknown>;
      
      // Create a stable string representation
      const layoutString = JSON.stringify(sanitizedLayout);
      
      // Only create new object if content actually changed
      if (layoutStringRef.current === layoutString && layoutCacheRef.current) {
        return layoutCacheRef.current;
      }
      
      // Content changed - update the cache
      lastLayoutHashRef.current = layoutString;
      
      // Deep clone the layout to break any reference chains
      const cloned = JSON.parse(layoutString) as Record<string, unknown>;
      
      // Ensure required fields exist and arrays are never undefined
      if (!cloned.xaxis) {
        cloned.xaxis = { type: 'date' as const };
      }
      if (!cloned.yaxis) {
        cloned.yaxis = {};
      }
      // CRITICAL: Plotly requires ALL these to be arrays, not undefined
      // This prevents "Cannot read properties of undefined (reading 'length')" errors in production
      if (!Array.isArray(cloned.shapes)) {
        cloned.shapes = [];
      }
      if (!Array.isArray(cloned.annotations)) {
        cloned.annotations = [];
      }
      if (!Array.isArray(cloned.images)) {
        cloned.images = [];
      }
      if (!Array.isArray(cloned.updatemenus)) {
        cloned.updatemenus = [];
      }
      if (!Array.isArray(cloned.sliders)) {
        cloned.sliders = [];
      }
      
      layoutCacheRef.current = cloned;
      layoutStringRef.current = layoutString;
      return cloned;
    } catch (error) {
      console.error('Error cloning layout:', error);
      // Fallback: return minimal valid layout
      const fallback: Record<string, unknown> = {
        xaxis: { type: 'date' as const },
        yaxis: {},
        autosize: true,
        annotations: [], // CRITICAL: Always arrays
        shapes: [], // CRITICAL: Always arrays
        images: [], // CRITICAL: Always arrays
        updatemenus: [], // CRITICAL: Always arrays
        sliders: [], // CRITICAL: Always arrays
      };
      return layoutCacheRef.current || fallback;
    }
  }, [layout]);

  // Note: Plotly error callback has been removed to prevent callback loops
  // Errors are caught by Error Boundary and global error handlers instead

  const handlePlotInitialized = useCallback((_figure: unknown, graphDiv: HTMLElement) => {
    // Prevent multiple initialization callbacks from causing re-renders
    if (initializationAttemptedRef.current || isUpdatingRef.current || !isMountedRef.current) {
      return;
    }
    
    initializationAttemptedRef.current = true;
    isUpdatingRef.current = true;
    
    // Store plot instance reference
    if (graphDiv && '_fullLayout' in graphDiv) {
      plotInstanceRef.current = graphDiv;
    }
    
    // Use requestAnimationFrame to batch state updates and prevent re-render loops
    // Only update state once, and use a flag to prevent multiple calls
    requestAnimationFrame(() => {
      // Double-check flag to prevent race conditions
      if (isUpdatingRef.current && initializationAttemptedRef.current && isMountedRef.current) {
        // Batch all state updates together
        setPlotlyLoaded((prev) => {
          if (!prev) {
            // Only update if not already loaded to prevent unnecessary re-renders
            errorReportedRef.current = false;
            isUpdatingRef.current = false;
            return true;
          }
          return prev;
        });
        setPlotlyError(null);
      }
    });
  }, []);
  
  // Track render count to detect infinite loops - CRITICAL SAFETY CHECK
  // This runs AFTER render to catch loops that slip through synchronous detection
  useEffect(() => {
    if (!shouldRenderPlotRef.current) {
      return; // Already detected loop, don't check again
    }
    
    const now = Date.now();
    const timeSinceMount = now - mountTimeRef.current;
    
    // Skip effect-based detection during first 100ms (handled by sync detection)
    if (timeSinceMount <= 100) {
      return;
    }
    
    // This useEffect is a backup - the sync detection should catch most cases
    // Check for excessive renders in a short time window (not total lifetime renders)
    // More than 100 renders in the first 5 seconds indicates a problem
    if (timeSinceMount < 5000 && totalRenderCountRef.current > 100) {
      console.error(`🚨 EFFECT: Too many renders in short time (${totalRenderCountRef.current} in ${timeSinceMount}ms), halting`);
      shouldRenderPlotRef.current = false;
      computingPlotDataRef.current = false;
      
      if (isMountedRef.current) {
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            setPlotlyError('Chart rendering error: Too many renders detected. Please refresh the page.');
          }
        });
      }
    }
    
    // After 5 seconds, allow unlimited renders (component is stable)
    // The synchronous detection will catch any new loops
  });
  
  // Additional safety check before rendering Plot
  // Ensure plotData is always an array (memoized to prevent re-renders)
  const safePlotData = useMemo(() => {
    return Array.isArray(plotData) ? plotData : [];
  }, [plotData]);
  
  // Deep clone plot data to ensure stable references
  // Use refs to cache and only update when content actually changes
  const plotDataForRender = useMemo(() => {
    // CRITICAL: If we've detected an infinite loop, return cached data immediately
    if (!shouldRenderPlotRef.current) {
      return dataCacheRef.current.length > 0 ? dataCacheRef.current : [];
    }
    
    // Validate safePlotData is an array
    if (!safePlotData || !Array.isArray(safePlotData) || safePlotData.length === 0) {
      dataCacheRef.current = [];
      dataStringRef.current = '[]';
      lastDataHashRef.current = '';
      return [];
    }
    
    try {
      // Sanitize plot data to ensure all arrays are defined
      const sanitizedData = safePlotData.map(trace => {
        const traceAny = trace as Record<string, unknown>;
        return {
          ...traceAny,
          // CRITICAL: Ensure x and y are always arrays, never undefined
          x: Array.isArray(traceAny.x) ? traceAny.x : [],
          y: Array.isArray(traceAny.y) ? traceAny.y : [],
          customdata: Array.isArray(traceAny.customdata) ? traceAny.customdata : undefined,
        };
      }).filter(trace => {
        // Filter out traces with empty data arrays
        const x = trace.x as unknown[];
        const y = trace.y as unknown[];
        // CRITICAL FIX: Check if arrays exist and are valid before accessing .length
        return Array.isArray(x) && Array.isArray(y) && x.length > 0 && y.length > 0;
      });
      
      if (sanitizedData.length === 0) {
        dataCacheRef.current = [];
        return [];
      }
      
      // Create a stable string representation
      const dataString = JSON.stringify(sanitizedData, (_key, value) => {
        if (typeof value === 'function' || value === undefined) {
          return null;
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      
      // Only create new array if content actually changed
      if (dataStringRef.current === dataString && dataCacheRef.current.length > 0) {
        return dataCacheRef.current;
      }
      
      // Content changed - update the cache
      lastDataHashRef.current = dataString;
      
      // Deep clone the data to break any reference chains
      const cloned = JSON.parse(dataString) as typeof safePlotData;
      dataCacheRef.current = cloned;
      dataStringRef.current = dataString;
      return cloned;
    } catch (error) {
      console.error('Error cloning plot data:', error);
      // Fallback: return cached data if available, otherwise empty array
      return dataCacheRef.current.length > 0 ? dataCacheRef.current : [];
    }
  }, [safePlotData]);
  
  // Debug logging for production (only log when key values change, not object references)
  useEffect(() => {
    // Chart render state tracked silently
  }, [hasData, hasPredictions, safePlotData.length, plotDataForRender.length, plotlyLoaded, plotlyAvailable, plotlyError]);
  
  // Early return after all hooks - check if globally halted
  if (isGloballyHalted) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Chart Error: Infinite loop detected. Please refresh the page.
      </div>
    );
  }
  
  // Early return after all hooks
  if (!hasData && !hasPredictions) {
    return (
      <div 
        className={`flex items-center justify-center h-${height} ${isDark ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg`}
        style={{ height: `${height}px` }}
      >
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No data available</p>
      </div>
    );
  }
  
  if (safePlotData.length === 0 && plotDataForRender.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg`}
        style={{ height: `${height}px` }}
      >
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Preparing chart data...</p>
      </div>
    );
  }

  // CRITICAL: Early return if loop detected - prevent ANY rendering
  // This must be after all hooks to follow React rules
  if (!shouldRenderPlotRef.current) {
    return (
      <div className="w-full relative">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: `${height}px`,
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            padding: 3,
            gap: 2
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#ff6b6b' : '#d32f2f',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Chart Rendering Error
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#888' : '#666',
              textAlign: 'center'
            }}
          >
            Infinite render loop detected. Please refresh the page.
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Sidebar Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 10 },
          right: { xs: 8, sm: 10 },
          zIndex: 10,
        }}
      >
        <Tooltip title="Reasons" placement="left">
          <IconButton
            size="small"
            onClick={() => setSidebarOpen(true)}
            sx={{
              color: isDark ? '#fff' : '#000',
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? '#333' : '#ddd'}`,
              padding: { xs: '4px', sm: '8px' },
              '&:hover': {
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <TbWorldSearch size={18} style={{ width: '18px', height: '18px' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Zoom Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 42, sm: 50 },
          right: { xs: 8, sm: 10 },
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          padding: { xs: '2px', sm: '4px' },
          border: `1px solid ${isDark ? '#333' : '#ddd'}`,
        }}
      >
        <Tooltip title="Zoom In" placement="left">
          <span>
            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
              sx={{
                color: isDark ? '#fff' : '#000',
                padding: { xs: '4px', sm: '8px' },
                '&:disabled': {
                  color: isDark ? '#555' : '#ccc',
                },
              }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Zoom Out" placement="left">
          <span>
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoomLevel <= -3}
              sx={{
                color: isDark ? '#fff' : '#000',
                padding: { xs: '4px', sm: '8px' },
                '&:disabled': {
                  color: isDark ? '#555' : '#ccc',
                },
              }}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Reset Zoom" placement="left">
          <span>
            <IconButton
              size="small"
              onClick={handleResetZoom}
              disabled={zoomLevel === 0}
              sx={{
                color: isDark ? '#fff' : '#000',
                padding: { xs: '4px', sm: '8px' },
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
      
      {!plotlyAvailable || plotlyError ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: `${height}px`,
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            padding: 3,
            gap: 2
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: isDark ? '#ff6b6b' : '#d32f2f',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Chart Error
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#888' : '#666',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}
          >
            {plotlyError || 'Plotly.js failed to load. Please refresh the page.'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#666' : '#999',
              textAlign: 'center',
              fontSize: '0.75rem',
              marginTop: 1
            }}
          >
            Please check the browser console for more details.
          </Typography>
        </Box>
      ) : plotDataForRender.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: `${height}px`,
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
            padding: 3
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#888' : '#666',
              textAlign: 'center'
            }}
          >
            Preparing chart data...
          </Typography>
        </Box>
      ) : !shouldRenderPlotRef.current || plotlyError ? (
        // Don't render if we detected an infinite loop or have an error
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: `${height}px`,
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            padding: 3,
            gap: 2
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#888' : '#666',
              textAlign: 'center'
            }}
          >
            {plotlyError || 'Chart rendering error. Please refresh the page.'}
          </Typography>
        </Box>
      ) : !shouldRenderPlotRef.current ? (
        // Don't render Plot if we detected an infinite loop
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: `${height}px`,
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            padding: 3,
            gap: 2
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#ff6b6b' : '#d32f2f',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Chart Rendering Error
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#888' : '#666',
              textAlign: 'center'
            }}
          >
            Infinite render loop detected. Please refresh the page.
          </Typography>
        </Box>
      ) : !plotDataForRender || !Array.isArray(plotDataForRender) || plotDataForRender.length === 0 ? (
        // Show loading state if data is invalid or empty
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${height}px`,
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <Typography variant="body2" sx={{ color: isDark ? '#888' : '#666' }}>
            Loading chart data...
          </Typography>
        </Box>
      ) : (() => {
        // Final validation before rendering
        try {
          return (
            <SafePlot
              key={`plot-${currencyUnit}-${Array.isArray(data) ? data.length : 0}-${isDark}-${zoomLevel}`}
              data={plotDataForRender}
              layout={safeLayout}
              config={config}
              onInitialized={handlePlotInitialized}
              style={{ width: '100%', height: `${height}px` }}
              useResizeHandler={false}
              // Prevent Plotly from auto-updating which can cause infinite loops
              onUpdate={undefined}
              onRelayout={undefined}
              onRedraw={undefined}
              onPurge={undefined}
              onAnimated={undefined}
              onAnimatingFrame={undefined}
              onLegendClick={undefined}
              onLegendDoubleClick={undefined}
              onSliderChange={undefined}
              onSliderEnd={undefined}
              onSliderStart={undefined}
              // Disable hover interactions that can cause errors during remounts
              onHover={undefined}
              onUnhover={undefined}
              onClick={undefined}
              onSelected={undefined}
              onSelecting={undefined}
              onDeselect={undefined}
              onDoubleClick={undefined}
              onWebGlContextLost={undefined}
            />
          );
        } catch (error) {
          console.error('Error rendering SafePlot:', error);
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: `${height}px`,
                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <Typography variant="body2" sx={{ color: '#ff6b6b' }}>
                Error rendering chart. Please refresh the page.
              </Typography>
            </Box>
          );
        }
      })()}

      {/* Sidebar */}
      {sidebarOpen && (
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
      )}
    </div>
  );
};

Chart.displayName = 'Chart';

// Wrap Chart with Error Boundary for production safety
const ChartWithErrorBoundary: React.FC<ChartProps> = (props) => (
  <ChartErrorBoundary isDark={props.isDark} height={props.height || 600}>
    <Chart {...props} />
  </ChartErrorBoundary>
);

ChartWithErrorBoundary.displayName = 'ChartWithErrorBoundary';

export default ChartWithErrorBoundary;