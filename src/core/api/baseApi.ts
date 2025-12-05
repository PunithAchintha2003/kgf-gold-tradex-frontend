/**
 * Base API configuration with interceptors
 * Provides centralized API error handling and request/response interceptors
 */

import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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
 * Custom base query with error handling
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
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
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - redirect to login
  if (result.error && result.error.status === 401) {
    // Clear auth token
    localStorage.removeItem('auth_token');
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Handle network errors
  if (result.error && 'status' in result.error && result.error.status === 'FETCH_ERROR') {
    console.error('Network error:', result.error);
    // Could dispatch a notification here
  }

  return result;
};

