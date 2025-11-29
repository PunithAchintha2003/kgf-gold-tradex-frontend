import React, { useMemo, useCallback } from 'react';
// Assuming these types are correctly defined elsewhere:
import type { DailyDataPoint, HistoricalPrediction, Prediction } from '../../store/api/goldApi';
import type { CurrencyUnit } from './CurrencyDropdown';
// Assuming this utility is correctly defined elsewhere:
import { convertPrice } from '../../utils/currencyConverter';

// Import Plotly directly to avoid React module resolution issues
import Plot from 'react-plotly.js';

// Placeholder for Plotly.js type (if not available globally)
declare type PlotlyData = Plotly.Data;

interface ChartProps {
  data: DailyDataPoint[];
  prediction?: Prediction | undefined;
  historicalPredictions?: HistoricalPrediction[] | undefined;
  isDark: boolean;
  height?: number | undefined;
  realtimePrice?: number | undefined;
  currencyUnit: CurrencyUnit;
  usdToLkrRate: number;
  zoomLevel?: number | undefined;
}

const Chart: React.FC<ChartProps> = ({
  data,
  prediction,
  historicalPredictions,
  isDark,
  height = 600,
  realtimePrice,
  currencyUnit,
  usdToLkrRate,
  zoomLevel = 0,
}) => {
  
  // Convert realtime price if it exists and we're in LKR mode (pawn)
  const convertedRealtimePrice = useMemo(() => {
    if (realtimePrice == null || isNaN(realtimePrice)) {
      return null;
    }
    
    try {
      return currencyUnit === 'pawn' 
        ? convertPrice(realtimePrice, currencyUnit, usdToLkrRate).price 
        : realtimePrice;
    } catch (_error) {
      console.error('Error converting realtime price:', _error);
      return null;
    }
  }, [realtimePrice, currencyUnit, usdToLkrRate]);
  
  
  // Calculate current price (this will be the converted price from the data)
  const currentPrice = useMemo(() => {
    if (convertedRealtimePrice != null && !isNaN(convertedRealtimePrice)) {
      return convertedRealtimePrice;
    }
    if (data && data.length > 0) {
      const lastDataPoint = data[data.length - 1];
      if (lastDataPoint?.close != null && !isNaN(lastDataPoint.close)) {
        return lastDataPoint.close;
      }
    }
    return 0; // Default fallback
  }, [convertedRealtimePrice, data]);
  
  // Helper function to format LKR values in user-friendly way
  const formatLKRValue = useCallback((value: number | null | undefined) => {
    // Handle null/undefined values
    if (value == null || isNaN(value)) {
      return currencyUnit === 'pawn' ? 'LKR 0' : '$0.00';
    }
    
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
    // Use data if available, otherwise create empty array (predictions will still be shown)
    const dataToUse = data && data.length > 0 ? data : [];

    // Sort data by date to ensure proper chronological order
    const sortedData = [...dataToUse]
      .filter(d => d && d.date) // Filter out invalid entries
      .sort((a, b) => {
        try {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (isNaN(dateA) || isNaN(dateB)) return 0;
          return dateA - dateB;
        } catch (error) {
          console.error('Error sorting data by date:', error);
          return 0;
        }
      });

    // Debug: Log what data we're plotting
    if (sortedData.length > 0) {
      // Debug logging removed to prevent console warnings
    }

    const traces: PlotlyData[] = [];

    // Main price line (gold yellow) - use close values when available, show all data points
    // For dates before market data (before Oct 6), use predicted_price as fallback
    // Note: Data from Dashboard is already converted via convertChartData, so we use it directly
    const goldLineData = sortedData
      .filter(d => d.close != null || d.predicted_price != null)
      .map(d => {
        // Use close if available (market data), otherwise use predicted_price (for dates before Oct 6)
        // Data is already converted by convertChartData in Dashboard, so use directly
        let price: number | null = null;
        
        if (d.close != null && typeof d.close === 'number' && isFinite(d.close)) {
          // close is already in the target currency (converted by convertChartData)
          price = d.close;
        } else if (d.predicted_price != null && typeof d.predicted_price === 'number' && isFinite(d.predicted_price)) {
          // predicted_price is still in USD/troy-ounce, so convert it
          try {
            if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
              price = convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price;
            } else {
              console.warn('Invalid exchange rate for predicted_price conversion');
              price = d.predicted_price; // Use unconverted price as fallback
            }
          } catch (error) {
            console.error('Error converting predicted_price:', error);
            price = d.predicted_price; // Use unconverted price as fallback
          }
        }
        
        return {
          date: d.date,
          price,
          isPrediction: d.close == null && d.predicted_price != null, // Mark if this is prediction-only data
        };
      })
      .filter(d => d.price != null); // Remove any null prices

    if (goldLineData.length > 0) {
      traces.push({
        x: goldLineData.map(d => d.date),
        y: goldLineData.map(d => {
          const price = d.price;
          if (price == null || typeof price !== 'number' || !isFinite(price)) {
            return 0;
          }
          return price;
        }),
        type: 'scatter',
        mode: 'lines',
        name: 'Gold Price Line',
        line: {
          color: '#F5D300',
          width: 2,
        },
        hovertemplate: `Date: %{x}<br>Price: %{customdata}<extra></extra>`,
        customdata: goldLineData.map(d => formatLKRValue(d.price ?? 0)),
      });
    }

    // Accuracy Line - show all predicted prices with specified color #0055ff
    // Combine historical predictions with predictions from data array and main prediction
    const allPredictions: HistoricalPrediction[] = [];
    
    // Add predictions from data array (includes predictions before Oct 6 that backend added)
    if (sortedData && sortedData.length > 0) {
      sortedData.forEach(d => {
        if (d.predicted_price != null && typeof d.predicted_price === 'number' && isFinite(d.predicted_price) && d.date) {
          // Check if this date already exists to avoid duplicates
          const exists = allPredictions.some(p => p.date === d.date);
          if (!exists) {
            allPredictions.push({
              date: d.date,
              predicted_price: d.predicted_price,
            });
          }
        }
      });
    }
    
    // Add all historical predictions (including future ones)
    if (historicalPredictions && historicalPredictions.length > 0) {
      historicalPredictions.forEach(p => {
        if (p && p.predicted_price != null && typeof p.predicted_price === 'number' && isFinite(p.predicted_price) && p.date) {
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
    
    // Add the main prediction if it exists and isn't already in historical predictions
    if (prediction && 
        prediction.predicted_price != null && 
        typeof prediction.predicted_price === 'number' && 
        isFinite(prediction.predicted_price) && 
        prediction.next_day) {
      const predictionDate = prediction.next_day;
      const alreadyIncluded = allPredictions.some(p => p.date === predictionDate);
      if (!alreadyIncluded) {
        allPredictions.push({
          date: predictionDate,
          predicted_price: prediction.predicted_price,
        });
      }
    }
    
    // Sort predictions by date to ensure proper line drawing (ascending order)
    allPredictions.sort((a, b) => {
      try {
        if (!a || !a.date || !b || !b.date) return 0;
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateA - dateB;
      } catch (error) {
        console.error('Error sorting allPredictions:', error);
        return 0;
      }
    });

    if (allPredictions.length > 0) {
      // Convert predictions to current currency unit
      const convertedGhostData = allPredictions
        .filter(p => p && p.predicted_price != null && typeof p.predicted_price === 'number' && isFinite(p.predicted_price) && p.date)
        .map(p => {
          try {
            if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
              return {
                ...p,
                predicted_price: convertPrice(p.predicted_price, currencyUnit, usdToLkrRate).price
              };
            } else {
              console.warn('Invalid exchange rate for prediction conversion');
              return p; // Return unconverted prediction
            }
          } catch (error) {
            console.error('Error converting prediction price:', error);
            return p; // Return unconverted prediction
          }
        })
        .sort((a, b) => {
          try {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateA - dateB;
          } catch (error) {
            console.error('Error sorting converted predictions:', error);
            return 0;
          }
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
        customdata: convertedGhostData.map(p => formatLKRValue(p.predicted_price ?? 0)),
      });
    }

    let predDate: string | undefined;
    let predPrice: number | undefined;

    if (prediction && prediction.predicted_price != null && typeof prediction.predicted_price === 'number' && isFinite(prediction.predicted_price)) {
      predDate = prediction.next_day;
      try {
        if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
          predPrice = convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price;
        } else {
          console.warn('Invalid exchange rate for prediction price conversion');
          predPrice = prediction.predicted_price; // Use unconverted price as fallback
        }
      } catch (error) {
        console.error('Error converting prediction price:', error);
        predPrice = prediction.predicted_price; // Use unconverted price as fallback
      }
    }

    // Current price marker - use last available date from sorted data
    const lastDate = sortedData && sortedData.length > 0 
      ? sortedData[sortedData.length - 1]?.date ?? new Date().toISOString().split('T')[0]
      : (historicalPredictions && historicalPredictions.length > 0
          ? historicalPredictions[historicalPredictions.length - 1]?.date ?? new Date().toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]);

    const safeLastDate = lastDate ?? new Date().toISOString().split('T')[0];
    traces.push({
      x: [safeLastDate] as string[],
      y: [currentPrice],
      type: 'scatter',
      mode: 'markers',
      name: 'Current Price',
      marker: {
        color: '#F5D300', // Back to original yellow
        size: 9,
      },
        hovertemplate: `Current Price<br>Date: %{x}<br>Price: ${formatLKRValue(currentPrice || 0)}<extra></extra>`,
    });

    // Current price horizontal line
    traces.push({
      x: [sortedData && sortedData.length > 0 ? sortedData[0]?.date ?? safeLastDate : safeLastDate, safeLastDate] as string[],
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
      // Prediction line
      traces.push({
        x: [safeLastDate, predDate] as string[],
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
        hovertemplate: `Prediction Date: %{x}<br>Price: ${formatLKRValue(predPrice || 0)}<extra></extra>`,
      });

      // Prediction horizontal line
      traces.push({
        x: [sortedData && sortedData.length > 0 ? sortedData[0]?.date ?? predDate : predDate, predDate],
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

    return traces;
  }, [data, prediction, historicalPredictions, currentPrice, currencyUnit, usdToLkrRate, formatLKRValue]);

  const layout = useMemo(() => {
    // Use data if available, otherwise prepare for predictions-only display
    const hasData = data && data.length > 0;
    const hasPredictions = historicalPredictions && historicalPredictions.length > 0;
    
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
    const dataToUse = data && data.length > 0 ? data : [];

    // Dynamic LKR tick calculation for clean chart
    const getLKRTickVals = () => {
      // close values are already converted by convertChartData
      const allPrices = dataToUse
        .filter(d => d.close != null && typeof d.close === 'number' && isFinite(d.close))
        .map(d => d.close as number);
      // Also include predicted_price values for y-axis range (convert from USD)
      dataToUse.forEach(d => {
        if (d.predicted_price != null && typeof d.predicted_price === 'number' && isFinite(d.predicted_price) && d.close == null) {
          try {
            if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
              allPrices.push(convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price);
            } else {
              allPrices.push(d.predicted_price); // Use unconverted price
            }
          } catch (error) {
            console.error('Error converting predicted_price for y-axis:', error);
            allPrices.push(d.predicted_price); // Use unconverted price
          }
        }
      });
      if (currentPrice > 0 && isFinite(currentPrice)) allPrices.push(currentPrice);
      if (prediction && prediction.predicted_price != null && typeof prediction.predicted_price === 'number' && isFinite(prediction.predicted_price)) {
        try {
          if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
            allPrices.push(convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price);
          } else {
            allPrices.push(prediction.predicted_price); // Use unconverted price
          }
        } catch (error) {
          console.error('Error converting prediction price for y-axis:', error);
          allPrices.push(prediction.predicted_price); // Use unconverted price
        }
      }
      
      if (allPrices.length === 0) return [0];
      
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
      
      return levels.filter(val => val > 0); // Filter out zero if it appears
    };

    const predPriceConverted = prediction && 
        prediction.predicted_price != null && 
        typeof prediction.predicted_price === 'number' && 
        isFinite(prediction.predicted_price)
        ? (() => {
            try {
              if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
                return convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price;
              } else {
                console.warn('Invalid exchange rate for predPriceConverted');
                return prediction.predicted_price;
              }
            } catch (error) {
              console.error('Error converting predPriceConverted:', error);
              return prediction.predicted_price;
            }
          })()
        : undefined;

    // Calculate y-axis range with padding for zoom out effect
    const getAllPrices = () => {
      // Include close prices from data (already converted by convertChartData)
      const prices = dataToUse
        .filter(d => d.close != null && typeof d.close === 'number' && isFinite(d.close))
        .map(d => d.close as number);
      // Also include predicted_price as fallback for dates without close values
      // Note: predicted_price is still in USD, so convert it
      dataToUse.forEach(d => {
        if (d.predicted_price != null && typeof d.predicted_price === 'number' && isFinite(d.predicted_price) && d.close == null) {
          try {
            if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
              prices.push(convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price);
            } else {
              prices.push(d.predicted_price); // Use unconverted price
            }
          } catch (error) {
            console.error('Error converting predicted_price in getAllPrices:', error);
            prices.push(d.predicted_price); // Use unconverted price
          }
        }
      });
      if (currentPrice > 0 && isFinite(currentPrice)) prices.push(currentPrice);
      if (predPriceConverted !== undefined && isFinite(predPriceConverted)) prices.push(predPriceConverted);
      // Include all prediction prices from historical_predictions (convert from USD)
      if (historicalPredictions && historicalPredictions.length > 0) {
        historicalPredictions.forEach(p => {
          if (p.predicted_price != null && typeof p.predicted_price === 'number' && isFinite(p.predicted_price)) {
            try {
              if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
                prices.push(convertPrice(p.predicted_price, currencyUnit, usdToLkrRate).price);
              } else {
                prices.push(p.predicted_price); // Use unconverted price
              }
            } catch (error) {
              console.error('Error converting historical prediction price:', error);
              prices.push(p.predicted_price); // Use unconverted price
            }
          }
        });
      }
      return prices;
    };

    const allPrices = getAllPrices();
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
        dtick: data && data.length > 30 ? 7 * 24 * 60 * 60 * 1000 : undefined,
        // Explicitly set range to show all dates from data AND predictions, including dates before Oct 6
        // Combine market data dates with prediction dates to get full range
        range: (() => {
          // Collect all dates from market data
          const dataDates = dataToUse && dataToUse.length > 0 ? dataToUse.map(d => d.date) : [];
          
          // Collect all dates from predictions (including before Oct 6)
          const predictionDates = historicalPredictions && historicalPredictions.length > 0
            ? historicalPredictions.map(p => p.date)
            : [];
          
          // Add main prediction date if exists
          if (prediction && prediction.next_day) {
            predictionDates.push(prediction.next_day);
          }
          
          // Combine and find earliest and latest
          const allDates = [...new Set([...dataDates, ...predictionDates])].sort();
          
          if (allDates.length === 0) return undefined;
          
          const firstDate = allDates[0];
          const lastDate = allDates[allDates.length - 1];
          if (!firstDate || !lastDate) return undefined;
          
          const earliestDate = new Date(firstDate);
          const latestDate = new Date(lastDate);
          
          // Add 2 days padding on each side to ensure full visibility
          earliestDate.setDate(earliestDate.getDate() - 2);
          latestDate.setDate(latestDate.getDate() + 2);
          
          const rangeStart = earliestDate.toISOString();
          const rangeEnd = latestDate.toISOString();
          
          // Debug logging removed to prevent console warnings
          
          return [rangeStart, rangeEnd];
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
          tickvals: getLKRTickVals(),
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
      hovermode: 'x' as const,
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
      annotations: [
        // Current price annotation aligned with prediction
        ...(dataToUse && dataToUse.length > 0 ? [{
          x: prediction && prediction.predicted_price ? prediction.next_day : dataToUse[dataToUse.length - 1]?.date ?? '',
          y: currentPrice,
          text: formatLKRValue(currentPrice || 0),
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
        // Prediction price annotation
        ...(predPriceConverted !== undefined && prediction ? [{
          x: prediction.next_day,
          y: predPriceConverted, // Use the converted price
          text: formatLKRValue(predPriceConverted || 0),
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
      ]
    };
  }, [isDark, height, currentPrice, prediction, data, historicalPredictions, currencyUnit, usdToLkrRate, formatLKRValue, zoomLevel]);

  const config = {
    displayModeBar: false,
    displaylogo: false,
    responsive: true,
  };

  // Allow chart to render even if only predictions are available (no market data yet)
  const hasData = data && data.length > 0;
  const hasPredictions = historicalPredictions && historicalPredictions.length > 0;
  
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

  // Additional safety check before rendering Plot
  if (!plotData || plotData.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg`}
        style={{ height: `${height}px` }}
      >
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Plot
        key={`plot-${currencyUnit}-${data?.length || 0}-${isDark}-${zoomLevel}`}
        data={plotData ?? []}
        layout={layout as unknown as Plotly.Layout}
        config={config}
        style={{ width: '100%', height: `${height}px` }}
        useResizeHandler={true}
        onError={(_error) => {
          console.error('Plotly error:', _error);
        }}
      />
    </div>
  );
};

export default Chart;