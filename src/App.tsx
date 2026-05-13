import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppProvider } from './contexts/AppContext';
import { Router } from './routes/Router';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { PageLoader } from './shared/components/LoadingSpinner';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { store, persistor } from './store';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<PageLoader />} persistor={persistor}>
          <AppProvider>
            <TooltipProvider delayDuration={0}>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AppProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}