import React from 'react';
import { Typography, Box } from '@mui/material';
import type { 
  AccuracyStats as AccuracyStatsType,
  AccuracyVisualizationStatistics,
  PredictionStatsData
} from '../../store/api/goldApi';

interface AccuracyStatsProps {
  accuracyStats: AccuracyStatsType;
  isDark: boolean;
  newStats?: AccuracyVisualizationStatistics; // Optional new statistics from accuracy-visualization endpoint
  predictionStats?: PredictionStatsData; // Optional comprehensive stats from prediction-stats endpoint
}

const AccuracyStats: React.FC<AccuracyStatsProps> = ({
  accuracyStats,
  isDark,
  newStats,
  predictionStats,
}) => {
  // Use prediction stats if available, otherwise fall back to accuracy stats
  const totalPredictions = predictionStats?.total_predictions ?? accuracyStats.total_predictions;
  const evaluatedPredictions = predictionStats?.evaluated.count ?? accuracyStats.evaluated_predictions;
  const pendingPredictions = predictionStats?.pending.count ?? (totalPredictions - evaluatedPredictions);
  const evaluationRate = predictionStats?.evaluation_rate_percent ?? null;
  
  // Use new stats if available, otherwise fall back to old stats
  const averageAccuracy = predictionStats?.evaluated.average_accuracy ?? newStats?.average_accuracy ?? null;
  const maxAccuracy = newStats?.max_accuracy ?? null;

  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr' },
        gap: { xs: '0.75rem', sm: '1rem' },
      }}
    >
          {/* Average Accuracy Card (new) or R² Score (old) */}
          <Box 
            sx={{ 
              backgroundColor: isDark ? 'rgba(38, 212, 180, 0.1)' : 'rgba(38, 212, 180, 0.05)',
              border: `1px solid ${isDark ? 'rgba(38, 212, 180, 0.3)' : 'rgba(38, 212, 180, 0.2)'}`,
              borderRadius: '8px',
              padding: { xs: '0.75rem', sm: '1rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="caption"
              sx={{ 
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                color: isDark ? '#6ee7b7' : '#10b981',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              {averageAccuracy !== null ? 'Avg Accuracy' : 'R² Score'}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: isDark ? '#34d399' : '#059669',
                fontSize: { xs: '1.25rem', lg: '1.5rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mt: 0.5,
                marginBottom: '0.25rem',
              }}
            >
              {averageAccuracy !== null 
                ? `${averageAccuracy.toFixed(2)}%`
                : accuracyStats.r2_score 
                  ? accuracyStats.r2_score.toFixed(3) 
                  : 'N/A'}
            </Typography>
            <Typography 
              variant="caption"
              sx={{ 
                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                color: isDark ? '#9ca3af' : '#6b7280',
                display: 'block',
                mt: 0.5,
              }}
            >
              {averageAccuracy !== null
                ? (averageAccuracy >= 95 ? 'Excellent' : averageAccuracy >= 90 ? 'Good' : 'Fair')
                : accuracyStats.r2_score 
                  ? (accuracyStats.r2_score >= 0.7 ? 'Good' : 'Bad') 
                  : 'N/A'}
            </Typography>
          </Box>
          
          {/* Best Accuracy Card (new stats only) */}
          {maxAccuracy !== null && (
            <Box 
              sx={{ 
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                borderRadius: '8px',
                padding: { xs: '0.75rem', sm: '1rem' },
                minHeight: { xs: '100px', lg: '110px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography 
                variant="caption"
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  color: isDark ? '#6ee7b7' : '#10b981',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                  lineHeight: 1.3,
                }}
              >
                Best Accuracy
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: isDark ? '#34d399' : '#059669',
                  fontSize: { xs: '1.25rem', lg: '1.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mt: 0.5,
                }}
              >
                {maxAccuracy.toFixed(2)}%
              </Typography>
            </Box>
          )}

          {/* Total Predictions Card */}
          <Box 
            sx={{ 
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
              borderRadius: '8px',
              padding: { xs: '0.75rem', sm: '1rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="caption"
              sx={{ 
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                color: isDark ? '#93c5fd' : '#3b82f6',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              Total Predictions
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: isDark ? '#60a5fa' : '#2563eb',
                fontSize: { xs: '1rem', lg: '1.125rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mt: 0.5,
              }}
            >
              {totalPredictions} predictions
            </Typography>
            {evaluationRate !== null && (
              <Typography 
                variant="caption"
                sx={{ 
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  color: isDark ? '#9ca3af' : '#6b7280',
                  display: 'block',
                  mt: 0.5,
                }}
              >
                {evaluationRate.toFixed(1)}% evaluated
              </Typography>
            )}
          </Box>

          {/* Evaluated Card */}
          <Box 
            sx={{ 
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
              borderRadius: '8px',
              padding: { xs: '0.75rem', sm: '1rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="caption"
              sx={{ 
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                color: isDark ? '#93c5fd' : '#3b82f6',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              Evaluated
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: isDark ? '#60a5fa' : '#2563eb',
                fontSize: { xs: '1rem', lg: '1.125rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mt: 0.5,
              }}
            >
              {evaluatedPredictions} with results
            </Typography>
          </Box>

          {/* Pending Card */}
          <Box 
            sx={{ 
              backgroundColor: isDark ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.05)',
              border: `1px solid ${isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.2)'}`,
              borderRadius: '8px',
              padding: { xs: '0.75rem', sm: '1rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="caption"
              sx={{ 
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                color: isDark ? '#fdba74' : '#f97316',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              Pending
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: isDark ? '#fb923c' : '#ea580c',
                fontSize: { xs: '1rem', lg: '1.125rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mt: 0.5,
              }}
            >
              {pendingPredictions} awaiting market results
            </Typography>
          </Box>
        </Box>
  );
};

export default AccuracyStats;
