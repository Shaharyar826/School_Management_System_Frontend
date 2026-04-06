import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);

  const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
  const ACTIVITY_KEY = 'ba_last_activity';

  const getStoredActivity = useCallback(() => {
    const stored = window.sessionStorage.getItem(ACTIVITY_KEY) || localStorage.getItem(ACTIVITY_KEY);
    return stored ? parseInt(stored, 10) : null;
  }, []);

  const setStoredActivity = useCallback((timestamp = Date.now()) => {
    const value = String(timestamp);
    try {
      window.sessionStorage.setItem(ACTIVITY_KEY, value);
    } catch (error) {
      // Ignore storage failures in private mode
    }
    try {
      localStorage.setItem(ACTIVITY_KEY, value);
    } catch (error) {
      // Ignore storage failures in private mode
    }
    return timestamp;
  }, []);

  const clearStoredActivity = useCallback(() => {
    try {
      window.sessionStorage.removeItem(ACTIVITY_KEY);
    } catch (error) {
      // Ignore storage failures
    }
    try {
      localStorage.removeItem(ACTIVITY_KEY);
    } catch (error) {
      // Ignore storage failures
    }
  }, []);

  const isSessionExpired = useCallback(() => {
    const lastActivity = getStoredActivity();
    return lastActivity ? (Date.now() - lastActivity) > INACTIVITY_TIMEOUT_MS : false;
  }, [getStoredActivity]);

  const updateLastActivity = useCallback(() => {
    if (!isAuthenticated) return;
    setStoredActivity();
  }, [isAuthenticated, setStoredActivity]);

  // Set token in axios headers — token is managed via httpOnly cookie by Better Auth.
  // We no longer store it in localStorage to prevent XSS token theft.

  useEffect(() => {
    if (!isAuthenticated) return;

    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        setStoredActivity();
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setStoredActivity();
        return response;
      },
      (error) => {
        if (error.response?.status !== 401) {
          setStoredActivity();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [isAuthenticated, setStoredActivity]);

  // Load current user
  const loadUser = useCallback(async () => {
    const savedTenant = localStorage.getItem('tenant');
    const savedToken  = localStorage.getItem('ba_token');

    // If the current session has been idle too long, expire it immediately.
    if (isSessionExpired()) {
      clearStoredActivity();
      setLoading(false);
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
      return;
    }

    try {
      const headers = { 'X-Tenant': savedTenant || '' };
      // Attach token so the backend withBearer helper can inject it as a session cookie
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`;

      const res = await axios.get('/api/auth/me', { headers, withCredentials: true });

      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        if (userData.tenant?.subdomain) {
          localStorage.setItem('tenant', userData.tenant.subdomain);
          axios.defaults.headers.common['X-Tenant'] = userData.tenant.subdomain;
        }
        if (savedToken) axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        setIsAuthenticated(true);
        setStoredActivity();
      }
    } catch (err) {
      localStorage.removeItem('tenant');
      clearStoredActivity();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [clearStoredActivity, isSessionExpired, setStoredActivity]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register tenant
  const registerTenant = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/onboarding/register-tenant', formData);

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message,
          requiresVerification: res.data.data?.requiresVerification ?? true,
          nextStep: res.data.data?.nextStep,
          tenant: res.data.data?.tenant,
        };
      }
    } catch (err) {
      const errorData = err.response?.data;
      const message = errorData?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message, fieldErrors: errorData?.errors || {} };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);

      if (res.data.success) {
        const { data, token } = res.data;
        if (token) {
          localStorage.setItem('ba_token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        sessionStorage.setItem('tenant', data.tenant?.subdomain || formData.tenantIdentifier || '');
        localStorage.setItem('tenant', data.tenant?.subdomain || formData.tenantIdentifier || '');
        axios.defaults.headers.common['X-Tenant'] = data.tenant?.subdomain || formData.tenantIdentifier || '';
        setUser(data);
        setIsAuthenticated(true);
        setEmailVerificationRequired(false);
        setStoredActivity();
        return { success: true, redirectTo: data.redirectTo, user: data };
      }

      return { success: false, message: 'Login failed' };
    } catch (err) {
      const errorData = err.response?.data;

      if (errorData?.requiresVerification) {
        setEmailVerificationRequired(true);
        return {
          success: false,
          message: errorData.message || 'Email verification required',
          requiresVerification: true,
          email: errorData.email,
        };
      }

      return {
        success: false,
        message: errorData?.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Google Sign In
  const googleSignIn = useCallback(async (credential, tenantIdentifier) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/auth/login', {
        email: null,
        password: null,
        tenantIdentifier,
        googleCredential: credential,
      });

      if (res.data.success) {
        const { data, token } = res.data;
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('tenant', data.tenant?.subdomain || tenantIdentifier || '');
        setUser(data);
        setIsAuthenticated(true);
        setStoredActivity();
        return { success: true, redirectTo: data.redirectTo, user: data };
      }
    } catch (err) {
      const errorData = err.response?.data;
      const message = errorData?.message || 'Google sign-in failed';
      setError(message);
      return { success: false, message, code: errorData?.code };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setEmailVerificationRequired(false);
      setError(null);
      localStorage.removeItem('tenant');
      localStorage.removeItem('ba_token');
      clearStoredActivity();
      delete axios.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['X-Tenant'];
    }
  }, [clearStoredActivity]);

  const expireSession = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Session expiration logout failed', error);
    } finally {
      clearStoredActivity();
      window.location.href = '/';
    }
  }, [logout, clearStoredActivity]);

  useEffect(() => {
    if (!isAuthenticated || loading) return;

    if (isSessionExpired()) {
      expireSession();
      return;
    }

    setStoredActivity();
    const intervalId = window.setInterval(() => {
      if (isAuthenticated && isSessionExpired()) {
        expireSession();
      }
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, loading, isSessionExpired, expireSession, setStoredActivity]);

  useEffect(() => {
    const activityHandler = () => {
      if (isAuthenticated) {
        setStoredActivity();
      }
    };

    const storageHandler = (event) => {
      if (event.key === ACTIVITY_KEY && event.newValue) {
        const last = parseInt(event.newValue, 10);
        if (!Number.isNaN(last) && Date.now() - last > INACTIVITY_TIMEOUT_MS) {
          expireSession();
        }
      }
    };

    const events = ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'];
    events.forEach((eventName) => window.addEventListener(eventName, activityHandler, { passive: true }));
    window.addEventListener('storage', storageHandler);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, activityHandler));
      window.removeEventListener('storage', storageHandler);
    };
  }, [isAuthenticated, setStoredActivity, expireSession]);

  // Email verification — Better Auth handles via /api/auth/verify-email
  const verifyEmail = useCallback(async (token, tenantIdentifier) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/auth/verify-email?token=${token}&callbackURL=/`);
      if (res.data.success || res.status === 200) {
        setEmailVerificationRequired(false);
        return { success: true, message: 'Email verified successfully' };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Email verification failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend verification
  const resendVerification = useCallback(async (email) => {
    try {
      const res = await axios.post('/api/auth/send-verification-email', { email });
      return { success: true, message: res.data.message || 'Verification email sent' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to resend' };
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    error,
    emailVerificationRequired,
    registerTenant,
    verifyEmail,
    resendVerification,
    login,
    googleSignIn,
    logout,
    loadUser,
  }), [
    user, isAuthenticated, loading, error, emailVerificationRequired,
    registerTenant, verifyEmail, resendVerification, login, googleSignIn, logout, loadUser,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
