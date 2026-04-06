import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { DEFAULT_FEATURES, getFeaturesForPlan } from '../config/features';
import { useSetup } from './SetupContext';

const TenantFeaturesContext = createContext();

export const TenantFeaturesProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { subscriptionPlan } = useSetup();
  const [enabledFeatures, setEnabledFeatures] = useState(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTenantIdentifier = useCallback(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('.') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) return parts[0];
      if (parts.length === 2) return hostname;
    } else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost:')) {
      return new URLSearchParams(window.location.search).get('tenant') || localStorage.getItem('tenant') || 'cbhstj';
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

      const response = await axios.get('/api/school-settings', { headers });
      const apiFeatures = response.data.data?.features;

      if (apiFeatures && Array.isArray(apiFeatures) && apiFeatures.length > 0) {
        // API has explicit feature list — use it as the primary source
        localStorage.setItem('tenant_features', JSON.stringify(apiFeatures));
        setEnabledFeatures(apiFeatures);
      } else {
        // No explicit feature list — derive from subscription plan
        const planFeatures = getFeaturesForPlan(subscriptionPlan || 'basic');
        setEnabledFeatures(planFeatures);
      }
    } catch (err) {
      console.error('Failed to fetch tenant features:', err);
      setError(err.message);

      // Fallback priority: cache → plan-derived → defaults
      const cached = localStorage.getItem('tenant_features');
      if (cached) {
        try {
          setEnabledFeatures(JSON.parse(cached));
        } catch {
          setEnabledFeatures(getFeaturesForPlan(subscriptionPlan || 'basic'));
        }
      } else {
        setEnabledFeatures(getFeaturesForPlan(subscriptionPlan || 'basic'));
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getTenantIdentifier, subscriptionPlan]);

  useEffect(() => {
    fetchTenantFeatures();
  }, [fetchTenantFeatures]);

  const hasFeature = useCallback((feature) => enabledFeatures.includes(feature), [enabledFeatures]);

  const refreshFeatures = useCallback(() => {
    setLoading(true);
    fetchTenantFeatures();
  }, [fetchTenantFeatures]);

  return (
    <TenantFeaturesContext.Provider value={{ enabledFeatures, hasFeature, loading, error, refreshFeatures }}>
      {children}
    </TenantFeaturesContext.Provider>
  );
};

export default TenantFeaturesContext;