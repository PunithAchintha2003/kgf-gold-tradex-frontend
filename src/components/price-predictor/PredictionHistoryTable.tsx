import React from 'react';
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
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          backgroundColor: isDark ? '#111111' : '#FFFFFF',
          border: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
          borderRadius: '10px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Box
        sx={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: isDark ? '#111111' : '#FFFFFF',
          border: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
          borderRadius: '10px',
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: isDark ? '#CCCCCC' : '#666666' }}
        >
          No prediction history available
        </Typography>
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
        overflow: 'auto',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: '1rem',
          color: isDark ? '#FFFFFF' : '#000000',
          fontWeight: 600,
        }}
      >
        Prediction History
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
          boxShadow: 'none',
          maxHeight: '500px',
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                  color: isDark ? '#CCCCCC' : '#666666',
                  fontWeight: 600,
                  borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                }}
              >
                Date
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                  color: isDark ? '#CCCCCC' : '#666666',
                  fontWeight: 600,
                  borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                }}
              >
                Predicted
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                  color: isDark ? '#CCCCCC' : '#666666',
                  fontWeight: 600,
                  borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                }}
              >
                Actual
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                  color: isDark ? '#CCCCCC' : '#666666',
                  fontWeight: 600,
                  borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                }}
              >
                Accuracy
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                  color: isDark ? '#CCCCCC' : '#666666',
                  fontWeight: 600,
                  borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {predictions.map((pred, index) => (
              <TableRow
                key={`${pred.date}-${index}`}
                sx={{
                  '&:hover': {
                    backgroundColor: isDark ? '#222222' : '#EEEEEE',
                  },
                }}
              >
                <TableCell
                  sx={{
                    color: isDark ? '#CCCCCC' : '#666666',
                    borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                  }}
                >
                  {new Date(pred.date).toLocaleDateString()}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: isDark ? '#CCCCCC' : '#666666',
                    borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                  }}
                >
                  ${pred.predicted_price.toFixed(2)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: isDark ? '#CCCCCC' : '#666666',
                    borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                  }}
                >
                  {pred.actual_price ? `$${pred.actual_price.toFixed(2)}` : 'Pending'}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: isDark ? '#CCCCCC' : '#666666',
                    borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                  }}
                >
                  {pred.accuracy_percentage
                    ? `${pred.accuracy_percentage.toFixed(2)}%`
                    : '-'}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    borderBottom: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
                  }}
                >
                  <Chip
                    label={pred.status}
                    size="small"
                    sx={{
                      backgroundColor:
                        pred.status === 'completed'
                          ? isDark
                            ? '#28a745'
                            : '#d4edda'
                          : isDark
                          ? '#ffc107'
                          : '#fff3cd',
                      color:
                        pred.status === 'completed'
                          ? isDark
                            ? '#FFFFFF'
                            : '#155724'
                          : isDark
                          ? '#000000'
                          : '#856404',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PredictionHistoryTable;










