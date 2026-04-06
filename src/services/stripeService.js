import axios from '../config/axios';

class StripeService {
  async getConfig() {
    try {
      const response = await axios.get('/api/stripe/config');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getPricingPlans() {
    try {
      const response = await axios.get('/api/stripe/plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getSubscriptionStatus() {
    try {
      const response = await axios.get('/api/stripe/subscription');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createCheckoutSession(plan, interval = 'month', successUrl, cancelUrl) {
    try {
      const response = await axios.post('/api/stripe/create-checkout-session', {
        plan, interval, successUrl, cancelUrl,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createPortalSession(returnUrl) {
    try {
      const response = await axios.post('/api/stripe/create-portal-session', { returnUrl });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new StripeService();
