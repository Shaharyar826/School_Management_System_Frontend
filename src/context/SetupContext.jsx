import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const SetupContext = createContext();

export const SetupProvider = ({ children }) => {
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);

  const [setupComplete, setSetupComplete]     = useState(null);
  const [trialActive, setTrialActive]         = useState(false);
  const [trialDaysLeft, setTrialDaysLeft]     = useState(0);
  const [trialEndsAt, setTrialEndsAt]         = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState('trial');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading]                 = useState(true);
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
          return;
        }
        setSetupComplete(t.onboarding?.onboardingComplete || false);
        setTrialActive(t.billing?.isTrialActive || false);
        setTrialDaysLeft(t.billing?.trialDaysLeft || 0);
        setTrialEndsAt(t.billing?.trialEndsAt || null);
        setSubscriptionPlan(t.billing?.plan || 'trial');
        setHasActiveSubscription(t.billing?.hasActiveSubscription || false);
      }
    } catch (err) {
      setError(err.message);
      // On error, don't block the user — fail open
      setSetupComplete(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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
