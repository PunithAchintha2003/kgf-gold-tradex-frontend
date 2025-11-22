// Disable React DevTools in production and suppress displayName errors
// This script runs BEFORE React loads to prevent DevTools initialization errors

(function() {
  'use strict';
  
  // Check if we're in production
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.includes('local');
  
  if (isProduction) {
    // Disable React DevTools completely in production
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
      for (let prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        if (prop === 'renderers') {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = new Map();
        } else {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] === 'function' ? ()=>{} : null;
        }
      }
    }
  }
  
  // Suppress displayName errors globally (both dev and prod)
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    const errorMessage = String(args[0] || '');
    
    // Suppress React DevTools errors
    if (
      errorMessage.includes('displayName') ||
      errorMessage.includes('installHook') ||
      errorMessage.includes('getDisplayNameForFiber') ||
      errorMessage.includes('react_devtools_backend') ||
      errorMessage.includes('react-devtools')
    ) {
      // Silently ignore or downgrade to warning in dev
      if (!isProduction) {
        originalWarn.call(console, '[Suppressed DevTools Error]:', ...args);
      }
      return;
    }
    
    // Call original for real errors
    originalError.apply(console, args);
  };
  
  // Catch uncaught errors from DevTools
  window.addEventListener('error', function(event) {
    const errorMessage = event.message || '';
    const errorStack = (event.error && event.error.stack) || '';
    
    // Suppress React DevTools errors
    if (
      errorMessage.includes('displayName') ||
      errorMessage.includes('installHook') ||
      errorMessage.includes('getDisplayNameForFiber') ||
      errorStack.includes('installHook') ||
      errorStack.includes('react_devtools_backend') ||
      errorStack.includes('getDisplayNameForFiber')
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
  
  // Suppress unhandled promise rejections from DevTools
  window.addEventListener('unhandledrejection', function(event) {
    const reason = String(event.reason || '');
    if (
      reason.includes('displayName') ||
      reason.includes('installHook') ||
      reason.includes('react_devtools') ||
      reason.includes('getDisplayNameForFiber')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  
  console.log('🛡️ React DevTools error suppression initialized');
})();

