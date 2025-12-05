import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { ROUTES } from '../../core/config/routes.config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  onNavigate: (path: string) => void;
}

/**
 * ProtectedRoute component for route-level authentication and authorization
 * Uses React Router Navigate for proper routing
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  onNavigate,
}) => {
  const { isAuthenticated, user } = useApp();

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check role-based authorization
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user || !allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => onNavigate(ROUTES.HOME)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

