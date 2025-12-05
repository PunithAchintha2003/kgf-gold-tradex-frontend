/**
 * Custom navigation hook
 * Provides a consistent navigation interface that works with React Router
 */

import { useNavigate as useReactRouterNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../config/routes.config';

export const useNavigation = () => {
  const navigate = useReactRouterNavigate();
  const location = useLocation();

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  return {
    navigate: navigateTo,
    goBack,
    goForward,
    currentPath: location.pathname,
    ROUTES,
  };
};

