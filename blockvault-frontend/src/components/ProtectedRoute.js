import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAdminAuthenticated, logoutAdmin } from '../utils/auth';
import apiService from '../services/api';
import { Loader2 } from 'lucide-react';

/**
 * Route protection wrapper for administrative paths.
 * Validates the JWT token with the backend on route access.
 * If expired or invalid, clears storage and redirects to /login.
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      // 1. Quick check for stored token in sessionStorage
      if (!isAdminAuthenticated()) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsValidating(false);
        }
        return;
      }

      // 2. Validate token directly with backend /api/auth/me
      try {
        const res = await apiService.verifyToken();
        if (isMounted) {
          if (res && res.success) {
            setIsAuthorized(true);
          } else {
            // Token rejected by server
            logoutAdmin();
            setIsAuthorized(false);
          }
          setIsValidating(false);
        }
      } catch (err) {
        if (isMounted) {
          // If server error or network issue while having a token, re-verify or deny
          logoutAdmin();
          setIsAuthorized(false);
          setIsValidating(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1F3D2B] animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#6B8F71] font-semibold">
            Verifying Administrator Security Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login?sessionExpired=true" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
