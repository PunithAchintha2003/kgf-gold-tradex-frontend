import React, { Suspense, lazy, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { CartProvider } from '../contexts/CartContext';
import { CartSheet } from '../components/cart/CartSheet';
import { Header } from '../layouts/Header';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { PageLoader } from '../shared/components/LoadingSpinner';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { ROUTES } from '../core/config/routes.config';
import { Product } from '../types';

// Lazy load heavy components for code splitting
const HomePage = lazy(() => import('../pages/HomePage').then(module => ({ default: module.HomePage })));
const ProductsPage = lazy(() => import('../pages/ProductsPage').then(module => ({ default: module.ProductsPage })));
const AuctionsPage = lazy(() => import('../pages/AuctionsPage').then(module => ({ default: module.AuctionsPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const CustomerDashboard = lazy(() => import('../components/dashboards/CustomerDashboard').then(module => ({ default: module.CustomerDashboard })));
const SellerDashboard = lazy(() => import('../components/dashboards/SellerDashboard').then(module => ({ default: module.SellerDashboard })));
const PawnshopDashboard = lazy(() => import('../components/dashboards/PawnshopDashboard').then(module => ({ default: module.PawnshopDashboard })));
const InvestorDashboard = lazy(() => import('../components/dashboards/InvestorDashboard').then(module => ({ default: module.InvestorDashboard })));
const AdminDashboard = lazy(() => import('../components/dashboards/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ARTryOnModal = lazy(() => import('../shared/components/ARTryOnModal').then(module => ({ default: module.ARTryOnModal })));
const ChatModal = lazy(() => import('../shared/components/ChatModal').then(module => ({ default: module.ChatModal })));
const PricePredictorPage = lazy(() => import('../components/price-predictor/PricePredictorPage'));
const TradePage = lazy(() => import('../pages/TradePage'));

/**
 * App routes component
 */
const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openARModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsARModalOpen(true);
  }, []);

  const openChat = useCallback(() => {
    setIsChatModalOpen(true);
  }, []);

  const closeARModal = useCallback(() => {
    setIsARModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const closeChatModal = useCallback(() => {
    setIsChatModalOpen(false);
  }, []);

  // Create navigation wrapper that works with React Router
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} currentPath={location.pathname} />
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage onNavigate={handleNavigate} />} />
              <Route 
                path={ROUTES.PRODUCTS} 
                element={<ProductsPage onNavigate={handleNavigate} onTryAR={openARModal} />} 
              />
              <Route path={ROUTES.AUCTIONS} element={<AuctionsPage onNavigate={handleNavigate} />} />
              <Route path={ROUTES.PRICE_PREDICTOR} element={<PricePredictorPage onNavigate={handleNavigate} />} />
              <Route path={ROUTES.TRADE} element={<TradePage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage onNavigate={handleNavigate} />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage onNavigate={handleNavigate} />} />
              
              {/* Protected Dashboard Routes */}
              <Route
                path={ROUTES.DASHBOARD.CUSTOMER}
                element={
                  <ProtectedRoute requiredRole="buyer" onNavigate={handleNavigate}>
                    {user?.role === 'buyer' ? (
                      <CustomerDashboard onNavigate={handleNavigate} onOpenChat={openChat} />
                    ) : (
                      <Navigate to={ROUTES.HOME} replace />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.DASHBOARD.SELLER}
                element={
                  <ProtectedRoute requiredRole="seller" onNavigate={handleNavigate}>
                    {user?.role === 'seller' ? (
                      <SellerDashboard onNavigate={handleNavigate} />
                    ) : (
                      <Navigate to={ROUTES.HOME} replace />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.DASHBOARD.PAWNSHOP}
                element={
                  <ProtectedRoute requiredRole="pawnshop" onNavigate={handleNavigate}>
                    {user?.role === 'pawnshop' ? (
                      <PawnshopDashboard onNavigate={handleNavigate} />
                    ) : (
                      <Navigate to={ROUTES.HOME} replace />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.DASHBOARD.INVESTOR}
                element={
                  <ProtectedRoute requiredRole="investor" onNavigate={handleNavigate}>
                    {user?.role === 'investor' ? (
                      <InvestorDashboard onNavigate={handleNavigate} />
                    ) : (
                      <Navigate to={ROUTES.HOME} replace />
                    )}
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.DASHBOARD.ADMIN}
                element={
                  <ProtectedRoute requiredRole="admin" onNavigate={handleNavigate}>
                    {user?.role === 'admin' ? (
                      <AdminDashboard onNavigate={handleNavigate} />
                    ) : (
                      <Navigate to={ROUTES.HOME} replace />
                    )}
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </Suspense>
        </main>
        
        {/* Modals */}
        <Suspense fallback={null}>
          {isARModalOpen && (
            <ARTryOnModal 
              isOpen={isARModalOpen} 
              onClose={closeARModal}
              product={selectedProduct}
            />
          )}
          {isChatModalOpen && (
            <ChatModal 
              isOpen={isChatModalOpen} 
              onClose={closeChatModal}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

/**
 * Main Router component using React Router
 */
export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRoutes />
        <CartSheet />
      </CartProvider>
    </BrowserRouter>
  );
};