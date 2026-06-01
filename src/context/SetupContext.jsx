import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { cacheKeys, readCache, resolveTenantIdentifier, writeCache } from '../utils/appCache';

const SetupContext = createContext();

export const SetupProvider = ({ children }) => {
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);
  const tenantIdentifier = resolveTenantIdentifier();
  const cachedSetup = tenantIdentifier ? readCache(cacheKeys.setupStatus(tenantIdentifier), null) : null;

  const [setupComplete, setSetupComplete]     = useState(cachedSetup?.setupComplete ?? null);
  const [trialActive, setTrialActive]         = useState(cachedSetup?.trialActive ?? false);
  const [trialDaysLeft, setTrialDaysLeft]     = useState(cachedSetup?.trialDaysLeft ?? 0);
  const [trialEndsAt, setTrialEndsAt]         = useState(cachedSetup?.trialEndsAt ?? null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(cachedSetup?.subscriptionPlan ?? 'trial');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(cachedSetup?.hasActiveSubscription ?? false);
  const [loading, setLoading]                 = useState(!cachedSetup);
  const [error, setError]                     = useState(null);

  const getTenantHeader = () => {
    const queryTenant = new URLSearchParams(window.location.search).get('tenant');
    const sessionTenant = user?.tenant?.subdomain;
    const storedTenant = localStorage.getItem('tenant');

    if (queryTenant) return queryTenant;
    if (sessionTenant) return sessionTenant;
    if (storedTenant) return storedTenant;

    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && !hostname.startsWith('127.')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) return parts[0];
    }

    return null;
  };

  const fetchStatus = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      setSetupComplete(false);
      setTrialActive(false);
      setTrialDaysLeft(0);
      setTrialEndsAt(null);
      setSubscriptionPlan('trial');
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tenant = getTenantHeader();
      const headers = {};
      if (tenant) {
        headers['X-Tenant'] = tenant;
      }
      const res = await axios.get(`/api/onboarding/status?t=${Date.now()}`, {
        headers,
      });

      if (res.data.success) {
        const t = res.data.data?.tenant;
        if (!t) {
          // No tenant yet — registration in progress
          setSetupComplete(false);
          if (!cachedSetup) setLoading(false);
          return;
        }
        const nextSetup = {
          setupComplete: t.onboarding?.onboardingComplete || false,
          trialActive: t.billing?.isTrialActive || false,
          trialDaysLeft: t.billing?.trialDaysLeft || 0,
          trialEndsAt: t.billing?.trialEndsAt || null,
          subscriptionPlan: t.billing?.plan || 'trial',
          hasActiveSubscription: t.billing?.hasActiveSubscription || false,
          updatedAt: Date.now(),
        };

        setSetupComplete(nextSetup.setupComplete);
        setTrialActive(nextSetup.trialActive);
        setTrialDaysLeft(nextSetup.trialDaysLeft);
        setTrialEndsAt(nextSetup.trialEndsAt);
        setSubscriptionPlan(nextSetup.subscriptionPlan);
        setHasActiveSubscription(nextSetup.hasActiveSubscription);
        writeCache(cacheKeys.setupStatus(tenant || tenantIdentifier || 'global'), nextSetup);
      }
    } catch (err) {
      setError(err.message);
      // Fail closed to avoid bypassing setup/billing guards on transient errors.
      if (!cachedSetup) {
        setSetupComplete(false);
        setTrialActive(false);
        setTrialDaysLeft(0);
        setTrialEndsAt(null);
        setSubscriptionPlan('trial');
        setHasActiveSubscription(false);
      }
    } finally {
      if (!cachedSetup) setLoading(false);
    }
  }, [cachedSetup, isAuthenticated, tenantIdentifier, user]);

  useEffect(() => {
    if (authLoading) return;
    fetchStatus();
  }, [authLoading, fetchStatus]);

  const value = {
    setupComplete,
    trialActive,
    trialDaysLeft,
    trialEndsAt,
    subscriptionPlan,
    hasActiveSubscription,
    loading,
    error,
    refresh: fetchStatus,
  };

  return (
    <SetupContext.Provider value={value}>
      {children}
    </SetupContext.Provider>
  );
};

export const useSetup = () => useContext(SetupContext);

export default SetupContext;
