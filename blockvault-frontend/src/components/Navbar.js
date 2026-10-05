import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BlockVaultLogo from './BlockVaultLogo';
import { isAdminAuthenticated } from '../utils/auth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/verify', label: 'Verify Certificate' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = isAdminAuthenticated();
  const adminLink = isLoggedIn ? '/admin' : '/login';
  const adminText = isLoggedIn ? 'Admin Dashboard' : 'Login as Administrator';

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-beige/50">
      <div className="max-w-container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <BlockVaultLogo className="w-8 h-8" />
          <span className="font-bold text-xl text-brand-green tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            BlockVault
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-brand-green'
                    : 'text-brand-charcoal/70 hover:text-brand-green'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[18px] left-0 right-0 h-[2px] bg-brand-green rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Login button (desktop) */}
        <div className="hidden md:block">
          <Link
            to={adminLink}
            className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-brand-green-dark transition-colors"
          >
            {adminText}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-brand-charcoal"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-beige/50 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `block text-sm font-medium py-2 ${
                  isActive ? 'text-brand-green' : 'text-brand-charcoal/70'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to={adminLink}
            className="block text-center bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-full mt-3"
            onClick={() => setMobileOpen(false)}
          >
            {adminText}
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
