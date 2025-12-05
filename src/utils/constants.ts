/**
 * Application-wide constants
 * @deprecated Use @/core/constants instead for new code
 * This file is kept for backward compatibility
 */

// Re-export from core for backward compatibility
export {
  APP_CONFIG,
  API_CONFIG,
  STORAGE_KEYS,
  USER_ROLES,
  PRODUCT_CATEGORIES,
  CURRENCIES,
  LANGUAGES,
  THEMES,
} from '../core/constants';

// Legacy exports - prefer using core/constants
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  AUCTIONS: '/auctions',
  PRICE_PREDICTOR: '/price-predictor',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: {
    CUSTOMER: '/dashboard/customer',
    SELLER: '/dashboard/seller',
    PAWNSHOP: '/dashboard/pawnshop',
    INVESTOR: '/dashboard/investor',
    ADMIN: '/dashboard/admin',
  },
} as const;

export const POLLING_INTERVALS = {
  GOLD_PRICE: 10000, // 10 seconds
  EXCHANGE_RATE: 30000, // 30 seconds
  AUCTIONS: 5000, // 5 seconds
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;



