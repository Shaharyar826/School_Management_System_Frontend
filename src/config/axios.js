import axios from 'axios';
import performanceMonitor from '../utils/performanceMonitor';

const apiUrl = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

if (import.meta.env.PROD && !apiUrl) {
  console.error('VITE_API_URL is not set. API calls will fail.');
}

axios.defaults.baseURL = apiUrl;

// Add request interceptor to include auth token and tenant context
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    let token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    // If no token in localStorage, try to get from cookies
    if (!token) {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        token = accessTokenCookie.split('=')[1];
      }
    }

    // If token exists and is not null/undefined string, add it to headers
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant context from subdomain with validation
    const hostname = window.location.hostname;
    let tenantIdentifier = null;
    
    if (hostname.includes('.') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        tenantIdentifier = parts[0]; // subdomain
      } else if (parts.length === 2) {
        tenantIdentifier = hostname; // custom domain
      }
    } else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost:') || hostname.startsWith('127.0.0.1:')) {
      // For development, check for explicit tenant header or use demo
      tenantIdentifier = new URLSearchParams(window.location.search).get('tenant') || 'demo';
    }
    
    if (tenantIdentifier && tenantIdentifier !== 'www') {
      // Sanitize tenant identifier to prevent header injection
      tenantIdentifier = tenantIdentifier.replace(/[\r\n]/g, '');
      config.headers['X-Tenant'] = tenantIdentifier;
    }

    config.withCredentials = true;

    // Add request start time for performance monitoring
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    performanceMonitor.logError('REQUEST_ERROR', 'Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors and track performance
axios.interceptors.response.use(
  (response) => {
    // Track successful API call performance
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      const endpoint = response.config.url.replace(response.config.baseURL, '');
      performanceMonitor.trackApiCall(endpoint, response.config.method.toUpperCase(), duration, true);
    }
    return response;
  },
  (error) => {
    // Track failed API call performance
    if (error.config?.metadata) {
      const duration = Date.now() - error.config.metadata.startTime;
      const endpoint = error.config.url.replace(error.config.baseURL, '');
      performanceMonitor.trackApiCall(endpoint, error.config.method.toUpperCase(), duration, false);
    }

    // Log error for monitoring
    performanceMonitor.logError('API_ERROR', `${error.response?.status || 'Network'} error`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem('token');
      const isPublicPage = ['/', '/signup', '/login', '/about', '/contact'].includes(window.location.pathname);
      
      if (hasToken && !isPublicPage && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/super-admin')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;