/**
 * Routes configuration
 * Centralized route definitions for the application
 */

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  AUCTIONS: '/auctions',
  PRICE_PREDICTOR: '/price-predictor',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: {
    ROOT: '/dashboard',
    CUSTOMER: '/dashboard/customer',
    SELLER: '/dashboard/seller',
    PAWNSHOP: '/dashboard/pawnshop',
    INVESTOR: '/dashboard/investor',
    ADMIN: '/dashboard/admin',
  },
} as const;

/**
 * Route metadata for navigation and protection
 */
export interface RouteConfig {
  path: string;
  requiresAuth?: boolean;
  requiredRole?: string | string[];
  title?: string;
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    title: 'Home',
  },
  [ROUTES.PRODUCTS]: {
    path: ROUTES.PRODUCTS,
    title: 'Products',
  },
  [ROUTES.AUCTIONS]: {
    path: ROUTES.AUCTIONS,
    title: 'Auctions',
  },
  [ROUTES.PRICE_PREDICTOR]: {
    path: ROUTES.PRICE_PREDICTOR,
    title: 'Price Predictor',
  },
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    title: 'Login',
  },
  [ROUTES.REGISTER]: {
    path: ROUTES.REGISTER,
    title: 'Register',
  },
  [ROUTES.DASHBOARD.CUSTOMER]: {
    path: ROUTES.DASHBOARD.CUSTOMER,
    requiresAuth: true,
    requiredRole: 'buyer',
    title: 'Customer Dashboard',
  },
  [ROUTES.DASHBOARD.SELLER]: {
    path: ROUTES.DASHBOARD.SELLER,
    requiresAuth: true,
    requiredRole: 'seller',
    title: 'Seller Dashboard',
  },
  [ROUTES.DASHBOARD.PAWNSHOP]: {
    path: ROUTES.DASHBOARD.PAWNSHOP,
    requiresAuth: true,
    requiredRole: 'pawnshop',
    title: 'Pawnshop Dashboard',
  },
  [ROUTES.DASHBOARD.INVESTOR]: {
    path: ROUTES.DASHBOARD.INVESTOR,
    requiresAuth: true,
    requiredRole: 'investor',
    title: 'Investor Dashboard',
  },
  [ROUTES.DASHBOARD.ADMIN]: {
    path: ROUTES.DASHBOARD.ADMIN,
    requiresAuth: true,
    requiredRole: 'admin',
    title: 'Admin Dashboard',
  },
};




