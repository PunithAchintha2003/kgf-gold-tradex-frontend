import React from 'react';
import { Typography, Box } from '@mui/material';
import type { AccuracyStats as AccuracyStatsType } from '../store/api/goldApi';

interface AccuracyStatsProps {
  accuracyStats: AccuracyStatsType;
  isDark: boolean;
}

const AccuracyStats: React.FC<AccuracyStatsProps> = ({
  accuracyStats,
  isDark,
}) => {
  if (!accuracyStats) {
    return null;
  }
  
  const pendingPredictions = accuracyStats.total_predictions - accuracyStats.evaluated_predictions;

  return (
    <Box 
      sx={{ 
        backgroundColor: isDark ? '#111111' : '#FFFFFF',
        border: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
        borderRadius: '10px',
        padding: { xs: '0.75rem', sm: '1rem', lg: '1.25rem' },
      }}
    >
      {/* Grid layout for accuracy stats cards - 2 columns on left sidebar */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr' },
          gap: { xs: '0.5rem', sm: '0.75rem' },
        }}
      >
          {/* Model Accuracy Card */}
          <Box 
            sx={{ 
              backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
              borderRadius: '10px',
              padding: '1rem',
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
                marginBottom: '0.5rem',
                lineHeight: 1.3,
              }}
            >
              R² Score
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
              {accuracyStats.r2_score ? accuracyStats.r2_score.toFixed(3) : 'N/A'}
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
              {accuracyStats.r2_score ? (accuracyStats.r2_score >= 0.7 ? 'Good' : 'Bad') : 'N/A'}
            </Typography>
          </Box>

          {/* Total Predictions Card */}
          <Box 
            sx={{ 
              backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
              borderRadius: '10px',
              padding: '1rem',
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
                marginBottom: '0.5rem',
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
            sx={{ 
              backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
              borderRadius: '10px',
              padding: '1rem',
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
                marginBottom: '0.5rem',
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
            sx={{ 
              backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
              borderRadius: '10px',
              padding: '1rem',
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
                marginBottom: '0.5rem',
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

AccuracyStats.displayName = 'AccuracyStats';

export default AccuracyStats;
