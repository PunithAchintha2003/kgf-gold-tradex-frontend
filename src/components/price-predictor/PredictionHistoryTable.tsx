import React, { useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import type { PredictionHistoryItem } from '../../store/api/goldApi';

interface PredictionHistoryTableProps {
  predictions: PredictionHistoryItem[];
  isLoading?: boolean;
  isDark: boolean;
}

const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = ({
  predictions,
  isLoading = false,
  isDark,
}) => {
  // Sort predictions: pending items first, then by date (newest first)
  // MUST be called before any early returns (Rules of Hooks)
  const sortedPredictions = useMemo(() => {
    if (!predictions || predictions.length === 0) return [];
    
    return [...predictions].sort((a, b) => {
      // First, sort by status: pending items come first
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // If both have same status, sort by date (newest first)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [predictions]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 600,
            color: isDark ? '#FFFFFF' : '#111827',
          }}
        >
          Prediction History
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
            borderRadius: '8px',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      </Box>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 600,
            color: isDark ? '#FFFFFF' : '#111827',
          }}
        >
          Prediction History
        </Typography>
        <Box
          sx={{
            padding: { xs: '2rem 1rem', sm: '2rem' },
            textAlign: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
            borderRadius: '8px',
          }}
        >
          <Typography
            variant="body2"
            sx={{ 
              color: isDark ? '#9ca3af' : '#6b7280',
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            No prediction history available
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: '0.75rem', sm: '1rem' },
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
        Prediction History
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
        Track the accuracy of past predictions compared to actual prices
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          maxHeight: { xs: '300px', sm: '400px' },
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
          borderRadius: '8px',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? 'rgba(255, 255, 255, 0.2)' : '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: isDark ? 'rgba(255, 255, 255, 0.3)' : '#666',
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                  padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Date
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                  padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Predicted
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                  padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Actual
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                  padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Accuracy
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                  padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPredictions.map((pred, index) => {
              const accuracy = pred.accuracy_percentage != null && 
                               typeof pred.accuracy_percentage === 'number' && 
                               isFinite(pred.accuracy_percentage)
                ? pred.accuracy_percentage
                : null;
              
              const getAccuracyColor = () => {
                if (accuracy === null) return isDark ? '#9ca3af' : '#6b7280';
                if (accuracy >= 95) return '#10b981'; // green
                if (accuracy >= 90) return '#3b82f6'; // blue
                if (accuracy >= 85) return '#f59e0b'; // amber
                return '#ef4444'; // red
              };

              return (
                <TableRow
                  key={`${pred.date}-${index}`}
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      color: isDark ? '#e5e7eb' : '#374151',
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                    }}
                  >
                    {new Date(pred.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: '#26d4b4',
                      fontWeight: 500,
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                      fontFamily: 'monospace',
                    }}
                  >
                    {pred.predicted_price != null && 
                     typeof pred.predicted_price === 'number' && 
                     isFinite(pred.predicted_price)
                      ? `$${pred.predicted_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: isDark ? '#fde047' : '#facc15',
                      fontWeight: 500,
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                      fontFamily: 'monospace',
                    }}
                  >
                    {pred.actual_price != null && 
                     typeof pred.actual_price === 'number' && 
                     isFinite(pred.actual_price)
                      ? `$${pred.actual_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'Pending'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: getAccuracyColor(),
                      fontWeight: 600,
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                    }}
                  >
                    {accuracy !== null
                      ? `${accuracy.toFixed(2)}%`
                      : '-'}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                    }}
                  >
                    <Chip
                      label={pred.status === 'completed' ? 'Completed' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor:
                          pred.status === 'completed'
                            ? isDark
                              ? 'rgba(16, 185, 129, 0.2)'
                              : '#d1fae5'
                            : isDark
                            ? 'rgba(250, 204, 21, 0.2)'
                            : '#fef3c7',
                        color:
                          pred.status === 'completed'
                            ? isDark
                              ? '#10b981'
                              : '#065f46'
                            : isDark
                            ? '#facc15'
                            : '#92400e',
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: '20px', sm: '24px' },
                        border: `1px solid ${
                          pred.status === 'completed'
                            ? isDark
                              ? 'rgba(16, 185, 129, 0.3)'
                              : '#10b981'
                            : isDark
                            ? 'rgba(250, 204, 21, 0.3)'
                            : '#facc15'
                        }`,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PredictionHistoryTable;










