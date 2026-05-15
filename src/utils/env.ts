/**
 * Environment variable utilities
 * Provides type-safe access to environment variables
 */

/**
 * Base URL for the Node commerce API (`/api/v1` on the MERN backend).
 * In development and on localhost preview, returns a relative path so the Vite proxy can route traffic.
 * On a deployed host (e.g. Vercel), uses `VITE_NODE_API_BASE_URL` (origin like `https://your-api.onrender.com`).
 */
export function getNodeApiV1Base(): string {
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') {
      return '/api/v1';
    }
  }
  const raw = (import.meta.env['VITE_NODE_API_BASE_URL'] as string | undefined)?.trim();
  if (!raw) {
    return '/api/v1';
  }
  const u = raw.replace(/\/$/, '');
  return u.endsWith('/api/v1') ? u : `${u}/api/v1`;
}

export const env = {
  // API Configuration
  // In development, use relative URLs to leverage Vite proxy (bypasses CORS)
  // In production, use the full API URL
  // Note: CORS errors in console when testing production builds locally are expected and harmless
  // The app will work correctly when deployed to Netlify
  API_BASE_URL: import.meta.env.DEV 
    ? (import.meta.env.VITE_API_BASE_URL || '') // Empty string = relative URLs, uses Vite proxy
    : (import.meta.env.VITE_API_BASE_URL || 'https://kgf-gold-price-predictor.onrender.com'),
  
  // App Configuration
  APP_ENV: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'production' | 'staging',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'KGF Gold TradeX',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '0.1.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_LOGGING: import.meta.env.VITE_ENABLE_ERROR_LOGGING !== 'false',
  
  // Build Configuration
  BUILD_SOURCEMAP: import.meta.env.VITE_BUILD_SOURCEMAP === 'true',
  
  // Demo Configuration
  DEMO_PASSWORD: import.meta.env.VITE_DEMO_PASSWORD || '',
  
  // Development
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const;

/**
 * Validates that required environment variables are set
 */
export function validateEnv(): void {
  const required = ['VITE_API_BASE_URL', 'VITE_NODE_API_BASE_URL'] as const;
  const missing: string[] = [];

  required.forEach((key) => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && env.APP_ENV === 'production') {
    console.error('Missing required environment variables:', missing.join(', '));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate on import in production
if (env.PROD) {
  validateEnv();
}



