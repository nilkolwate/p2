import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { isAdminAuthenticated } from '../utils/auth';
import apiService from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already authenticated, go directly to admin
    if (isAdminAuthenticated()) {
      navigate('/admin');
      return;
    }

    // Check if redirected due to unauthorized access or expired session
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('unauthorized') === 'true') {
      setError('Access Restricted: You must log in as Administrator to access the admin panel.');
    } else if (searchParams.get('sessionExpired') === 'true') {
      setError('Session Expired: Your session has expired. Please log in again.');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await apiService.adminLogin({
        username: username.trim(),
        password: password.trim(),
        rememberMe,
      });

      if (result && result.success && result.token) {
        setSuccess('Authentication successful! Loading administrator panel...');
        setTimeout(() => {
          navigate('/admin');
        }, 400);
      } else {
        setError(result?.message || 'Access Denied: Invalid username or password.');
      }
    } catch (err) {
      setError('Authentication failed. Unable to communicate with the verification server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E9] via-[#EDE7DA] to-[#F5F1E9] flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-[16px] shadow-lg border border-gray-100 p-8 md:p-10">
          {/* Top: Logo + Heading */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#1F3D2B] flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#6B8F71] block mb-1">
              BlockVault
            </span>
            <h1
              className="text-2xl md:text-3xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Admin <span className="italic text-[#1F3D2B]">Login</span>
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Sign in with your verified administrator credentials.
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 leading-snug">
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-700 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <div className="flex-1 leading-snug">
                <p className="font-semibold">Access Granted</p>
                <p className="text-xs mt-0.5 text-green-600">{success}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Administrator Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="username"
                  required
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1F3D2B] focus:ring-[#1F3D2B]"
                />
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#1F3D2B] text-white font-medium hover:bg-[#16281C] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Login as Administrator <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom: Return to Homepage */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-[#1F3D2B] transition-colors"
            >
              &larr; Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
