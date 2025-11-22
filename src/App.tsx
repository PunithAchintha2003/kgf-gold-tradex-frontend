import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppProvider } from './contexts/AppContext';
import { Router } from './components/Router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';
import { store, persistor } from './store';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<PageLoader />} persistor={persistor}>
          <AppProvider>
            <Router />
          </AppProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}