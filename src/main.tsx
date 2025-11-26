
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { errorLogger } from './utils/errorHandler';

// Initialize error logging (just importing initializes the singleton)
if (import.meta.env.PROD) {
  // Error logger is initialized on import
  void errorLogger;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
  