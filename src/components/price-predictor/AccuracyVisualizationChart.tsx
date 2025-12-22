import React, { useEffect, useRef, useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, CrosshairMode } from 'lightweight-charts';
import type { AccuracyDataPoint } from '../../store/api/goldApi';

interface AccuracyVisualizationChartProps {
  data: AccuracyDataPoint[];
  isDark: boolean;
  height?: number;
}

const AccuracyVisualizationChart: React.FC<AccuracyVisualizationChartProps> = ({
  data,
  isDark,
  height = 300,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const predictedSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const actualSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    return data
      .filter((d): d is AccuracyDataPoint & { predicted_price: number; actual_price: number } => 
        d.date != null && d.predicted_price != null && d.actual_price != null
      )
      .map(d => {
        const date = new Date(d.date);
        // Format as YYYY-MM-DD for lightweight-charts
        const timeStr = date.toISOString().split('T')[0];
        return {
          time: timeStr as string,
          predicted: d.predicted_price,
          actual: d.actual_price,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.time as string).getTime();
        const dateB = new Date(b.time as string).getTime();
        return dateA - dateB;
      });
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current || !chartData || chartData.length === 0) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: 'transparent',
        },
        textColor: isDark ? '#9ca3af' : '#6b7280',
        fontSize: 11,
      },
      grid: {
        vertLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          style: LineStyle.Solid,
        },
        horzLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          style: LineStyle.Solid,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
    });

    chartRef.current = chart;

    // Add predicted price series
    const predictedSeries = chart.addLineSeries({
      color: '#26d4b4',
      lineWidth: 2,
      title: 'Predicted',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: false,
    });

    // Add actual price series
    const actualSeries = chart.addLineSeries({
      color: isDark ? '#fde047' : '#facc15',
      lineWidth: 2,
      title: 'Actual',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: false,
    });

    predictedSeriesRef.current = predictedSeries;
    actualSeriesRef.current = actualSeries;

    // Set data
    predictedSeries.setData(
      chartData.map(d => ({
        time: d.time,
        value: d.predicted,
      }))
    );

    actualSeries.setData(
      chartData.map(d => ({
        time: d.time,
        value: d.actual,
      }))
    );

    // Fit content
    chart.timeScale().fitContent();

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
  }, [chartData, isDark, height]);

  // Update theme when isDark changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        layout: {
          textColor: isDark ? '#9ca3af' : '#6b7280',
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
            color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          },
          horzLine: {
            color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          },
        },
        rightPriceScale: {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        timeScale: {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      });

      // Update series colors
      if (actualSeriesRef.current) {
        actualSeriesRef.current.applyOptions({
          color: isDark ? '#fde047' : '#facc15',
        });
      }
    }
  }, [isDark]);

  if (!chartData || chartData.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height,
          backgroundColor: 'transparent',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: 'transparent',
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: `${height}px`,
        }}
      />
      {/* Legend */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Box
            sx={{
              width: '16px',
              height: '3px',
              backgroundColor: '#26d4b4',
              borderRadius: '2px',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              color: isDark ? '#d1d5db' : '#374151',
              fontWeight: 500,
            }}
          >
            Predicted
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Box
            sx={{
              width: '16px',
              height: '3px',
              backgroundColor: isDark ? '#fde047' : '#facc15',
              borderRadius: '2px',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              color: isDark ? '#d1d5db' : '#374151',
              fontWeight: 500,
            }}
          >
            Actual
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AccuracyVisualizationChart;
