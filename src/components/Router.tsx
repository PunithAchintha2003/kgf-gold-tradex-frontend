import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from './Header';
import { HomePage } from './HomePage';
import { ProductsPage } from './ProductsPage';
import { AuctionsPage } from './AuctionsPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { CustomerDashboard } from './dashboards/CustomerDashboard';
import { SellerDashboard } from './dashboards/SellerDashboard';
import { PawnshopDashboard } from './dashboards/PawnshopDashboard';
import { InvestorDashboard } from './dashboards/InvestorDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { ARTryOnModal } from './ARTryOnModal';
import { ChatModal } from './ChatModal';
import PricePredictorPage from './price-predictor/PricePredictorPage';

export const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { user, isAuthenticated } = useApp();

  const navigate = (path: string) => {
    setCurrentPath(path);
  };

  const openARModal = (product: any) => {
    setSelectedProduct(product);
    setIsARModalOpen(true);
  };

  const openChat = () => {
    setIsChatModalOpen(true);
  };

  const renderPage = () => {
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={navigate} currentPath={currentPath} />
      <main>
        {renderPage()}
      </main>
      
      {/* Modals */}
      <ARTryOnModal 
        isOpen={isARModalOpen} 
        onClose={() => setIsARModalOpen(false)}
        product={selectedProduct}
      />
      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
};