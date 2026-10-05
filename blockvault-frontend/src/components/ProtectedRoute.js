import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/auth';

/**
 * Route protection wrapper for administrative paths.
 * Checks for a valid JWT session and redirects unauthenticated users to /login.
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = isAdminAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login?unauthorized=true" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
