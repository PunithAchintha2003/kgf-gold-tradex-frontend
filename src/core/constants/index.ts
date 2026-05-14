/**
 * Core application constants
 * Centralized constants for the entire application
 */

export const APP_CONFIG = {
  NAME: 'KGF Gold TradeX',
  VERSION: '0.1.0',
  DESCRIPTION: 'A modern, full-featured gold trading platform',
  SUPPORT_EMAIL: 'support@kgf-gold.com',
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const STORAGE_KEYS = {
  THEME: 'kgf-theme',
  LANGUAGE: 'kgf-language',
  AUTH_TOKEN: 'auth_token',
  USER: 'kgf-user',
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

export const USER_ROLES = {
  VISITOR: 'visitor',
  BUYER: 'buyer',
  SELLER: 'seller',
  PAWNSHOP: 'pawnshop',
  INVESTOR: 'investor',
  ADMIN: 'admin',
} as const;

export const PRODUCT_CATEGORIES = {
  RINGS: 'rings',
  NECKLACES: 'necklaces',
  EARRINGS: 'earrings',
  BRACELETS: 'bracelets',
  PENDANTS: 'pendants',
  BISCUITS: 'biscuits',
  COINS: 'coins',
  BARS: 'bars',
  OTHER: 'other',
} as const;

export const CURRENCIES = {
  USD: 'USD',
  LKR: 'LKR',
} as const;

export const LANGUAGES = {
  EN: 'en',
  SI: 'si',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

