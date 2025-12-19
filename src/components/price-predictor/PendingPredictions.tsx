import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import type { PendingPredictionItem } from '../../store/api/goldApi';

interface PendingPredictionsProps {
  predictions: PendingPredictionItem[];
  isLoading?: boolean;
  isDark: boolean;
}

const PendingPredictions: React.FC<PendingPredictionsProps> = ({
  predictions,
  isLoading = false,
  isDark,
}) => {
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
          Pending Predictions
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
          Pending Predictions
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
          <AccessTime
            sx={{
              fontSize: '3rem',
              color: isDark ? '#6b7280' : '#9ca3af',
              marginBottom: '1rem',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: isDark ? '#9ca3af' : '#6b7280',
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            No pending predictions
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isDark ? '#6b7280' : '#9ca3af',
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              marginTop: '0.5rem',
            }}
          >
            All predictions have been evaluated
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: { xs: '0.5rem', sm: '0.75rem' },
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
          Pending Predictions
        </Typography>
        <Chip
          label={`${predictions.length} pending`}
          size="small"
          sx={{
            backgroundColor: isDark ? 'rgba(255, 165, 0, 0.2)' : '#fff3cd',
            color: isDark ? '#ffa500' : '#856404',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
          color: isDark ? '#9ca3af' : '#6b7280',
          marginBottom: { xs: '0.75rem', sm: '1rem' },
          lineHeight: 1.5,
        }}
      >
        Predictions awaiting market results for evaluation
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
                Predicted Price
              </TableCell>
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
                Method
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
            {predictions.map((prediction, index) => {
              // Format date for display
              const dateObj = new Date(prediction.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <TableRow
                  key={`${prediction.date}-${index}`}
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      color: isDark ? '#e5e7eb' : '#111827',
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                    }}
                  >
                    {formattedDate}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: isDark ? '#e5e7eb' : '#111827',
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      fontWeight: 500,
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                    }}
                  >
                    ${prediction.predicted_price?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                    }}
                  >
                    {prediction.method || 'Lasso Regression'}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: { xs: '0.75rem 0.5rem', sm: '1rem' },
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
                    }}
                  >
                    <Chip
                      icon={<AccessTime sx={{ fontSize: '0.875rem !important' }} />}
                      label="Pending"
                      size="small"
                      sx={{
                        backgroundColor: isDark ? 'rgba(255, 165, 0, 0.2)' : '#fff3cd',
                        color: isDark ? '#ffa500' : '#856404',
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        '& .MuiChip-icon': {
                          color: isDark ? '#ffa500' : '#856404',
                        },
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

export default PendingPredictions;

