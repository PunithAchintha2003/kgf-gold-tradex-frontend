/**
 * Centralized error handling utilities
 */

import { env } from './env';

export interface ErrorInfo {
  message: string;
  code?: string | undefined;
  statusCode?: number | undefined;
  timestamp: string;
  userAgent?: string | undefined;
  url?: string | undefined;
  stack?: string | undefined;
}

/**
 * Error logging service
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: ErrorInfo[] = [];
  private readonly maxErrors = 100;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.logError({
      message: event.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: event.error?.stack,
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.logError({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: event.reason?.stack,
    });
  }

  logError(error: ErrorInfo): void {
    this.errors.push(error);
    
    // Keep only the last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (env.DEV) {
      console.error('Error logged:', error);
    }

    // In production, you might want to send to an error tracking service
    // Example: Sentry, LogRocket, etc.
    if (env.PROD && env.ENABLE_ERROR_LOGGING) {
      // TODO: Integrate with error tracking service
      // this.sendToErrorTrackingService(error);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  code?: string,
  statusCode?: number
): ErrorInfo {
  return {
    message,
    code,
    statusCode,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

/**
 * Handles API errors with proper typing
 */
export function handleApiError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    return createError(error.message, 'API_ERROR');
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { message?: string; status?: number; code?: string };
    return createError(
      apiError.message || 'An unknown API error occurred',
      apiError.code || 'UNKNOWN_API_ERROR',
      apiError.status
    );
  }

  return createError('An unknown error occurred', 'UNKNOWN_ERROR');
}

// Initialize error logger
export const errorLogger = ErrorLogger.getInstance();

