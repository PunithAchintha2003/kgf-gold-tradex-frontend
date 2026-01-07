/**
 * Authentication service for API calls
 */

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      createdAt?: string;
      lastLogin?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      isActive: boolean;
      lastLogin?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface ApiError {
  success: false;
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Custom error class for API errors with field-specific errors
 */
export class ApiRequestError extends Error {
  public errors?: Array<{ field: string; message: string }>;
  public status?: number;

  constructor(message: string, errors?: Array<{ field: string; message: string }>, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.errors = errors;
    this.status = status;
  }
}

// Get API base URL - use relative URLs in development to leverage Vite proxy
// The Vite proxy routes /api/v1/auth and /api/v1/users to Node.js backend (5001)
// and all other /api/* to Python backend (8001)
const getApiBaseUrl = (): string => {
  // In development, always use relative URLs to leverage Vite proxy
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  
  // In production, check if env var is set
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const url = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return url.endsWith('/api/v1') ? url : `${url}/api/v1`;
  }
  
  // Default to Node.js backend for auth endpoints
  return 'http://localhost:5001/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Get stored access token
 */
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Get stored refresh token
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Store tokens
 */
const storeTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Clear tokens
 */
const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Make API request with error handling
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure endpoint starts with / if API_BASE_URL doesn't end with /
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${endpointPath}`;
  
  // Debug log in development
  if (import.meta.env.DEV) {
    console.log('API Request:', { baseUrl: API_BASE_URL, endpoint, fullUrl });
  }
  
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for refresh token
  });

  // Try to parse as JSON, but handle non-JSON responses (like rate limit errors)
  let data: any;
  const contentType = response.headers.get('content-type');
  
  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // For non-JSON responses (like rate limit plain text), read as text
      const text = await response.text();
      // Try to parse as JSON, if it fails, use the text as error message
      try {
        data = JSON.parse(text);
      } catch {
        // If it's not JSON, create an error object from the text
        data = {
          success: false,
          error: text || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    }
  } catch (parseError) {
    // If parsing fails completely, create a basic error
    data = {
      success: false,
      error: `Failed to parse response: ${response.status} ${response.statusText}`,
    };
  }

  if (!response.ok) {
    const error: ApiError = data;
    
    // Handle rate limit errors specifically
    if (response.status === 429) {
      throw new ApiRequestError(
        error.error || 'Too many requests. Please wait a few minutes and try again.',
        error.errors,
        response.status
      );
    }
    
    // Preserve field-specific errors if available
    throw new ApiRequestError(
      error.error || `HTTP ${response.status}: ${response.statusText}`,
      error.errors,
      response.status
    );
  }

  return data as T;
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    storeTokens(response.data.accessToken, response.data.refreshToken);
  }

  return response;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    storeTokens(response.data.accessToken, response.data.refreshToken);
  }

  return response;
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (): Promise<{ accessToken: string }> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiRequest<{ success: boolean; data: { accessToken: string } }>('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (response.success && response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    return { accessToken: response.data.accessToken };
  }

  throw new Error('Failed to refresh token');
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  } finally {
    clearTokens();
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  return await apiRequest<UserResponse>('/auth/me', {
    method: 'GET',
  });
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<RegisterData>): Promise<UserResponse> => {
  return await apiRequest<UserResponse>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

