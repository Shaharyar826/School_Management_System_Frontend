import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { DEFAULT_FEATURES } from '../config/features';
import { cacheKeys, readCache, resolveTenantIdentifier, writeCache } from '../utils/appCache';

const TenantConfigContext = createContext();

export const TenantConfigProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const tenantIdentifier = resolveTenantIdentifier();
  const [config, setConfig] = useState(() => {
    const cached = tenantIdentifier ? readCache(cacheKeys.tenantConfig(tenantIdentifier), null) : null;
    return {
      schoolName: cached?.schoolName || 'Loading...',
      subdomain: cached?.subdomain || null,
      features: cached?.features || DEFAULT_FEATURES,
      branding: cached?.branding || {
        logo: null,
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        theme: 'light'
      },
      status: cached?.status || 'trial',
      loading: !cached,
      error: null
    };
  });

  const getTenantIdentifier = useCallback(() => {
    const hostname = window.location.hostname;
    
    if (hostname.includes('.') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        return parts[0]; // subdomain
      } else if (parts.length === 2) {
        return hostname; // custom domain
      }
    } else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost:') || hostname.startsWith('127.0.0.1:')) {
      return new URLSearchParams(window.location.search).get('tenant') || localStorage.getItem('tenant') || 'cbhstj';
    }
    return null;
  }, []);

  const fetchTenantConfig = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const cachedConfig = tenantIdentifier ? readCache(cacheKeys.tenantConfig(tenantIdentifier), null) : null;
      setConfig(prev => ({ ...prev, loading: !cachedConfig, error: null }));
      
      const tenantIdent = getTenantIdentifier();
      const headers = {};
      if (tenantIdent && tenantIdent !== 'www') {
        headers['X-Tenant'] = tenantIdent;
      }
      
      const response = await axios.get('/api/school-settings', { headers });
      
      if (response.data.success) {
        const tenantData = response.data.data || {};
        const tenant = localStorage.getItem('tenant');
        const newConfig = {
          schoolName: tenantData.schoolName || 'School Management System',
          subdomain: tenant || tenantData.subdomain,
          features: DEFAULT_FEATURES,
          branding: {
            logo: tenantData.logo || null,
            primaryColor: tenantData.primaryColor || '#3B82F6',
            secondaryColor: '#1E40AF',
            theme: 'light'
          },
          status: 'active',
          loading: false,
          error: null
        };
        writeCache(cacheKeys.tenantConfig(tenant || tenantIdent || 'global'), newConfig);
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Failed to fetch tenant config:', error);
      const cachedConfig = tenantIdentifier ? readCache(cacheKeys.tenantConfig(tenantIdentifier), null) : null;
      if (cachedConfig) {
        setConfig({ ...cachedConfig, loading: false, error: error.message });
      } else {
        setConfig(prev => ({ ...prev, loading: false, error: error.message, schoolName: 'School Management System' }));
      }
    }
  }, [getTenantIdentifier, isAuthenticated, tenantIdentifier, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTenantConfig();
    } else {
      // Load basic config for non-authenticated users
      const tenantIdent = getTenantIdentifier();
      setConfig(prev => ({
        ...prev,
        subdomain: tenantIdent,
        loading: false
      }));
    }
  }, [isAuthenticated, user, getTenantIdentifier, fetchTenantConfig]);

  const hasFeature = useCallback((feature) => {
    return config.features.includes(feature);
  }, [config.features]);

  const refreshConfig = useCallback(() => {
    fetchTenantConfig();
  }, [fetchTenantConfig]);

  const value = {
    ...config,
    hasFeature,
    refreshConfig
  };

  return (
    <TenantConfigContext.Provider value={value}>
      {children}
    </TenantConfigContext.Provider>
  );
};

export default TenantConfigContext;