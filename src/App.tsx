import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppProvider } from './contexts/AppContext';
import { Router } from './components/Router';
import { store, persistor } from './store';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppProvider>
          <Router />
        </AppProvider>
      </PersistGate>
    </Provider>
  );
}