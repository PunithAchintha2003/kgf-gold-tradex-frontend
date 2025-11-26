import React, { useState, Suspense, lazy, useMemo, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../layouts/Header';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { PageLoader } from '../shared/components/LoadingSpinner';
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

export const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user, isAuthenticated } = useApp();

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

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

  const renderPage = useMemo(() => {
    // Protect dashboard routes
    if (currentPath.startsWith('/dashboard') && !isAuthenticated) {
      return <LoginPage onNavigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/products':
        return <ProductsPage onNavigate={navigate} onTryAR={openARModal} />;
      case '/auctions':
        return <AuctionsPage onNavigate={navigate} />;
      case '/price-predictor':
      case '/predictor':
        return <PricePredictorPage onNavigate={navigate} />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/register':
        return <RegisterPage onNavigate={navigate} />;
      case '/dashboard/customer':
        return user?.role === 'buyer' ? <CustomerDashboard onNavigate={navigate} onOpenChat={openChat} /> : <HomePage onNavigate={navigate} />;
      case '/dashboard/seller':
        return user?.role === 'seller' ? <SellerDashboard onNavigate={navigate} /> : <HomePage onNavigate={navigate} />;
      case '/dashboard/pawnshop':
        return user?.role === 'pawnshop' ? <PawnshopDashboard onNavigate={navigate} /> : <HomePage onNavigate={navigate} />;
      case '/dashboard/investor':
        return user?.role === 'investor' ? <InvestorDashboard onNavigate={navigate} /> : <HomePage onNavigate={navigate} />;
      case '/dashboard/admin':
        return user?.role === 'admin' ? <AdminDashboard onNavigate={navigate} /> : <HomePage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  }, [currentPath, isAuthenticated, user?.role, navigate, openARModal, openChat]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header onNavigate={navigate} currentPath={currentPath} />
        <main>
          <Suspense fallback={<PageLoader />}>
            {renderPage}
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