import React, { useState, useEffect } from 'react';
import {
  Building2,
  Shield,
  Award,
  Lock,
  Key,
  Save,
  CheckCircle2,
} from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'blockvault_admin_settings';

const defaultSettings = {
  // Institution
  institutionName: 'Government Polytechnic',
  institutionCode: 'GOVPOLY-2024',
  accreditationBody: 'All India Council for Technical Education (AICTE)',
  contactEmail: 'principal@govpolytechnic.edu',
  websiteUrl: 'https://govpolytechnic.edu',

  // Blockchain
  consensusEngine: 'Proof-of-Authority (PoA)',
  hashAlgorithm: 'SHA-256 Cryptographic Digest',
  nodeNetwork: 'Private Institutional Network',

  // Issuance Policy
  autoGenerateQR: true,
  enableWatermark: true,
  allowPublicVerification: true,
  requirePrincipalApproval: true,

  // Security
  enforce2FA: true,
  sessionTimeoutMinutes: 60,

  // API
  rateLimitPerMinute: 120,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('institution');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    showToast('Settings saved successfully and applied across all modules.');
  };

  const tabs = [
    { id: 'institution', label: 'Institution Profile', icon: Building2 },
    { id: 'blockchain', label: 'Blockchain & Cryptography', icon: Shield },
    { id: 'issuance', label: 'Issuance Policies', icon: Award },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'api', label: 'API & Integrations', icon: Key },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl bg-[#1F3D2B] text-white flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-green-400" /> {toast}
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
          <p className="text-gray-500 mt-1">
            Configure institutional identities, cryptographic parameters, and system security controls.
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
                    : 'text-gray-600 hover:bg-gray-50 hover:text-brand-charcoal'
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
          <form onSubmit={handleSave} className="space-y-6">
            {/* Tab 1: Institution Profile */}
            {activeTab === 'institution' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-brand-charcoal">Institution Identity & Profile</h2>
                  <p className="text-xs text-gray-500">
                    These credentials will appear on all digitally verified certificates and public receipts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Official Institution Name
                  </label>
                  <input
                    type="text"
                    value={settings.institutionName}
                    onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Institution Code
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
                      Accreditation Body
                    </label>
                    <input
                      type="text"
                      value={settings.accreditationBody}
                      onChange={(e) => setSettings({ ...settings, accreditationBody: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Official Institution Email
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
                      Official Portal URL
                    </label>
                    <input
                      type="url"
                      value={settings.websiteUrl}
                      onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Blockchain & Cryptography */}
            {activeTab === 'blockchain' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-brand-charcoal">Blockchain & Cryptography Configuration</h2>
                  <p className="text-xs text-gray-500">
                    Cryptographic ledger and consensus settings that govern document immutability.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Consensus Protocol
                    </label>
                    <input
                      type="text"
                      disabled
                      value={settings.consensusEngine}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Hashing Algorithm
                    </label>
                    <input
                      type="text"
                      disabled
                      value={settings.hashAlgorithm}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Network Type/Topology
                  </label>
                  <input
                    type="text"
                    value={settings.nodeNetwork}
                    onChange={(e) => setSettings({ ...settings, nodeNetwork: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Issuance Policies */}
            {activeTab === 'issuance' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-brand-charcoal">Certificate Issuance Policies</h2>
                  <p className="text-xs text-gray-500">
                    Rules and automation triggers applied when certificates are minted.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal">Auto-generate Dynamic QR Code</p>
                      <p className="text-xs text-gray-500">
                        Embed a cryptographic scan-to-verify QR code directly into each certificate document.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoGenerateQR}
                      onChange={(e) => setSettings({ ...settings, autoGenerateQR: e.target.checked })}
                      className="w-5 h-5 rounded text-[#1F3D2B] focus:ring-[#1F3D2B]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal">BlockVault Security Watermark</p>
                      <p className="text-xs text-gray-500">
                        Embed tamper-evident background digital micro-watermarking on exports.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableWatermark}
                      onChange={(e) => setSettings({ ...settings, enableWatermark: e.target.checked })}
                      className="w-5 h-5 rounded text-[#1F3D2B] focus:ring-[#1F3D2B]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal">Public ID-Based Verification</p>
                      <p className="text-xs text-gray-500">
                        Allow external employers to query verification status using certificate IDs without logging in.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowPublicVerification}
                      onChange={(e) => setSettings({ ...settings, allowPublicVerification: e.target.checked })}
                      className="w-5 h-5 rounded text-[#1F3D2B] focus:ring-[#1F3D2B]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal">Require Principal/HOD Approval</p>
                      <p className="text-xs text-gray-500">
                        Mandates approval from Principal or HOD before anchoring certificate to blockchain.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requirePrincipalApproval}
                      onChange={(e) => setSettings({ ...settings, requirePrincipalApproval: e.target.checked })}
                      className="w-5 h-5 rounded text-[#1F3D2B] focus:ring-[#1F3D2B]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Tab 4: Security & Access */}
            {activeTab === 'security' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-brand-charcoal">Security & Administrator Access</h2>
                  <p className="text-xs text-gray-500">
                    Strict access controls for the central administrator portal.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                  <strong>Master Administrator Access:</strong> Access to this admin panel is strictly controlled and limited to authorized administrators only. Only users with valid credentials can access this system.
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal">Enforce Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-gray-500">
                        Require OTP authentication for all certificate issuance and revocation operations.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enforce2FA}
                      onChange={(e) => setSettings({ ...settings, enforce2FA: e.target.checked })}
                      className="w-5 h-5 rounded text-[#1F3D2B] focus:ring-[#1F3D2B]"
                    />
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Session Idle Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={settings.sessionTimeoutMinutes}
                      onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: API & Integrations */}
            {activeTab === 'api' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-brand-charcoal">API & External Integrations</h2>
                  <p className="text-xs text-gray-500">
                    Configure API rate limiting for external verification requests.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Rate Limit (Requests / minute)
                  </label>
                  <input
                    type="number"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => setSettings({ ...settings, rateLimitPerMinute: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3D2B] focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum number of verification API requests allowed per minute from external systems.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">
                  <strong>Note:</strong> SIS/ERP integration and API keys will be configured when the institution implements external system integration.
                </div>
              </div>
            )}

            {/* Bottom Submit */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#1F3D2B] text-white rounded-full font-medium hover:bg-[#16281C] transition-colors shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
