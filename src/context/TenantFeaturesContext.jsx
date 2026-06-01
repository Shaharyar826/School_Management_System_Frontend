import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { DEFAULT_FEATURES, getFeaturesForPlan } from '../config/features';
import { useSetup } from './SetupContext';
import { cacheKeys, readCache, resolveTenantIdentifier, writeCache } from '../utils/appCache';

const TenantFeaturesContext = createContext();

export const TenantFeaturesProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { subscriptionPlan } = useSetup();
  const tenantIdentifier = resolveTenantIdentifier();
  const cachedFeatureState = tenantIdentifier ? readCache(cacheKeys.tenantFeatures(tenantIdentifier), null) : null;
  const cachedFeatures = Array.isArray(cachedFeatureState)
    ? cachedFeatureState
    : Array.isArray(cachedFeatureState?.enabledFeatures)
      ? cachedFeatureState.enabledFeatures
      : null;

  const [enabledFeatures, setEnabledFeatures] = useState(cachedFeatures || DEFAULT_FEATURES);
  const [loading, setLoading] = useState(Boolean(isAuthenticated && user && !cachedFeatures));
  const [error, setError] = useState(null);
  const [hasCachedFeatures, setHasCachedFeatures] = useState(Boolean(cachedFeatures));

  const getTenantIdentifier = useCallback(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('.') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) return parts[0];
      if (parts.length === 2) return hostname;
    } else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost:')) {
      return new URLSearchParams(window.location.search).get('tenant') || localStorage.getItem('tenant') || null;
    }
    return null;
  }, []);

  const fetchTenantFeatures = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setEnabledFeatures(DEFAULT_FEATURES);
      setLoading(false);
      setHasCachedFeatures(false);
      return;
    }

    if (!cachedFeatures) {
      setLoading(true);
    }

    try {
      setError(null);
      const tenantScope = getTenantIdentifier() || tenantIdentifier || 'global';
      const headers = {};
      if (tenantScope && tenantScope !== 'www') {
        headers['X-Tenant'] = tenantScope;
      }

      const response = await axios.get('/api/school-settings', { headers });
      const apiFeatures = response.data.data?.features;

      if (apiFeatures && Array.isArray(apiFeatures) && apiFeatures.length > 0) {
        // API has explicit feature list — use it as the primary source
        writeCache(cacheKeys.tenantFeatures(tenantScope), {
          enabledFeatures: apiFeatures,
          source: 'api',
          updatedAt: Date.now(),
        });
        setEnabledFeatures(apiFeatures);
        setHasCachedFeatures(true);
      } else {
        // No explicit feature list — derive from subscription plan
        const planFeatures = getFeaturesForPlan(subscriptionPlan || 'basic');
        setEnabledFeatures(planFeatures);
        writeCache(cacheKeys.tenantFeatures(tenantScope), {
          enabledFeatures: planFeatures,
          source: 'plan',
          updatedAt: Date.now(),
        });
        setHasCachedFeatures(true);
      }
    } catch (err) {
      console.error('Failed to fetch tenant features:', err);
      setError(err.message);

      // Fallback priority: cache → plan-derived → defaults
      if (cachedFeatures) {
        setEnabledFeatures(cachedFeatures);
      } else {
        setEnabledFeatures(getFeaturesForPlan(subscriptionPlan || 'basic'));
      }
    } finally {
      setLoading(false);
    }
  }, [cachedFeatures, isAuthenticated, user, subscriptionPlan, tenantIdentifier, getTenantIdentifier]);

  useEffect(() => {
    // Only fetch if we haven't already cached the features
    if (isAuthenticated && user && !cachedFeatures) {
      fetchTenantFeatures();
    } else if (!isAuthenticated || !user) {
      // Reset to defaults for non-authenticated users
      setEnabledFeatures(DEFAULT_FEATURES);
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchTenantFeatures, cachedFeatures]);

  const hasFeature = useCallback((feature) => enabledFeatures.includes(feature), [enabledFeatures]);

  const refreshFeatures = useCallback(() => {
    setLoading(true);
    fetchTenantFeatures();
  }, [fetchTenantFeatures]);

  return (
    <TenantFeaturesContext.Provider value={{ enabledFeatures, hasFeature, loading, error, refreshFeatures, hasCachedFeatures }}>
      {children}
    </TenantFeaturesContext.Provider>
  );
};

export default TenantFeaturesContext;