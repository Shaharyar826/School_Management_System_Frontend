import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const PricingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [pricing, setPricing] = useState({ total: 0, breakdown: [] });
  const [error, setError] = useState('');



  const [pricingData, setPricingData] = useState(null);
  const [studentCount, setStudentCount] = useState(50);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const response = await axios.get('/api/billing/pricing');
      setPricingData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
    }
  };

  useEffect(() => {
    if (pricingData) {
      fetchOnboardingStatus();
    }
  }, [pricingData]);

  const fetchOnboardingStatus = async () => {
    setLoading(true);
    try {
      const tenantIdentifier = window.location.hostname.split('.')[0] || 'cbhstj';
      const headers = { 'X-Tenant': tenantIdentifier };
      
      const response = await axios.get('/api/onboarding/status', { headers });
      
      if (response.data.success) {
        let enabledFeatures = response.data.data.tenant.settings?.features?.enabled || [];
        // Convert uppercase feature names to lowercase for pricing compatibility
        enabledFeatures = enabledFeatures.map(feature => feature.toLowerCase());
        setSelectedFeatures(enabledFeatures);
        calculatePricing(enabledFeatures);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding status:', err);
      // If status fails, try to get features from URL params or use defaults
      const urlParams = new URLSearchParams(window.location.search);
      const featuresParam = urlParams.get('features');
      if (featuresParam) {
        let features = featuresParam.split(',');
        // Convert to lowercase
        features = features.map(feature => feature.toLowerCase());
        setSelectedFeatures(features);
        calculatePricing(features);
      } else {
        // Use default features if nothing is available
        const defaultFeatures = ['students', 'teachers', 'attendance', 'fees'];
        setSelectedFeatures(defaultFeatures);
        calculatePricing(defaultFeatures);
      }
      setError('Using default pricing. Please complete feature selection if needed.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = async (features) => {
    if (!pricingData || features.length === 0) {
      setPricing({ total: 0, breakdown: [] });
      return;
    }

    try {
      // Get student count from URL params or use default
      const urlParams = new URLSearchParams(window.location.search);
      const urlStudentCount = parseInt(urlParams.get('students')) || studentCount;
      setStudentCount(urlStudentCount);

      // Use the same pricing calculation as setup page
      const response = await axios.post('/api/billing/estimate', {
        studentCount: urlStudentCount,
        features: features.map(f => f.toUpperCase()) // Convert back to uppercase for API
      });
      
      const estimate = response.data.data;
      setPricing({
        total: estimate.finalCost,
        breakdown: estimate.breakdown
      });
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
      // Fallback to zero pricing
      setPricing({ total: 0, breakdown: [] });
    }
  };

  const handleStartTrial = async () => {
    if (selectedFeatures.length === 0) {
      setError('Please select at least one feature to start your trial');
      return;
    }

    setCheckoutLoading(true);
    setError('');
    
    try {
      const tenantIdentifier = window.location.hostname.split('.')[0] || 'cbhstj';
      const headers = { 'X-Tenant': tenantIdentifier };
      
      // First, save the selected features
      await axios.post('/api/onboarding/select-features', {
        selectedFeatures: selectedFeatures.map(f => f.toUpperCase()),
        selectedPlan: 'starter',
        studentCount: studentCount
      }, { headers });
      
      // Then create checkout session
      const response = await axios.post('/api/onboarding/create-checkout-session', {}, { headers });
      
      if (response.data.success && response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Trial start failed:', err);
      setError(err.response?.data?.message || 'Failed to start trial');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (selectedFeatures.length === 0) {
      setError('Please select at least one feature to proceed with payment');
      return;
    }

    setCheckoutLoading(true);
    setError('');
    
    try {
      const tenantIdentifier = window.location.hostname.split('.')[0] || 'cbhstj';
      const headers = { 'X-Tenant': tenantIdentifier };
      
      // First, save the selected features
      await axios.post('/api/onboarding/select-features', {
        selectedFeatures: selectedFeatures.map(f => f.toUpperCase()),
        selectedPlan: 'starter',
        studentCount: studentCount
      }, { headers });
      
      // Then create checkout session
      const response = await axios.post('/api/onboarding/create-checkout-session', {}, { headers });
      
      if (response.data.success && response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.message || 'Payment setup failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your School Management Plan
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Based on the features you selected
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Selected Features
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Your customized school management solution
            </p>
          </div>

          <div className="p-6">
            {/* Selected Features List */}
            <div className="space-y-4 mb-8">
              {selectedFeatures.length > 0 ? (
                pricing.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">${item.totalCost?.toFixed(2) || item.price}/month</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No features selected. Please go back and select features.</p>
                  <button 
                    onClick={() => navigate('/setup?step=features')}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Select Features
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total Monthly Cost</span>
                <span className="text-2xl font-bold text-blue-600">${pricing.total?.toFixed(2) || '0.00'}/month</span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ 14-day free trial included</p>
                <p>✓ Cancel anytime</p>
                <p>✓ No setup fees</p>
                <p>✓ 24/7 support included</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartTrial}
                disabled={checkoutLoading || selectedFeatures.length === 0}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {checkoutLoading ? 'Starting...' : 'Start 14-Day Free Trial'}
              </button>
              
              <button
                onClick={handlePayNow}
                disabled={checkoutLoading || selectedFeatures.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {checkoutLoading ? 'Processing...' : 'Pay Now & Start Immediately'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by Stripe • Your data is protected
            </p>
          </div>
        </div>

        {/* Feature Benefits */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What You Get
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Complete School Management</p>
                <p className="text-sm text-gray-600">All selected features fully integrated</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cloud-Based Access</p>
                <p className="text-sm text-gray-600">Access from anywhere, anytime</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Regular Updates</p>
                <p className="text-sm text-gray-600">New features added monthly</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Priority Support</p>
                <p className="text-sm text-gray-600">Get help when you need it</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;