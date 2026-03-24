import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { DEFAULT_FEATURES } from '../config/features';

const TenantConfigContext = createContext();

export const TenantConfigProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [config, setConfig] = useState({
    schoolName: 'Loading...',
    subdomain: null,
    features: DEFAULT_FEATURES,
    branding: {
      logo: null,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      theme: 'light'
    },
    status: 'trial',
    loading: true,
    error: null
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
      return new URLSearchParams(window.location.search).get('tenant') || 'cbhstj';
    }
    return null;
  }, []);

  const fetchTenantConfig = useCallback(async () => {
    try {
      setConfig(prev => ({ ...prev, loading: true, error: null }));
      
      const tenantIdentifier = getTenantIdentifier();
      const headers = {};
      if (tenantIdentifier && tenantIdentifier !== 'www') {
        headers['X-Tenant'] = tenantIdentifier;
      }
      
      const response = await axios.get('/api/onboarding/status', { headers });
      
      if (response.data.success) {
        const tenantData = response.data.data.tenant;
        const newConfig = {
          schoolName: tenantData.schoolName || 'School Management System',
          subdomain: tenantData.subdomain,
          features: tenantData.settings?.features?.enabled || DEFAULT_FEATURES,
          branding: {
            logo: tenantData.settings?.branding?.logo || null,
            primaryColor: tenantData.settings?.branding?.primaryColor || '#3B82F6',
            secondaryColor: tenantData.settings?.branding?.secondaryColor || '#1E40AF',
            theme: tenantData.settings?.branding?.theme || 'light'
          },
          status: tenantData.status || 'trial',
          loading: false,
          error: null
        };
        
        // Cache config in localStorage
        localStorage.setItem('tenant_config', JSON.stringify(newConfig));
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Failed to fetch tenant config:', error);
      
      // Try to load from cache
      const cachedConfig = localStorage.getItem('tenant_config');
      if (cachedConfig) {
        try {
          const parsed = JSON.parse(cachedConfig);
          setConfig({ ...parsed, loading: false, error: error.message });
        } catch {
          setConfig(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Failed to load tenant configuration',
            schoolName: 'School Management System'
          }));
        }
      } else {
        setConfig(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message,
          schoolName: 'School Management System'
        }));
      }
    }
  }, [getTenantIdentifier]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTenantConfig();
    } else {
      // Load basic config for non-authenticated users
      const tenantIdentifier = getTenantIdentifier();
      setConfig(prev => ({
        ...prev,
        subdomain: tenantIdentifier,
        loading: false
      }));
    }
  }, [isAuthenticated, user, fetchTenantConfig, getTenantIdentifier]);

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