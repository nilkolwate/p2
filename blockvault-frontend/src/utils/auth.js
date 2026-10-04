// BlockVault Admin Authentication Utility

const ADMIN_SESSION_KEY = 'blockvault_admin_session';

export const ADMIN_CREDENTIALS = {
  username: 'Administrator',
  password: 'Admin@123',
};

/**
 * Attempt admin login with provided credentials
 * Strictly accepts only username: 'Administrator' and password: 'Admin@123'
 */
export const loginAdmin = (username, password) => {
  const trimmedUser = (username || '').trim();
  const trimmedPass = (password || '').trim();

  if (trimmedUser === ADMIN_CREDENTIALS.username && trimmedPass === ADMIN_CREDENTIALS.password) {
    const sessionData = {
      username: ADMIN_CREDENTIALS.username,
      displayName: 'Administrator',
      role: 'Super Admin',
      email: ADMIN_CREDENTIALS.username,
      token: 'bv_sec_token_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    return { success: true, user: sessionData };
  }

  return {
    success: false,
    message: 'Access Denied: Invalid username or password. Only authorized administrators can access this panel.',
  };
};

/**
 * Check if the admin is currently authenticated
 */
export const isAdminAuthenticated = () => {
  const session = localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) return false;

  try {
    const parsed = JSON.parse(session);
    return parsed && parsed.email === ADMIN_CREDENTIALS.username;
  } catch (e) {
    return false;
  }
};

/**
 * Retrieve the current logged-in admin user
 */
export const getAdminUser = () => {
  const session = localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
};

/**
 * Log out the admin user
 */
export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};
