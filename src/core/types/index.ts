/**
 * Core type definitions
 * Shared types used across the application
 */

export type UserRole = 'visitor' | 'buyer' | 'seller' | 'pawnshop' | 'investor' | 'admin';

export type Language = 'en' | 'si';

export type Theme = 'light' | 'dark';

export type Currency = 'USD' | 'LKR';

export type ProductCategory = 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'other';

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}






