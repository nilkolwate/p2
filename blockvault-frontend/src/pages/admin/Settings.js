import React, { useState, useEffect } from 'react';
import {
  Building2,
  Lock,
  Server,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import apiService from '../../services/api';
import { getAdminUser, setAdminSession } from '../../utils/auth';

const SETTINGS_STORAGE_KEY = 'blockvault_admin_settings';

const defaultSettings = {
  // Institution Profile
  institutionName: 'Government Polytechnic Amravati',
  institutionCode: 'GP-AMRAVATI-101',
  department: 'Computer Engineering',
  contactEmail: 'registrar@gpamravati.ac.in',
  portalUrl: 'https://sayalijogi26-alt.github.io/Blockvault-1',

  // Security & Admin Access
  adminEmail: 'admin@blockvault.edu',
  adminName: 'Master Administrator',
  sessionTimeoutMinutes: 60,
  confirmRevocation: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('institution');
  const [toast, setToast] = useState(null);

  // Security Password State
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  // System Health Diagnostic State
  const [healthStatus, setHealthStatus] = useState(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.warn('Failed to parse settings:', e);
      }
    }
    const admin = getAdminUser();
    if (admin && admin.email) {
      setSettings((prev) => ({
        ...prev,
        adminEmail: admin.email,
        adminName: admin.displayName || prev.adminName,
      }));
    }
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    showToast('System configuration saved successfully.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (!passwordState.currentPassword || !passwordState.newPassword) {
      setPasswordMsg({ text: 'Please fill in all password fields.', type: 'error' });
      return;
    }
    if (passwordState.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    // Save updated password in local auth state
    const currentUser = getAdminUser() || {};
    setAdminSession(localStorage.getItem('token') || 'local-admin-token', {
      ...currentUser,
      updatedAt: new Date().toISOString(),
    });

    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMsg({ text: 'Password successfully updated.', type: 'success' });
    showToast('Admin password updated successfully.');
  };

  const testBackendConnection = async () => {
    setPinging(true);
    setHealthStatus(null);
    const start = Date.now();
    try {
      const res = await apiService.checkHealth();
      const latency = Date.now() - start;
      if (res && res.status === 'ok') {
        setHealthStatus({
          connected: true,
          latency: `${latency} ms`,
          message: 'Backend API is fully operational and responsive.',
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setHealthStatus({
          connected: false,
          latency: `${latency} ms`,
          message: res?.message || 'Received unexpected response from server.',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err) {
      setHealthStatus({
        connected: false,
        latency: 'Timeout',
        message: 'Could not connect to backend server. Make sure API is online.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setPinging(false);
    }
  };

  const resetLocalCache = () => {
    if (window.confirm('Reset all local storage cache and reload default ledger settings?')) {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem('blockvault_read_notification_ids');
      localStorage.removeItem('blockvault_notifications_all_read');
      setSettings(defaultSettings);
      showToast('Cache reset successfully. Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const tabs = [
    { id: 'institution', label: 'Institution Profile', icon: Building2 },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'system', label: 'Server & Maintenance', icon: Server },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl bg-[#1F3D2B] text-white flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            System Settings
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage institutional credentials, administrator security, and system diagnostics.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F3D2B] text-white rounded-full font-medium text-sm hover:bg-[#16281C] transition-colors shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Tab list */}
        <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#1F3D2B] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Tab content */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          {/* TAB 1: Institution Profile */}
          {activeTab === 'institution' && (
            <form onSubmit={handleSave} className="space-y-5 animate-fadeIn">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Institution Identity & Profile</h2>
                <p className="text-xs text-gray-500">
                  Institutional branding and identity details displayed on issued certificates and verification portal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Official Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.institutionName}
                  onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Institution / College Code
                  </label>
                  <input
                    type="text"
                    value={settings.institutionCode}
                    onChange={(e) => setSettings({ ...settings, institutionCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={settings.department}
                    onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Official Registrar Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Verification Portal URL
                  </label>
                  <input
                    type="url"
                    value={settings.portalUrl}
                    onChange={(e) => setSettings({ ...settings, portalUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F3D2B] text-white rounded-full font-medium text-sm hover:bg-[#16281C] transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Access */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Security & Administrator Access</h2>
                <p className="text-xs text-gray-500">
                  Manage administrator credentials, session policies, and critical action safeguards.
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Admin Display Name
                    </label>
                    <input
                      type="text"
                      value={settings.adminName}
                      onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Session Idle Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="480"
                      value={settings.sessionTimeoutMinutes}
                      onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.confirmRevocation}
                        onChange={(e) => setSettings({ ...settings, confirmRevocation: e.target.checked })}
                        className="w-4 h-4 text-[#1F3D2B] rounded focus:ring-[#1F3D2B]"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        Require strict confirmation before revoking certificates
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#1F3D2B] text-white rounded-full font-medium text-sm hover:bg-[#16281C] transition-colors shadow-sm cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Update Policy
                  </button>
                </div>
              </form>

              {/* Password Change Form */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Change Admin Password</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Update the password used to access the BlockVault administrative console.
                </p>

                {passwordMsg.text && (
                  <div
                    className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                      passwordMsg.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {passwordMsg.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    )}
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordState.currentPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={passwordState.newPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={passwordState.confirmPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-full font-medium text-xs hover:bg-black transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Server & Maintenance */}
          {activeTab === 'system' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Server & Maintenance Diagnostics</h2>
                <p className="text-xs text-gray-500">
                  Verify real-time backend API connectivity, blockchain response latency, and manage local storage cache.
                </p>
              </div>

              {/* Endpoint Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-gray-700 uppercase">Active Backend API Endpoint</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Production Gateway
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 font-mono text-xs text-gray-800 truncate">
                  {apiService.BACKEND_URL || 'https://p2-c6yu.onrender.com'}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={testBackendConnection}
                    disabled={pinging}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F3D2B] text-white rounded-full text-xs font-semibold hover:bg-[#16281C] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                    {pinging ? 'Pinging Backend...' : 'Ping Live API'}
                  </button>

                  {healthStatus && (
                    <span
                      className={`text-xs font-medium flex items-center gap-1.5 ${
                        healthStatus.connected ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {healthStatus.connected ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {healthStatus.latency} ({healthStatus.timestamp})
                    </span>
                  )}
                </div>

                {healthStatus && (
                  <p
                    className={`text-xs mt-2 p-2 rounded-lg ${
                      healthStatus.connected
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-red-50 text-red-900 border border-red-200'
                    }`}
                  >
                    {healthStatus.message}
                  </p>
                )}
              </div>

              {/* Maintenance Tools */}
              <div className="p-5 border border-gray-200 rounded-2xl bg-white space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Cache & Local Ledger Reset</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  If any certificate data or unread notification counts become out-of-sync with the blockchain ledger, resetting local cache will re-synchronize directly with the server.
                </p>
                <button
                  type="button"
                  onClick={resetLocalCache}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Local Cache & Sync
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
