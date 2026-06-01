const CACHE_PREFIX = 'sms_saas_cache_v1';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeJsonParse = (value, fallback = null) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const resolveTenantIdentifier = () => {
  if (!isBrowser()) return null;

  const queryTenant = new URLSearchParams(window.location.search).get('tenant');
  if (queryTenant) return queryTenant;

  const storedTenant = localStorage.getItem('tenant');
  if (storedTenant) return storedTenant;

  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('localhost:') && !hostname.startsWith('127.0.0.1:')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) return parts[0];
    if (parts.length === 2) return hostname;
  }

  return null;
};

const buildKey = (...parts) => [CACHE_PREFIX, ...parts.filter(Boolean)].join(':');

export const cacheKeys = {
  authSession: (tenant = resolveTenantIdentifier()) => buildKey('auth_session', tenant || 'global'),
  setupStatus: (tenant = resolveTenantIdentifier()) => buildKey('setup_status', tenant || 'global'),
  tenantFeatures: (tenant = resolveTenantIdentifier()) => buildKey('tenant_features', tenant || 'global'),
  tenantConfig: (tenant = resolveTenantIdentifier()) => buildKey('tenant_config', tenant || 'global'),
  dashboardStats: (tenant = resolveTenantIdentifier(), role = 'default') => buildKey('dashboard_stats', tenant || 'global', role || 'default'),
};

export const readCache = (key, fallback = null) => {
  if (!isBrowser()) return fallback;

  return safeJsonParse(window.localStorage.getItem(key), fallback);
};

export const writeCache = (key, value) => {
  if (!isBrowser()) return value;

  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
};

export const removeCache = (key) => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(key);
};

export const clearTenantCaches = (tenant = resolveTenantIdentifier()) => {
  if (!isBrowser()) return;

  const scopedTenant = tenant || 'global';
  [
    cacheKeys.authSession(scopedTenant),
    cacheKeys.setupStatus(scopedTenant),
    cacheKeys.tenantFeatures(scopedTenant),
    cacheKeys.tenantConfig(scopedTenant),
  ].forEach(removeCache);

  const dashboardPrefix = buildKey('dashboard_stats', scopedTenant);
  Object.keys(window.localStorage).forEach((key) => {
    if (key.startsWith(dashboardPrefix)) {
      window.localStorage.removeItem(key);
    }
  });
};
