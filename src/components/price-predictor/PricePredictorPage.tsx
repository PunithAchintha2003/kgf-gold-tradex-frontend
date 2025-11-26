import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from '../../theme/theme';
import { useTheme } from '../../hooks/useTheme';
import Dashboard from './Dashboard';
import { useApp } from '../../contexts/AppContext';
import type { CurrencyUnit } from './CurrencyDropdown';

interface PricePredictorPageProps {
  onNavigate: (path: string) => void;
}

const PricePredictorPage: React.FC<PricePredictorPageProps> = ({ onNavigate: _onNavigate }) => {
  const { t: _t } = useApp();
  const { mode } = useTheme();
  const theme = createAppTheme(mode);
  const [currencyUnit, setCurrencyUnit] = useState<CurrencyUnit>('troy-ounce');

  return (
    <div className="h-screen overflow-hidden pt-8 pb-0">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">Gold Price Prediction</h1>
          <p className="text-muted-foreground">
            Real-time gold price predictions powered by AI
          </p>
        </div>
        
        {/* Wrap Dashboard with MUI ThemeProvider for its internal MUI components */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="w-full flex-1 min-h-0 overflow-hidden">
            <Dashboard 
              currencyUnit={currencyUnit} 
              onCurrencyUnitChange={setCurrencyUnit}
            />
          </div>
        </ThemeProvider>
      </div>
    </div>
  );
};

export default PricePredictorPage;

