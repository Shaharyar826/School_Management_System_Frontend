import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { DEFAULT_FEATURES } from '../config/features';

const TenantFeaturesContext = createContext();

export const TenantFeaturesProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [enabledFeatures, setEnabledFeatures] = useState(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchTenantFeatures = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setEnabledFeatures(DEFAULT_FEATURES);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const tenantIdentifier = getTenantIdentifier();
      
      const headers = {};
      if (tenantIdentifier && tenantIdentifier !== 'www') {
        headers['X-Tenant'] = tenantIdentifier;
      }
      
      const response = await axios.get('/api/onboarding/status', { headers });
      const features = response.data.data?.tenant?.settings?.features?.enabled || DEFAULT_FEATURES;
      
      // Cache features in localStorage for offline access
      localStorage.setItem('tenant_features', JSON.stringify(features));
      setEnabledFeatures(features);
    } catch (error) {
      console.error('Failed to fetch tenant features:', error);
      setError(error.message);
      
      // Try to load from cache
      const cachedFeatures = localStorage.getItem('tenant_features');
      if (cachedFeatures) {
        try {
          setEnabledFeatures(JSON.parse(cachedFeatures));
        } catch {
          setEnabledFeatures(DEFAULT_FEATURES);
        }
      } else {
        setEnabledFeatures(DEFAULT_FEATURES);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getTenantIdentifier]);

  useEffect(() => {
    fetchTenantFeatures();
  }, [fetchTenantFeatures]);

  const hasFeature = useCallback((feature) => {
    return enabledFeatures.includes(feature);
  }, [enabledFeatures]);

  const refreshFeatures = useCallback(() => {
    setLoading(true);
    fetchTenantFeatures();
  }, [fetchTenantFeatures]);

  const value = {
    enabledFeatures,
    hasFeature,
    loading,
    error,
    refreshFeatures
  };

  return (
    <TenantFeaturesContext.Provider value={value}>
      {children}
    </TenantFeaturesContext.Provider>
  );
};

export default TenantFeaturesContext;