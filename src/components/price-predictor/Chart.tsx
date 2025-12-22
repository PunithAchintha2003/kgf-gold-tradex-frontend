import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, CrosshairMode, PriceLineOptions, Time, PriceScaleMode } from 'lightweight-charts';
import type { DailyDataPoint, HistoricalPrediction, Prediction } from '../../store/api/goldApi';
import type { CurrencyUnit } from './CurrencyDropdown';
import { convertPrice } from '../../utils/currencyConverter';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const goldPriceSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const accuracyLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const predictionSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const currentPriceMarkerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const currentPriceLineRef = useRef<ReturnType<ISeriesApi<'Line'>['createPriceLine']> | null>(null);
  const predictedPriceLineRef = useRef<ReturnType<ISeriesApi<'Line'>['createPriceLine']> | null>(null);

  // Helper function to format price values
  const formatPrice = useCallback((value: number | null | undefined): string => {
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

  // Convert realtime price
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
  
  // Calculate current price
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
    return 0;
  }, [convertedRealtimePrice, data]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    const dataToUse = data && data.length > 0 ? data : [];

    // Sort data by date
    const sortedData = [...dataToUse]
      .filter(d => d && d.date)
      .sort((a, b) => {
        try {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (isNaN(dateA) || isNaN(dateB)) return 0;
          return dateA - dateB;
        } catch {
          return 0;
        }
      });

    // Prepare gold price line data
    const goldLineData = sortedData
      .filter(d => d.close != null || d.predicted_price != null)
      .map(d => {
        let price: number | null = null;
        
        if (d.close != null && typeof d.close === 'number' && isFinite(d.close)) {
          price = d.close; // Already converted by convertChartData
        } else if (d.predicted_price != null && typeof d.predicted_price === 'number' && isFinite(d.predicted_price)) {
          try {
            if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
              price = convertPrice(d.predicted_price, currencyUnit, usdToLkrRate).price;
            } else {
              price = d.predicted_price;
            }
          } catch {
            price = d.predicted_price;
          }
        }
        
        // Ensure date is in YYYY-MM-DD format for lightweight-charts
        const dateStr = d.date;
        return {
          time: (dateStr as string) as Time,
          value: price,
        };
      })
      .filter((d): d is { time: Time; value: number } => 
        d.value != null && isFinite(d.value)
      )
      .map(d => ({
        time: d.time,
        value: d.value,
      }));

    // Prepare accuracy line (historical predictions)
    const allPredictions: HistoricalPrediction[] = [];
    
    // Add predictions from data array
    if (sortedData && sortedData.length > 0) {
      sortedData.forEach(d => {
        if (d.predicted_price != null && typeof d.predicted_price === 'number' && isFinite(d.predicted_price) && d.date) {
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
    
    // Add historical predictions
    if (historicalPredictions && historicalPredictions.length > 0) {
      historicalPredictions.forEach(p => {
        if (p && p.predicted_price != null && typeof p.predicted_price === 'number' && isFinite(p.predicted_price) && p.date) {
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
    
    // Add main prediction
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
    
    // Sort predictions by date
    allPredictions.sort((a, b) => {
      try {
        if (!a || !a.date || !b || !b.date) return 0;
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateA - dateB;
      } catch {
        return 0;
      }
    });

    // Convert predictions to chart data
    const accuracyLineData = allPredictions
        .filter(p => p && p.predicted_price != null && typeof p.predicted_price === 'number' && isFinite(p.predicted_price) && p.date)
        .map(p => {
          try {
            if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
              return {
              time: (p.date as string) as Time,
              value: convertPrice(p.predicted_price, currencyUnit, usdToLkrRate).price,
              };
            } else {
            return {
              time: (p.date as string) as Time,
              value: p.predicted_price,
            };
          }
        } catch {
          return {
            time: (p.date as string) as Time,
            value: p.predicted_price,
          };
        }
      })
      .filter(d => d.value != null && isFinite(d.value));

    // Prepare prediction line (from current to future prediction)
    let predictionLineData: Array<{ time: Time; value: number }> = [];
    if (prediction && prediction.predicted_price != null && typeof prediction.predicted_price === 'number' && isFinite(prediction.predicted_price) && prediction.next_day) {
      const lastDate = sortedData && sortedData.length > 0 
        ? sortedData[sortedData.length - 1]?.date 
        : (historicalPredictions && historicalPredictions.length > 0
            ? historicalPredictions[historicalPredictions.length - 1]?.date
            : new Date().toISOString().split('T')[0]);
      
      const predDate = prediction.next_day;
      let predPrice: number;
      
      try {
        if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
          predPrice = convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price;
        } else {
          predPrice = prediction.predicted_price;
        }
      } catch {
        predPrice = prediction.predicted_price;
      }

      if (lastDate && currentPrice > 0) {
        predictionLineData = [
          { time: (lastDate as string) as Time, value: currentPrice },
          { time: (predDate as string) as Time, value: predPrice },
        ];
      }
    }

    return {
      goldLineData,
      accuracyLineData,
      predictionLineData,
    };
  }, [data, historicalPredictions, prediction, currencyUnit, usdToLkrRate, currentPrice]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with modern TradingView-style configuration
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? '#000000' : '#FFFFFF',
        },
        textColor: isDark ? '#D1D5DB' : '#374151',
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      grid: {
        vertLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          style: LineStyle.Solid,
          visible: true,
        },
        horzLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          style: LineStyle.Solid,
          visible: true,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#1F2937' : '#F3F4F6',
        },
        horzLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#1F2937' : '#F3F4F6',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        mode: PriceScaleMode.Normal,
        entireTextOnly: false,
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 3,
        rightBarStaysOnScroll: true,
        lockVisibleTimeRangeOnResize: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        axisDoubleClickReset: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Add gold price line series
    const goldPriceSeries = chart.addLineSeries({
      color: '#F5D300',
      lineWidth: 2,
      title: 'Gold Price',
      priceFormat: {
        type: 'price',
        precision: currencyUnit === 'pawn' ? 0 : 2,
        minMove: currencyUnit === 'pawn' ? 1 : 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    // Add accuracy line series (historical predictions)
    const accuracyLineSeries = chart.addLineSeries({
      color: '#0055ff',
      lineWidth: 2,
      title: '',
      priceFormat: {
        type: 'price',
        precision: currencyUnit === 'pawn' ? 0 : 2,
        minMove: currencyUnit === 'pawn' ? 1 : 0.01,
      },
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      lineStyle: LineStyle.Solid,
    });

    // Add prediction line series (future prediction)
    const predictionSeries = chart.addLineSeries({
          color: '#00fa2e',
      lineWidth: 2,
      title: 'Prediction',
      priceFormat: {
        type: 'price',
        precision: currencyUnit === 'pawn' ? 0 : 2,
        minMove: currencyUnit === 'pawn' ? 1 : 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      lineStyle: LineStyle.Dashed,
    });

    // Add current price marker series
    const currentPriceMarker = chart.addLineSeries({
      color: '#F5D300',
      lineWidth: 1,
      title: 'Current Price Level',
      priceFormat: {
        type: 'price',
        precision: currencyUnit === 'pawn' ? 0 : 2,
        minMove: currencyUnit === 'pawn' ? 1 : 0.01,
      },
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lineStyle: LineStyle.Dotted,
      visible: false, // Hidden by default, only used for price line
    });

    goldPriceSeriesRef.current = goldPriceSeries;
    accuracyLineSeriesRef.current = accuracyLineSeries;
    predictionSeriesRef.current = predictionSeries;
    currentPriceMarkerRef.current = currentPriceMarker;

    // Set data
    if (chartData.goldLineData.length > 0) {
      goldPriceSeries.setData(chartData.goldLineData);
    }

    if (chartData.accuracyLineData.length > 0) {
      accuracyLineSeries.setData(chartData.accuracyLineData);
    }

    if (chartData.predictionLineData.length > 0) {
      predictionSeries.setData(chartData.predictionLineData);
    }

    // Price lines will be created in the update effect to avoid duplicates

    // Apply zoom level
    if (zoomLevel !== 0 && chartData.goldLineData.length > 0) {
      const timeScale = chart.timeScale();
      const visibleRange = timeScale.getVisibleRange();
      
      if (visibleRange && visibleRange.from && visibleRange.to) {
        // Convert Time to number for calculations (Time can be string or number)
        const fromTime = typeof visibleRange.from === 'string' 
          ? new Date(visibleRange.from).getTime() 
          : (visibleRange.from as number);
        const toTime = typeof visibleRange.to === 'string' 
          ? new Date(visibleRange.to).getTime() 
          : (visibleRange.to as number);
        
        const range = toTime - fromTime;
        const zoomFactor = Math.pow(0.7, zoomLevel);
        const newRange = range * zoomFactor;
        const center = (fromTime + toTime) / 2;
        
        // Convert back to Time format (use string format for dates)
        const newFrom = new Date(center - newRange / 2).toISOString().split('T')[0] as Time;
        const newTo = new Date(center + newRange / 2).toISOString().split('T')[0] as Time;
        
        timeScale.setVisibleRange({
          from: newFrom,
          to: newTo,
        });
      }
    } else {
      // Fit content initially
      chart.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData, isDark, height, currentPrice, prediction, currencyUnit, usdToLkrRate, formatPrice, zoomLevel]);

  // Update theme when isDark changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        layout: {
          background: {
            type: ColorType.Solid,
            color: isDark ? '#000000' : '#FFFFFF',
          },
          textColor: isDark ? '#D1D5DB' : '#374151',
        },
        grid: {
          vertLines: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          },
          horzLines: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          },
        },
        crosshair: {
          vertLine: {
            color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            labelBackgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          },
          horzLine: {
            color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            labelBackgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          },
        },
        rightPriceScale: {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        timeScale: {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      });
    }
  }, [isDark]);

  // Update data when chartData changes
  useEffect(() => {
    if (!chartRef.current) return;

    if (goldPriceSeriesRef.current && chartData.goldLineData.length > 0) {
      goldPriceSeriesRef.current.setData(chartData.goldLineData);
      
      // Update current price line - remove existing one first
      if (currentPrice > 0) {
        // Remove existing price line if it exists
        if (currentPriceLineRef.current) {
          goldPriceSeriesRef.current.removePriceLine(currentPriceLineRef.current);
          currentPriceLineRef.current = null;
        }
        
        // Create new price line
        const priceLine: PriceLineOptions = {
          price: currentPrice,
          color: '#F5D300',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: false,
          lineVisible: true,
          axisLabelColor: '#F5D300',
          axisLabelTextColor: isDark ? '#FFFFFF' : '#000000',
          title: `Current: ${formatPrice(currentPrice)}`,
        };
        currentPriceLineRef.current = goldPriceSeriesRef.current.createPriceLine(priceLine);
            } else {
        // Remove price line if current price is 0 or invalid
        if (currentPriceLineRef.current) {
          goldPriceSeriesRef.current.removePriceLine(currentPriceLineRef.current);
          currentPriceLineRef.current = null;
        }
      }
    }

    if (accuracyLineSeriesRef.current && chartData.accuracyLineData.length > 0) {
      accuracyLineSeriesRef.current.setData(chartData.accuracyLineData);
    }

    if (predictionSeriesRef.current && chartData.predictionLineData.length > 0) {
      predictionSeriesRef.current.setData(chartData.predictionLineData);
      
      // Update prediction price line - remove existing one first
      if (prediction && prediction.predicted_price != null && typeof prediction.predicted_price === 'number' && isFinite(prediction.predicted_price)) {
        try {
          let predPrice: number;
          if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
            predPrice = convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price;
          } else {
            predPrice = prediction.predicted_price;
          }

          // Remove existing price line if it exists
          if (predictedPriceLineRef.current) {
            predictionSeriesRef.current.removePriceLine(predictedPriceLineRef.current);
            predictedPriceLineRef.current = null;
          }

          // Create new price line
          const priceLine: PriceLineOptions = {
            price: predPrice,
            color: '#26d4b4',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: false,
            lineVisible: true,
            axisLabelColor: '#26d4b4',
            axisLabelTextColor: isDark ? '#FFFFFF' : '#000000',
            title: `Predicted: ${formatPrice(predPrice)}`,
          };
          predictedPriceLineRef.current = predictionSeriesRef.current.createPriceLine(priceLine);
        } catch (error) {
          console.error('Error updating prediction price line:', error);
        }
      } else {
        // Remove price line if prediction is invalid
        if (predictedPriceLineRef.current) {
          predictionSeriesRef.current.removePriceLine(predictedPriceLineRef.current);
          predictedPriceLineRef.current = null;
        }
      }
    }

    // Apply zoom
    if (zoomLevel !== 0 && chartData.goldLineData.length > 0) {
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleRange();
      
      if (visibleRange && visibleRange.from && visibleRange.to) {
        // Convert Time to number for calculations
        const fromTime = typeof visibleRange.from === 'string' 
          ? new Date(visibleRange.from).getTime() 
          : (visibleRange.from as number);
        const toTime = typeof visibleRange.to === 'string' 
          ? new Date(visibleRange.to).getTime() 
          : (visibleRange.to as number);
        
        const range = toTime - fromTime;
        const zoomFactor = Math.pow(0.7, zoomLevel);
        const newRange = range * zoomFactor;
        const center = (fromTime + toTime) / 2;
        
        // Convert back to Time format
        const newFrom = new Date(center - newRange / 2).toISOString().split('T')[0] as Time;
        const newTo = new Date(center + newRange / 2).toISOString().split('T')[0] as Time;
        
        timeScale.setVisibleRange({
          from: newFrom,
          to: newTo,
        });
      }
    } else if (chartData.goldLineData.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [chartData, currentPrice, prediction, currencyUnit, usdToLkrRate, formatPrice, zoomLevel, isDark]);

  // Calculate accuracy line price (last value from accuracy line data)
  const accuracyLinePrice = useMemo(() => {
    if (chartData.accuracyLineData && chartData.accuracyLineData.length > 0) {
      const lastValue = chartData.accuracyLineData[chartData.accuracyLineData.length - 1];
      return lastValue?.value ?? null;
    }
    return null;
  }, [chartData.accuracyLineData]);

  // Check if we have data
  const hasData = data && data.length > 0;
  const hasPredictions = historicalPredictions && historicalPredictions.length > 0;
  
  if (!hasData && !hasPredictions) {
    return (
      <div 
        className={`flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg`}
        style={{ height: `${height}px` }}
      >
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      {/* Price Labels Overlay - Top Left Corner */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          backdropFilter: 'blur(8px)',
          boxShadow: isDark 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Current Price Label */}
        {currentPrice > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#F5D300',
                borderRadius: '1px',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: isDark ? '#D1D5DB' : '#374151',
              }}
            >
              Current:
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#F5D300',
              }}
            >
              {formatPrice(currentPrice)}
            </span>
          </div>
        )}
        
        {/* Predicted Price Label */}
        {prediction && 
         prediction.predicted_price != null && 
         typeof prediction.predicted_price === 'number' && 
         isFinite(prediction.predicted_price) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#26d4b4',
                borderRadius: '1px',
                borderStyle: 'dashed',
                borderWidth: '1px',
                borderColor: '#26d4b4',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: isDark ? '#D1D5DB' : '#374151',
              }}
            >
              Predicted:
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#26d4b4',
              }}
            >
              {(() => {
                try {
                  let predPrice: number;
                  if (usdToLkrRate && usdToLkrRate > 0 && isFinite(usdToLkrRate)) {
                    predPrice = convertPrice(prediction.predicted_price, currencyUnit, usdToLkrRate).price;
                  } else {
                    predPrice = prediction.predicted_price;
                  }
                  return formatPrice(predPrice);
                } catch {
                  return formatPrice(prediction.predicted_price);
                }
              })()}
            </span>
          </div>
        )}
        
        {/* Accuracy Line Label */}
        {accuracyLinePrice != null && isFinite(accuracyLinePrice) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#0055ff',
                borderRadius: '1px',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: isDark ? '#D1D5DB' : '#374151',
              }}
            >
              Accuracy Line:
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#0055ff',
              }}
            >
              {formatPrice(accuracyLinePrice)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
