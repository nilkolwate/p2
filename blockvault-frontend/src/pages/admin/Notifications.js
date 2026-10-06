import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  Trash2,
  X,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';

import {
  getStoredNotifications,
  markAllNotificationsRead,
  markSingleNotificationRead,
  deleteStoredNotification,
  clearAllStoredNotifications,
  subscribeNotifications,
  saveStoredNotifications,
} from '../../utils/notificationStore';

export default function Notifications() {
  const [notifications, setNotifications] = useState(getStoredNotifications);
  const [activeTab, setActiveTab] = useState('All');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Notification Preferences
  const [prefs, setPrefs] = useState({
    emailOnIssue: true,
    emailOnFailedVerify: true,
    dailyDigest: false,
    systemAlerts: true,
  });

  useEffect(() => {
    setNotifications(getStoredNotifications());
    const unsub = subscribeNotifications((updated) => {
      setNotifications(updated);
    });

    apiService
      .getNotifications()
      .then((res) => {
        if (res && res.success && res.data && res.data.length > 0) {
          const liveNotifs = res.data.map((n) => ({
            id: n.id,
            title: n.title,
            description: n.description || n.message,
            category: n.category || 'Certificates',
            priority: n.priority || (n.type === 'alert' ? 'High' : 'Normal'),
            type: n.type === 'alert' ? 'warning' : (n.type || 'info'),
            timestamp: n.timestamp || n.time || 'Recently',
            unread: Boolean(n.unread),
            actionUrl: n.actionUrl || '/admin/certificates',
            actionText: n.actionText || 'View Details',
          }));
          saveStoredNotifications(liveNotifs);
        }
      })
      .catch((err) => console.warn('Notifications fetch error:', err));

    return unsub;
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const markAllRead = () => {
    markAllNotificationsRead();
    showToast('All notifications marked as read.');
  };

  const markSingleRead = (id) => {
    markSingleNotificationRead(id);
  };

  const deleteNotification = (id) => {
    deleteStoredNotification(id);
    showToast('Notification deleted.');
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAllStoredNotifications();
      showToast('All notifications cleared.');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return n.unread;
    if (activeTab === 'Certificates') return n.category === 'Certificates';
    if (activeTab === 'Security') return n.category === 'Security';
    if (activeTab === 'System') return n.category === 'System' || n.category === 'Users';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl bg-[#1F3D2B] text-white flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-3xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif' " }}
            >
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            Real-time feed of certificate operations, cryptographic alerts, and administrative activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" /> Preferences
          </button>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Mark All Read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-medium hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        {['All', 'Unread', 'Certificates', 'Security', 'System'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-[#1F3D2B] bg-white border-t-2 border-l border-r border-[#1F3D2B]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No notifications in this category</p>
            <p className="text-xs text-gray-400 mt-1">
              You are completely caught up with all blockchain and system alerts.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md flex items-start gap-4 ${
                n.unread
                  ? 'border-brand-sage/40 bg-green-50/20'
                  : 'border-gray-100'
              }`}
            >
              {/* Category Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  n.type === 'success'
                    ? 'bg-green-100 text-green-700'
                    : n.type === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {n.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : n.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-base font-bold text-brand-charcoal">{n.title}</h3>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-auto sm:ml-2">
                    {n.category}
                  </span>
                  {n.priority === 'High' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      High Priority
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-3">{n.description}</p>

                <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-400">
                  <span>{n.timestamp}</span>

                  <div className="flex items-center gap-3">
                    {n.unread && (
                      <button
                        onClick={() => markSingleRead(n.id)}
                        className="text-xs text-[#1F3D2B] font-semibold hover:underline cursor-pointer"
                      >
                        Mark as read
                      </button>
                    )}
                    {n.actionUrl && (
                      <button
                        onClick={() => {
                          markSingleRead(n.id);
                          navigate(n.actionUrl);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F3D2B] bg-brand-cream/80 hover:bg-[#1F3D2B] hover:text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {n.actionText} <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Preferences Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-brand-charcoal">Notification Preferences</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs.emailOnIssue}
                  onChange={(e) => setPrefs({ ...prefs, emailOnIssue: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1F3D2B] focus:ring-[#1F3D2B]"
                />
                <div>
                  <p className="text-sm font-semibold text-brand-charcoal">Certificate Issuance Alerts</p>
                  <p className="text-xs text-gray-500">
                    Receive immediate notification whenever a new certificate is anchored to a block.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs.emailOnFailedVerify}
                  onChange={(e) => setPrefs({ ...prefs, emailOnFailedVerify: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1F3D2B] focus:ring-[#1F3D2B]"
                />
                <div>
                  <p className="text-sm font-semibold text-brand-charcoal">Cryptographic Mismatch Warnings</p>
                  <p className="text-xs text-gray-500">
                    Trigger urgent alert when a document fails SHA-256 verification or indicates tampering.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs.systemAlerts}
                  onChange={(e) => setPrefs({ ...prefs, systemAlerts: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1F3D2B] focus:ring-[#1F3D2B]"
                />
                <div>
                  <p className="text-sm font-semibold text-brand-charcoal">Administrative & User Events</p>
                  <p className="text-xs text-gray-500">
                    Notify on new user registrations, role adjustments, and security policy changes.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs.dailyDigest}
                  onChange={(e) => setPrefs({ ...prefs, dailyDigest: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1F3D2B] focus:ring-[#1F3D2B]"
                />
                <div>
                  <p className="text-sm font-semibold text-brand-charcoal">Daily Blockchain Health Digest</p>
                  <p className="text-xs text-gray-500">
                    Receive daily summary of total verified certificates and mined blocks.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  showToast('Notification preferences saved.');
                }}
                className="px-5 py-2 bg-[#1F3D2B] text-white rounded-xl text-sm font-medium hover:bg-[#16281C]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
