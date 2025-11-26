import React, { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Plot from 'react-plotly.js';
import type { AccuracyDataPoint } from '../../store/api/goldApi';

interface AccuracyVisualizationChartProps {
  data: AccuracyDataPoint[];
  isDark: boolean;
  height?: number;
}

const AccuracyVisualizationChart: React.FC<AccuracyVisualizationChartProps> = ({
  data,
  isDark,
  height = 400,
}) => {

  const plotData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const dates = data.map((d) => d.date);
    const predictedPrices = data.map((d) => d.predicted_price);
    const actualPrices = data.map((d) => d.actual_price);

    return [
      {
        x: dates,
        y: predictedPrices,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Predicted Price',
        line: { color: 'rgb(75, 192, 192)', width: 2 },
        marker: { size: 6 },
      },
      {
        x: dates,
        y: actualPrices,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Actual Price',
        line: { color: 'rgb(255, 99, 132)', width: 2 },
        marker: { size: 6 },
      },
    ];
  }, [data]);

  const layout = useMemo(
    () => ({
      title: {
        text: 'Predicted vs Actual Prices',
        font: { size: 16, color: isDark ? '#FFFFFF' : '#000000' },
      },
      xaxis: {
        title: 'Date',
        color: isDark ? '#CCCCCC' : '#666666',
        gridcolor: isDark ? '#333333' : '#E0E0E0',
        showgrid: true,
      },
      yaxis: {
        title: 'Price (USD)',
        color: isDark ? '#CCCCCC' : '#666666',
        gridcolor: isDark ? '#333333' : '#E0E0E0',
        showgrid: true,
      },
      plot_bgcolor: isDark ? '#111111' : '#FFFFFF',
      paper_bgcolor: isDark ? '#111111' : '#FFFFFF',
      font: { color: isDark ? '#CCCCCC' : '#666666' },
      legend: {
        x: 0,
        y: 1,
        bgcolor: isDark ? 'rgba(17, 17, 17, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        bordercolor: isDark ? '#333333' : '#E0E0E0',
      },
      margin: { l: 60, r: 30, t: 50, b: 60 },
      height,
      hovermode: 'x unified' as const,
    }),
    [isDark, height]
  );

  if (!plotData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height,
          backgroundColor: isDark ? '#111111' : '#FFFFFF',
          border: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
          borderRadius: '10px',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: isDark ? '#111111' : '#FFFFFF',
        border: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
        borderRadius: '10px',
        padding: '1rem',
        height: '100%',
      }}
    >
      <Plot
        data={plotData as Plotly.Data[]}
        layout={layout as unknown as Plotly.Layout}
        config={{
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          responsive: true,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
};

export default AccuracyVisualizationChart;

