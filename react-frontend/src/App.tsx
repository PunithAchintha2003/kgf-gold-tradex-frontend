import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, CssBaseline, Container, Box, CircularProgress } from '@mui/material';
import { store, persistor } from './store';
import { createAppTheme } from './theme/theme';
import { useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar';
import type { CurrencyUnit } from './components/CurrencyDropdown';

// Lazy load components
const DashboardFallback: React.FC = () => <div>Failed to load Dashboard</div>;
DashboardFallback.displayName = 'DashboardFallback';

const Dashboard = lazy(() => 
  import('./components/Dashboard').catch((error) => {
    console.error('Failed to load Dashboard component:', error);
    return { default: DashboardFallback };
  })
);

const AppContent: React.FC = () => {
  const { mode } = useTheme();
  const theme = createAppTheme(mode);
  const [currencyUnit, setCurrencyUnit] = useState<CurrencyUnit>('troy-ounce');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`min-h-screen ${mode === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <Navbar 
          currencyUnit={currencyUnit}
          onCurrencyChange={setCurrencyUnit}
        />
        
        <Container maxWidth="xl" sx={{ padding: { xs: '1rem 0.5rem', sm: '1.5rem 1rem', md: '2rem 1rem' } }}>
          <Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          }>
            <Routes>
              <Route path="/" element={<Dashboard currencyUnit={currencyUnit} />} />
              <Route path="/dashboard" element={<Dashboard currencyUnit={currencyUnit} />} />
            </Routes>
          </Suspense>
        </Container>
      </div>
    </ThemeProvider>
  );
};

AppContent.displayName = 'AppContent';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AppContent />
        </Router>
      </PersistGate>
    </Provider>
  );
};

App.displayName = 'App';

export default App;