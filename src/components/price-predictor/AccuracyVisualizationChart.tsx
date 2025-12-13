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
        name: 'Predicted',
        line: { color: '#26d4b4', width: 2.5 },
        marker: { size: 5, color: '#26d4b4' },
        hovertemplate: '<span style="color: #26d4b4; margin-right: 6px;">●</span><b>Predicted:</b> <span style="font-family: monospace; margin-left: 8px;">$%{y:,.2f}</span><extra></extra>',
      },
      {
        x: dates,
        y: actualPrices,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Actual',
        line: { color: isDark ? '#fde047' : '#facc15', width: 2.5 },
        marker: { size: 5, color: isDark ? '#fde047' : '#facc15' },
        hovertemplate: `<span style="color: ${isDark ? '#fde047' : '#facc15'}; margin-right: 6px;">●</span><b>Actual:</b> <span style="font-family: monospace; margin-left: 24px;">$%{y:,.2f}</span><extra></extra>`,
      },
    ];
  }, [data, isDark]);

  const layout = useMemo(
    () => ({
      title: {
        text: '',
        font: { size: 0 },
      },
      xaxis: {
        title: {
          text: 'Date',
          font: { size: 12, color: isDark ? '#9ca3af' : '#6b7280' },
        },
        color: isDark ? '#9ca3af' : '#6b7280',
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        showgrid: true,
        tickfont: { size: 10, color: isDark ? '#9ca3af' : '#6b7280' },
        type: 'date',
        tickformat: '%b %d, %Y',
        hoverformat: '%B %d, %Y',
      },
      yaxis: {
        title: {
          text: 'Price (USD)',
          font: { size: 12, color: isDark ? '#9ca3af' : '#6b7280' },
        },
        color: isDark ? '#9ca3af' : '#6b7280',
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        showgrid: true,
        tickfont: { size: 10, color: isDark ? '#9ca3af' : '#6b7280' },
      },
      plot_bgcolor: 'transparent',
      paper_bgcolor: 'transparent',
      font: { color: isDark ? '#9ca3af' : '#6b7280', size: 11 },
      legend: {
        x: 0.5,
        xanchor: 'center',
        y: 0.02,
        yanchor: 'bottom',
        orientation: 'h',
        bgcolor: 'transparent',
        bordercolor: 'transparent',
        font: { size: 12, color: isDark ? '#d1d5db' : '#374151' },
        itemclick: 'toggleothers' as const,
        itemdoubleclick: 'toggle' as const,
      },
      margin: { l: 50, r: 20, t: 20, b: 50 },
      height,
      hovermode: 'x unified' as const,
      showlegend: true,
      hoverlabel: {
        bgcolor: isDark ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        bordercolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        font: { 
          size: 13, 
          color: isDark ? '#f3f4f6' : '#111827',
          family: 'system-ui, -apple-system, sans-serif',
        },
        align: 'left',
        namelength: -1,
        padding: { t: 10, b: 10, l: 12, r: 12 },
        split: false,
      },
      hoverdistance: 20,
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
        height: '100%',
        width: '100%',
      }}
    >
      <Plot
        data={plotData as Plotly.Data[]}
        layout={layout as unknown as Plotly.Layout}
        config={{
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
          responsive: true,
          toImageButtonOptions: {
            format: 'png',
            filename: 'accuracy-chart',
            height,
            width: 800,
            scale: 2,
          },
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
};

export default AccuracyVisualizationChart;

