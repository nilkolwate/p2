import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ExternalLink } from 'lucide-react';
import BlockVaultLogo from './BlockVaultLogo';
import { logoutAdmin, getAdminUser } from '../utils/auth';

/**
 * Admin Top Navigation Bar
 * Bridges administrative workspace with public portals.
 * Matches public site aesthetic with HashRouter compatibility.
 */
export default function AdminNavbar({ onToggleSidebar }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/verify', label: 'Verify Certificate' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-brand-cream border-b border-brand-beige/70 shadow-xs">
      <div className="px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile sidebar toggle + BlockVault Logo / Home Link */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              className="lg:hidden p-2 text-brand-charcoal hover:text-brand-green hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
              onClick={onToggleSidebar}
              title="Toggle Admin Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-95"
            title="Return to Public Home"
          >
            <BlockVaultLogo className="w-7 h-7" withText={true} textClassName="text-lg text-brand-charcoal font-bold" />
            <span className="hidden sm:inline-block bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-brand-green/20">
              Admin Portal
            </span>
          </Link>
        </div>

        {/* Center: Public Links matching public Navbar */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'text-brand-green font-bold'
                    : 'text-brand-charcoal/70 hover:text-brand-green'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: User Info + Logout Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-right">
            <div className="w-7 h-7 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {(adminUser?.displayName || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="leading-none text-left">
              <p className="text-xs font-semibold text-brand-charcoal truncate max-w-[120px]">
                {adminUser?.displayName || 'Administrator'}
              </p>
              <span className="text-[10px] text-brand-green font-medium">Logged In</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200 rounded-full transition-colors cursor-pointer"
            title="Sign out of Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          {/* Mobile menu toggle for public links */}
          <button
            type="button"
            className="md:hidden p-1.5 text-brand-charcoal hover:text-brand-green rounded-lg hover:bg-white/60 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Public Links Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <ExternalLink className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown for public links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-brand-beige/60 px-5 py-3 space-y-2 shadow-md">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Public Site Links
          </p>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-brand-charcoal hover:text-brand-green py-1.5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
