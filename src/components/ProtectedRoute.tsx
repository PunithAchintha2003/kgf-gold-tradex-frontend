import React from 'react';
import { useApp } from '../contexts/AppContext';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  onNavigate: (path: string) => void;
}

/**
 * ProtectedRoute component for route-level authentication and authorization
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  onNavigate,
}) => {
  const { isAuthenticated, user } = useApp();

  // Check authentication
  if (!isAuthenticated) {
    return <LoginPage onNavigate={onNavigate} />;
  }

  // Check role-based authorization
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

