import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { createAppTheme } from '../../theme/theme';
import { useTheme } from '../../hooks/useTheme';
import Dashboard from './Dashboard';
import CurrencyDropdown from './CurrencyDropdown';
import type { CurrencyUnit } from './CurrencyDropdown';

interface PricePredictorPageProps {
  onNavigate: (path: string) => void;
}

const PricePredictorPage: React.FC<PricePredictorPageProps> = ({ onNavigate }) => {
  const { mode } = useTheme();
  const theme = createAppTheme(mode);
  const [currencyUnit, setCurrencyUnit] = useState<CurrencyUnit>('troy-ounce');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
      >
        <Container 
          maxWidth="xl"
          sx={{ 
            padding: { xs: '1rem', sm: '1.5rem', md: '2rem' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Currency Dropdown - Top Right Corner */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '1rem', sm: '1.5rem', md: '2rem' },
              right: { xs: '1rem', sm: '1.5rem', md: '2rem' },
              zIndex: 10,
            }}
          >
            <CurrencyDropdown
              value={currencyUnit}
              onChange={setCurrencyUnit}
            />
          </Box>
          
          <Dashboard currencyUnit={currencyUnit} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PricePredictorPage;

