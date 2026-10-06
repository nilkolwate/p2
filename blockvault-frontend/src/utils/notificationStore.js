/**
 * Notification Store & Event Dispatcher
 * Synchronizes notification state between Notifications page and AdminLayout bell icon.
 */

const NOTIFICATIONS_STORAGE_KEY = 'blockvault_notifications';
const NOTIFICATIONS_EVENT = 'blockvault_notifications_change';

const defaultNotifications = [
  {
    id: 'NOTIF-001',
    title: 'Certificate #BV-2026-2293B257 Anchored to Block #1',
    description: 'Degree certificate for Pranav Thawali (BCA) successfully verified and added to the blockchain ledger.',
    category: 'Certificates',
    priority: 'Normal',
    type: 'success',
    timestamp: '5 minutes ago',
    unread: true,
    actionUrl: '/admin/certificates',
    actionText: 'View Certificate',
  },
  {
    id: 'NOTIF-002',
    title: 'SHA-256 Digest Verification Passed',
    description: 'Certificate #BV-2026-2B4C9988 for Sayali Jogi verified with 100% cryptographic integrity score.',
    category: 'Security',
    priority: 'High',
    type: 'success',
    timestamp: '25 minutes ago',
    unread: true,
    actionUrl: '/admin/blockchain',
    actionText: 'Inspect Block',
  },
  {
    id: 'NOTIF-003',
    title: 'Master Administrator Session Established',
    description: 'Administrator logged into the central admin portal from Chrome on Windows.',
    category: 'System',
    priority: 'Normal',
    type: 'info',
    timestamp: '1 hour ago',
    unread: false,
    actionUrl: '/admin/settings',
    actionText: 'Review Security',
  },
  {
    id: 'NOTIF-004',
    title: 'Certificate #BV-2026-E4790DA9 Revocation Logged',
    description: 'Audit Test Student certificate revoked under Block #4 receipt.',
    category: 'Certificates',
    priority: 'High',
    type: 'warning',
    timestamp: '1 day ago',
    unread: false,
    actionUrl: '/admin/certificates',
    actionText: 'Inspect Status',
  },
];

const READ_IDS_KEY = 'blockvault_read_notification_ids';
const ALL_READ_KEY = 'blockvault_notifications_all_read';

function getReadIds() {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (_) {}
  return new Set();
}

function saveReadIds(set) {
  try {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (_) {}
}

export function getStoredNotifications() {
  try {
    const allRead = localStorage.getItem(ALL_READ_KEY) === 'true';
    const readIds = getReadIds();
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    let list = defaultNotifications;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    }
    return list.map((n) => ({
      ...n,
      unread: allRead || readIds.has(n.id) ? false : Boolean(n.unread),
    }));
  } catch (e) {
    console.warn('Failed to parse stored notifications:', e);
  }
  return defaultNotifications;
}

export function saveStoredNotifications(notifications) {
  try {
    const allRead = localStorage.getItem(ALL_READ_KEY) === 'true';
    const readIds = getReadIds();
    const sanitized = (notifications || []).map((n) => ({
      ...n,
      unread: allRead || readIds.has(n.id) ? false : Boolean(n.unread),
    }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(sanitized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT, { detail: sanitized }));
    }
    return sanitized;
  } catch (e) {
    console.warn('Failed to save notifications to localStorage:', e);
    return notifications;
  }
}

export function getUnreadCount() {
  const notifs = getStoredNotifications();
  return notifs.filter((n) => n.unread).length;
}

export function markAllNotificationsRead() {
  try {
    localStorage.setItem(ALL_READ_KEY, 'true');
    const current = getStoredNotifications();
    const readIds = getReadIds();
    current.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);

    const updated = current.map((n) => ({ ...n, unread: false }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT, { detail: updated }));
    }
    return updated;
  } catch (e) {
    console.warn('markAllNotificationsRead error:', e);
    return [];
  }
}

export function markSingleNotificationRead(id) {
  try {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);

    const current = getStoredNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, unread: false } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT, { detail: updated }));
    }
    return updated;
  } catch (e) {
    console.warn('markSingleNotificationRead error:', e);
    return [];
  }
}

export function deleteStoredNotification(id) {
  const current = getStoredNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveStoredNotifications(updated);
  return updated;
}

export function clearAllStoredNotifications() {
  saveStoredNotifications([]);
  return [];
}

export function subscribeNotifications(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => {
    callback(e.detail || getStoredNotifications());
  };
  window.addEventListener(NOTIFICATIONS_EVENT, handler);
  return () => {
    window.removeEventListener(NOTIFICATIONS_EVENT, handler);
  };
}
