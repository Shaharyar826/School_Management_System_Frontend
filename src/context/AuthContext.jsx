import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);

  // Get tenant identifier from URL
  const getTenantIdentifier = useCallback(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('.') && !hostname.includes('localhost')) {
      const parts = hostname.split('.');
      return parts.length >= 3 ? parts[0] : hostname;
    }
    return new URLSearchParams(window.location.search).get('tenant') || 'demo';
  }, []);

  // Set axios defaults with enhanced security
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    
    // Add tenant header
    const tenantIdentifier = getTenantIdentifier();
    if (tenantIdentifier) {
      axios.defaults.headers.common['X-Tenant'] = tenantIdentifier;
    }
  }, [accessToken, getTenantIdentifier]);

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && 
            error.response?.data?.code === 'TOKEN_EXPIRED' && 
            !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshResult = await refreshAccessToken();
            if (refreshResult.success) {
              originalRequest.headers['Authorization'] = `Bearer ${refreshResult.accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            await logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await axios.post('/api/auth/refresh', {}, {
        withCredentials: true
      });
      
      if (res.data.success) {
        setAccessToken(res.data.accessToken);
        return {
          success: true,
          accessToken: res.data.accessToken
        };
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Load user with enhanced error handling
  const loadUser = useCallback(async () => {
    try {
      const tenantIdentifier = getTenantIdentifier();
      
      const res = await axios.get('/api/auth/me', {
        headers: { 'X-Tenant': tenantIdentifier },
        withCredentials: true
      });

      if (res.data.success) {
        setUser(res.data.data);
        setIsAuthenticated(true);
        setError(null);
        setEmailVerificationRequired(false);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      // Handle specific error codes
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setEmailVerificationRequired(true);
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Clear all auth state on other errors
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setEmailVerificationRequired(false);
      }
      
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [getTenantIdentifier]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register tenant with enhanced validation
  const registerTenant = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // Client-side validation
      if (!formData.subdomain || !formData.schoolName || !formData.adminEmail || 
          !formData.adminPassword || !formData.adminFirstName || !formData.adminLastName) {
        throw new Error('All fields are required');
      }

      if (formData.adminPassword !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const res = await axios.post('/api/auth/register-tenant', formData);

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message,
          redirectTo: res.data.redirectTo, // BACKEND CONTROLS REDIRECT
          requiresVerification: res.data.data?.requiresVerification || false,
          nextStep: res.data.data?.nextStep
        };
      }
    } catch (err) {
      const errorResponse = err.response?.data;
      let message = 'Registration failed. Please try again.';
      let fieldErrors = {};
      
      if (errorResponse) {
        message = errorResponse.message || message;
        
        if (errorResponse.errors) {
          fieldErrors = errorResponse.errors;
        }
      }
      
      setError(message);
      return { 
        success: false, 
        message,
        fieldErrors: fieldErrors
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token, tenantIdentifier) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/auth/verify-email', {
        token,
        tenantIdentifier: tenantIdentifier || getTenantIdentifier()
      });

      if (res.data.success) {
        setEmailVerificationRequired(false);
        return {
          success: true,
          message: res.data.message,
          nextStep: res.data.data.nextStep
        };
      }
    } catch (err) {
      console.error('Email verification error:', err);
      const message = err.response?.data?.message || 'Email verification failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [getTenantIdentifier]);

  // Resend verification email
  const resendVerification = useCallback(async (email, tenantIdentifier) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/auth/resend-verification', {
        email,
        tenantIdentifier: tenantIdentifier || getTenantIdentifier()
      });

      return {
        success: res.data.success,
        message: res.data.message
      };
    } catch (err) {
      console.error('Resend verification error:', err);
      const message = err.response?.data?.message || 'Failed to resend verification email';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [getTenantIdentifier]);

  // Google Sign-In with enhanced security
  const googleSignIn = useCallback(async (credential, tenantIdentifier) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/auth/google', {
        credential: credential,
        tenantIdentifier: tenantIdentifier || getTenantIdentifier()
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        const { accessToken, refreshToken, data } = res.data;
        
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        setUser(data);
        setIsAuthenticated(true);
        
        return {
          success: true,
          redirectTo: data.redirectTo,
          user: data
        };
      }
    } catch (err) {
      const errorData = err.response?.data;
      const message = errorData?.message || 'Google sign-in failed';
      setError(message);
      
      // Handle specific error codes
      if (errorData?.code === 'USER_NOT_FOUND') {
        return {
          success: false,
          message,
          code: 'USER_NOT_FOUND',
          suggestion: errorData.suggestion,
          email: errorData.email
        };
      }
      
      if (errorData?.code === 'EMAIL_NOT_VERIFIED') {
        setEmailVerificationRequired(true);
        return {
          success: false,
          message,
          code: 'EMAIL_NOT_VERIFIED',
          requiresVerification: true,
          redirectTo: errorData.redirectTo,
          email: errorData.email
        };
      }
      
      if (errorData?.code === 'ACCOUNT_LOCKED') {
        return {
          success: false,
          message,
          code: 'ACCOUNT_LOCKED',
          lockedUntil: errorData.lockedUntil,
          remainingMinutes: errorData.remainingMinutes
        };
      }
      
      if (errorData?.code === 'ACCOUNT_INACTIVE' || errorData?.code === 'ACCOUNT_ON_HOLD') {
        return {
          success: false,
          message,
          code: errorData.code
        };
      }
      
      if (errorData?.code === 'ACCOUNT_PENDING_APPROVAL') {
        return {
          success: false,
          message,
          code: 'ACCOUNT_PENDING_APPROVAL',
          requiresApproval: true
        };
      }
      
      if (errorData?.code === 'TENANT_NOT_FOUND') {
        return {
          success: false,
          message,
          code: 'TENANT_NOT_FOUND'
        };
      }
      
      if (errorData?.code === 'TENANT_SUSPENDED') {
        return {
          success: false,
          message,
          code: 'TENANT_SUSPENDED'
        };
      }
      
      return { 
        success: false, 
        message,
        code: errorData?.code
      };
    } finally {
      setLoading(false);
    }
  }, [getTenantIdentifier]);

  // Login with enhanced security
  const login = useCallback(async (formData) => {
    setLoading(true);
    
    try {
      const tenantIdentifier = formData.tenantIdentifier || getTenantIdentifier();
      const res = await axios.post('/api/auth/login', {
        ...formData,
        tenantIdentifier
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        const { accessToken, refreshToken, data } = res.data;
        
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        setUser(data);
        setIsAuthenticated(true);
        setEmailVerificationRequired(false);
        setLoading(false);
        
        return {
          success: true,
          redirectTo: data.redirectTo,
          user: data
        };
      }
      
      setLoading(false);
      return { success: false, message: 'Login failed' };
    } catch (err) {
      setLoading(false);
      
      const errorData = err.response?.data;
      
      if (errorData?.requiresVerification) {
        setEmailVerificationRequired(true);
        return {
          success: false,
          message: errorData.message || 'Email verification required',
          requiresVerification: true,
          email: errorData.email
        };
      }
      
      if (errorData?.accountLocked) {
        return {
          success: false,
          message: errorData.message || 'Account is locked',
          accountLocked: true,
          lockedUntil: errorData.lockedUntil
        };
      }
      
      return { 
        success: false, 
        message: errorData?.message || err.message || 'Login failed. Please check your credentials.' 
      };
    }
  }, [getTenantIdentifier]);

  // Secure logout
  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all auth state regardless of API call success
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token'); // Remove legacy token too
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setEmailVerificationRequired(false);
      setError(null);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
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
    refreshAccessToken
  }), [
    user, accessToken, refreshToken, isAuthenticated, loading, error, emailVerificationRequired,
    registerTenant, verifyEmail, resendVerification, login, googleSignIn, logout, loadUser, refreshAccessToken
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
