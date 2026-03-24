import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import stripeService from '../services/stripeService';

const StripeContext = createContext();

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const config = await stripeService.getConfig();
        if (config.success && config.publishableKey) {
          const stripe = loadStripe(config.publishableKey);
          setStripePromise(stripe);
        }
      } catch (error) {
        setError('Failed to initialize payment system');
      }
    };

    initializeStripe();
  }, []);

  // Load subscription status and plans
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load pricing plans (public endpoint)
        const plansResponse = await stripeService.getPricingPlans();
        if (plansResponse.success) {
          setPlans(plansResponse.plans);
        }

        // Load subscription status (requires auth)
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const subscriptionResponse = await stripeService.getSubscriptionStatus();
            if (subscriptionResponse.success) {
              setSubscription(subscriptionResponse.subscription);
            }
          }
        } catch {
          // Not authenticated or no subscription — both are valid states
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          setError('Failed to load subscription data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Create checkout session
  const createCheckoutSession = async (plan) => {
    try {
      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl}/subscription/cancel`;

      const response = await stripeService.createCheckoutSession(plan, successUrl, cancelUrl);
      
      if (response.success && response.url) {
        window.location.href = response.url;
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Create billing portal session
  const createPortalSession = async () => {
    try {
      const returnUrl = window.location.origin + '/subscription';
      const response = await stripeService.createPortalSession(returnUrl);
      
      if (response.success && response.url) {
        window.location.href = response.url;
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    try {
      const response = await stripeService.getSubscriptionStatus();
      if (response.success) {
        setSubscription(response.subscription);
      }
    } catch { /* silent — subscription refresh is non-critical */ }
  };

  const value = {
    stripePromise,
    subscription,
    plans,
    loading,
    error,
    createCheckoutSession,
    createPortalSession,
    refreshSubscription,
    // Service methods
    stripeService
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};