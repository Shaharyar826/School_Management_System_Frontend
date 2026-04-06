import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';

axios.defaults.baseURL = apiUrl;
axios.defaults.withCredentials = true;

// Restore token from previous session
const savedToken = localStorage.getItem('ba_token');
if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

// ── Request interceptor ───────────────────────────────────────────────────────
axios.interceptors.request.use(
  (config) => {
    const tenant = sessionStorage.getItem('tenant') || localStorage.getItem('tenant');
    if (tenant) {
      config.headers['X-Tenant'] = tenant;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isPublicPage = ['/', '/signup', '/login', '/about', '/contact', '/pricing'].includes(window.location.pathname);
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/super-admin');

      if (!isPublicPage && !isAuthPage) {
        localStorage.removeItem('ba_token');
        localStorage.removeItem('tenant');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
