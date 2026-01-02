/**
 * Base API configuration with interceptors
 * Provides centralized API error handling and request/response interceptors
 */

import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '@/utils/env';

export interface ApiError {
  status: number;
  data?: {
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
  };
}

/**
 * Get API base URL - use relative URLs on localhost to leverage proxy
 */
const getApiBaseUrl = (): string => {
  // In development, use relative URLs (empty string) to leverage Vite proxy
  if (import.meta.env.DEV) {
    return env.API_BASE_URL || '';
  }
  
  // In production builds, detect if running on localhost
  // If so, use relative URLs to leverage custom preview server proxy
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return ''; // Use relative URLs on localhost
    }
  }
  
  // Otherwise, use the configured API URL
  return env.API_BASE_URL || 'https://kgf-gold-price-predictor.onrender.com';
};

/**
 * Custom base query with error handling
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    return headers;
  },
  timeout: 30000, // 30 seconds
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

/**
 * Base query with retry logic and error handling
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - redirect to login
  if (result.error && result.error.status === 401) {
    // Clear auth token
    localStorage.removeItem('auth_token');
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Handle 404 Not Found - log silently (endpoint may not exist on backend)
  if (result.error && result.error.status === 404) {
    // Silently handle 404s - don't spam console with errors for optional endpoints
    // The component will handle the absence of data gracefully
    // No logging needed - 404s are expected for optional endpoints
  }

  // Handle network errors (including CORS)
  if (result.error && 'status' in result.error && result.error.status === 'FETCH_ERROR') {
    // Suppress CORS errors in console - they're expected when testing locally
    // The app will handle missing data gracefully
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (isLocalhost) {
      // Silently handle CORS errors in local development/preview
      // These are expected when testing production builds locally
    } else {
      // Log network errors in production (non-localhost)
      console.error('Network error:', result.error);
    }
  }

  return result;
};
