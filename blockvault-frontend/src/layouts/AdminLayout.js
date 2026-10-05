import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  Users,
  Link2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Search,
  X,
  Shield,
  CheckCircle,
  AlertTriangle,
  Menu,
  Check,
  FileCheck,
} from 'lucide-react';
import { isAdminAuthenticated, logoutAdmin, getAdminUser } from '../utils/auth';

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/certificates', icon: Award, label: 'Certificates' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/blockchain', icon: Link2, label: 'Blockchain' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const initialNotifications = [
  {
    id: 1,
    title: 'Certificate #BV-2024-007 Anchored',
    desc: 'New B.Tech certificate added to Blockchain Block #1035',
    time: '5 min ago',
    unread: true,
    type: 'success',
  },
  {
    id: 2,
    title: 'SHA-256 Hash Verification Alert',
    desc: 'Certificate #BV-2024-001 verified genuinely',
    time: '20 min ago',
    unread: true,
    type: 'info',
  },
  {
    id: 3,
    title: 'System Access Notice',
    desc: 'Administrator logged in from Chrome browser',
    time: '1 hour ago',
    unread: true,
    type: 'warning',
  },
  {
    id: 4,
    title: 'New Issuer Account Pending',
    desc: 'Registrar office requested issuing privileges',
    time: '3 hours ago',
    unread: false,
    type: 'info',
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  // Authentication guard: prevent unauthorized users from viewing admin panel
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/login?unauthorized=true', { replace: true });
    }
  }, [navigate]);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen flex bg-brand-cream">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] bg-brand-green-dark flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo & user info */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-7 h-7 text-brand-sage" />
            <span className="text-white font-bold text-lg tracking-tight">BlockVault</span>
            <button
              className="ml-auto lg:hidden text-white/70 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-sage flex items-center justify-center text-white font-semibold text-sm shadow-inner">
              A
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {adminUser?.displayName || 'Administrator'}
              </p>
              <span className="inline-block bg-white/10 text-brand-sage text-[10px] font-medium px-2 py-0.5 rounded-full">
                {adminUser?.role || 'Super Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-sage/25 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:text-white hover:bg-red-900/30 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header: Search & Notifications */}
        <header className="bg-brand-cream/80 border-b border-brand-beige/50 px-4 lg:px-8 py-2.5">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle for sidebar */}
            <button
              type="button"
              className="lg:hidden p-2 text-brand-charcoal hover:text-brand-green hover:bg-white/60 rounded-lg transition-colors cursor-pointer mr-1"
              onClick={() => setSidebarOpen(true)}
              title="Open Admin Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates, blocks, users..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications Popover Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-600 hover:text-brand-green rounded-full hover:bg-white transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-fadeIn">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-brand-charcoal text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-[#1F3D2B] hover:underline flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                            );
                            setNotificationsOpen(false);
                            navigate('/admin/notifications');
                          }}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-3 ${
                            n.unread ? 'bg-green-50/40' : ''
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              n.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : n.type === 'warning'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {n.type === 'success' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <FileCheck className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-brand-charcoal leading-tight">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{n.desc}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                          </div>
                          {n.unread && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />}
                        </div>
                      ))}
                    </div>

                    <div className="px-4 pt-2 border-t border-gray-100">
                      <Link
                        to="/admin/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="block w-full py-2 text-center text-xs font-semibold text-[#1F3D2B] bg-brand-cream/80 hover:bg-[#1F3D2B] hover:text-white rounded-lg transition-colors"
                      >
                        View All Notifications &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar & username */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-bold text-brand-charcoal">Administrator</p>
                  <p className="text-[10px] text-gray-400">Master Access</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

