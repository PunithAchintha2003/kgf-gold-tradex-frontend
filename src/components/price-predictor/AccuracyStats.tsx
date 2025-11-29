import React from 'react';
import { Typography, Box } from '@mui/material';
import type { 
  AccuracyStats as AccuracyStatsType,
  AccuracyVisualizationStatistics 
} from '../../store/api/goldApi';

interface AccuracyStatsProps {
  accuracyStats: AccuracyStatsType;
  isDark: boolean;
  newStats?: AccuracyVisualizationStatistics; // Optional new statistics from accuracy-visualization endpoint
}

const AccuracyStats: React.FC<AccuracyStatsProps> = ({
  accuracyStats,
  isDark,
  newStats,
}) => {
  const pendingPredictions = accuracyStats.total_predictions - accuracyStats.evaluated_predictions;
  
  // Use new stats if available, otherwise fall back to old stats
  const averageAccuracy = newStats?.average_accuracy ?? null;
  const maxAccuracy = newStats?.max_accuracy ?? null;

  return (
    <Box 
      className="bg-card text-card-foreground border rounded-xl"
      sx={{ 
        padding: { xs: '1.25rem', sm: '1.5rem', lg: '1.75rem' },
      }}
    >
      {/* Grid layout for accuracy stats cards - 2 columns on left sidebar */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr' },
          gap: { xs: '0.75rem', sm: '1rem' },
        }}
      >
          {/* Average Accuracy Card (new) or R² Score (old) */}
          <Box 
            className="bg-muted rounded-lg"
            sx={{ 
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius)',
              padding: { xs: '1rem', sm: '1.25rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="body2" 
              className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
              sx={{ 
                color: isDark ? '#cccccc' : '#666666',
                fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                fontWeight: 500,
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              {averageAccuracy !== null ? 'Avg Accuracy' : 'R² Score'}
            </Typography>
            <Typography 
              variant="h4" 
              className="text-prediction-green font-bold"
              sx={{ 
                color: '#26d4b4',
                fontSize: { xs: '1.25rem', lg: '1.5rem' },
                fontWeight: 'bold',
                lineHeight: 1.2,
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
              variant="body2" 
              className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs font-medium`}
              sx={{ 
                color: isDark ? '#888888' : '#999999',
                fontSize: '0.75rem',
                fontWeight: 500,
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
              className="bg-muted rounded-lg"
              sx={{ 
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                padding: { xs: '1rem', sm: '1.25rem' },
                minHeight: { xs: '100px', lg: '110px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography 
                variant="body2" 
                className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
                sx={{ 
                  color: isDark ? '#cccccc' : '#666666',
                  fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                  fontWeight: 500,
                  marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                  lineHeight: 1.3,
                }}
              >
                Best Accuracy
              </Typography>
              <Typography 
                variant="h4" 
                className="text-prediction-green font-bold"
                sx={{ 
                  color: '#26d4b4',
                  fontSize: { xs: '1.25rem', lg: '1.5rem' },
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  marginBottom: '0.25rem',
                }}
              >
                {maxAccuracy.toFixed(2)}%
              </Typography>
            </Box>
          )}

          {/* Total Predictions Card */}
          <Box 
            className="bg-muted rounded-lg"
            sx={{ 
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius)',
              padding: { xs: '1rem', sm: '1.25rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="body2" 
              className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
              sx={{ 
                color: isDark ? '#cccccc' : '#666666',
                fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                fontWeight: 500,
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              Total Predictions
            </Typography>
            <Typography 
              variant="body1" 
              className={`${isDark ? 'text-gray-400' : 'text-gray-600'} font-bold`}
              sx={{ 
                color: isDark ? '#888888' : '#666666',
                fontSize: { xs: '1rem', lg: '1.125rem' },
                fontWeight: 'bold',
                lineHeight: 1.2,
              }}
            >
              {accuracyStats.total_predictions} predictions
            </Typography>
          </Box>

          {/* Evaluated Card */}
          <Box 
            className="bg-muted rounded-lg"
            sx={{ 
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius)',
              padding: { xs: '1rem', sm: '1.25rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="body2" 
              className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
              sx={{ 
                color: isDark ? '#cccccc' : '#666666',
                fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                fontWeight: 500,
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              Evaluated
            </Typography>
            <Typography 
              variant="body1" 
              className="text-prediction-green font-bold"
              sx={{ 
                color: '#26d4b4',
                fontSize: { xs: '1rem', lg: '1.125rem' },
                fontWeight: 'bold',
                lineHeight: 1.2,
              }}
            >
              {accuracyStats.evaluated_predictions} with results
            </Typography>
          </Box>

          {/* Pending Card */}
          <Box 
            className="bg-muted rounded-lg"
            sx={{ 
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius)',
              padding: { xs: '1rem', sm: '1.25rem' },
              minHeight: { xs: '100px', lg: '110px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="body2" 
              className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}
              sx={{ 
                color: isDark ? '#cccccc' : '#666666',
                fontSize: { xs: '0.8125rem', lg: '0.875rem' },
                fontWeight: 500,
                marginBottom: { xs: '0.5rem', sm: '0.625rem' },
                lineHeight: 1.3,
              }}
            >
              Pending
            </Typography>
            <Typography 
              variant="body1" 
              className="text-orange-500 font-bold"
              sx={{ 
                color: '#ffa500',
                fontSize: { xs: '1rem', lg: '1.125rem' },
                fontWeight: 'bold',
                lineHeight: 1.2,
              }}
            >
              {pendingPredictions} awaiting market results
            </Typography>
          </Box>
        </Box>
    </Box>
  );
};

export default AccuracyStats;
