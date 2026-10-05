// BlockVault Admin Authentication Utilities
// Manages real JWT session storage strictly in sessionStorage (tab-scoped)

const TOKEN_KEY = 'blockvault_auth_token';
const USER_KEY = 'blockvault_auth_user';

// Clean up any stale localStorage tokens from previous versions
try {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('blockvault_admin_session');
} catch (e) {
  // Ignore in restricted environments
}

/**
 * Get stored JWT authorization token from sessionStorage
 */
export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
};

/**
 * Check if a JWT token is expired based on its base64 payload exp claim
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.exp) return false;
    return parsed.exp * 1000 < Date.now();
  } catch (e) {
    return false;
  }
};

/**
 * Check if the admin is currently authenticated with a stored JWT token
 */
export const isAdminAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    logoutAdmin();
    return false;
  }
  return true;
};

/**
 * Retrieve the current logged-in admin user details from sessionStorage
 */
export const getAdminUser = () => {
  try {
    const userStr = sessionStorage.getItem(USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

/**
 * Store the authenticated session (token + user payload) strictly in sessionStorage
 * Closing the browser tab automatically terminates the session.
 */
export const setAdminSession = (token, user) => {
  try {
    // Clear any potential leftover in localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save session to sessionStorage:', e);
  }
};

/**
 * Log out the admin user and clear all stored session tokens
 */
export const logoutAdmin = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('blockvault_admin_session');
  } catch (e) {
    // Ignore
  }
};
