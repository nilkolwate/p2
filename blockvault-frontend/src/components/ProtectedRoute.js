import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { logoutAdmin, getToken, isTokenExpired } from '../utils/auth';
import apiService from '../services/api';
import { Loader2 } from 'lucide-react';

/**
 * Route protection wrapper for administrative paths.
 * Validates the JWT token with the backend on route access.
 * If expired or rejected with 401, clears storage and redirects to /login.
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      // 1. Quick check for stored token in sessionStorage
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        logoutAdmin();
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
          } else if (res && res._status === 401) {
            // Explicit 401 Unauthorized from backend
            logoutAdmin();
            setIsAuthorized(false);
          } else {
            // If backend is sleeping/cold-starting or transient network error,
            // retain existing authenticated state if token is still unexpired
            setIsAuthorized(true);
          }
          setIsValidating(false);
        }
      } catch (err) {
        if (isMounted) {
          // Preserve valid local session during temporary network hiccups
          if (token && !isTokenExpired(token)) {
            setIsAuthorized(true);
          } else {
            logoutAdmin();
            setIsAuthorized(false);
          }
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
