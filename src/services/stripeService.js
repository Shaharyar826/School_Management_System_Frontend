import axios from '../config/axios';

class StripeService {
  // Get Stripe configuration
  async getConfig() {
    try {
      const response = await axios.get('/api/stripe/config');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create checkout session
  async createCheckoutSession(plan, successUrl, cancelUrl) {
    try {
      const response = await axios.post('/api/stripe/create-checkout-session', {
        plan,
        successUrl,
        cancelUrl
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create billing portal session
  async createPortalSession(returnUrl) {
    try {
      const response = await axios.post('/api/stripe/create-portal-session', {
        returnUrl
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get subscription status
  async getSubscriptionStatus() {
    try {
      const response = await axios.get('/api/subscription/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get pricing plans
  async getPricingPlans() {
    try {
      const response = await axios.get('/api/subscription/plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create subscription
  async createSubscription(plan) {
    try {
      const response = await axios.post('/api/subscription/create', { plan });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Upgrade subscription
  async upgradeSubscription(plan) {
    try {
      const response = await axios.post('/api/subscription/upgrade', { plan });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await axios.post('/api/subscription/cancel');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create payment intent
  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const response = await axios.post('/api/subscription/payment-intent', {
        amount,
        currency
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new StripeService();