import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppProvider } from './contexts/AppContext';
import { Router } from './routes/Router';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { PageLoader } from './shared/components/LoadingSpinner';
import { Toaster } from './components/ui/sonner';
import { store, persistor } from './store';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<PageLoader />} persistor={persistor}>
          <AppProvider>
            <Router />
            <Toaster />
          </AppProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}