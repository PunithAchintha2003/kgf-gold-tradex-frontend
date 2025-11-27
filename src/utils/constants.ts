/**
 * Application-wide constants
 */

export const APP_CONFIG = {
  NAME: 'KGF Gold TradeX',
  VERSION: '0.1.0',
  SUPPORT_EMAIL: 'support@kgf-gold.com',
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

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

export const STORAGE_KEYS = {
  THEME: 'kgf-theme',
  LANGUAGE: 'kgf-language',
  USER_PREFERENCES: 'kgf-user-preferences',
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


