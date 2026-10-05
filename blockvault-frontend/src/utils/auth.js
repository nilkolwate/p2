// BlockVault Admin Authentication Utilities
// Manages real JWT session storage and authorization state

const TOKEN_KEY = 'blockvault_auth_token';
const USER_KEY = 'blockvault_auth_user';

/**
 * Get stored JWT authorization token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
};

/**
 * Check if the admin is currently authenticated with a stored JWT token
 */
export const isAdminAuthenticated = () => {
  const token = getToken();
  return Boolean(token);
};

/**
 * Retrieve the current logged-in admin user details
 */
export const getAdminUser = () => {
  const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

/**
 * Store the authenticated session (token + user payload)
 */
export const setAdminSession = (token, user, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  // Clear any existing session in opposite storage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  storage.setItem(TOKEN_KEY, token);
  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Log out the admin user and clear all stored session tokens
 */
export const logoutAdmin = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};
