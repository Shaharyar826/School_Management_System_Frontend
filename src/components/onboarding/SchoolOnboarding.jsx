import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SchoolOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('school_setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [schoolData, setSchoolData] = useState({
    schoolDetails: { name: '', address: '', phone: '' },
    preferences: { timezone: 'UTC', currency: 'USD' }
  });

  const [featureData, setFeatureData] = useState({
    selectedFeatures: ['students', 'teachers'],
    selectedPlan: 'starter'
  });

  const [pricing, setPricing] = useState({ total: 0, breakdown: [] });

  const availableFeatures = [
    { id: 'students', name: 'Student Management', price: 20, required: true },
    { id: 'teachers', name: 'Teacher Management', price: 15, required: true },
    { id: 'attendance', name: 'Attendance Tracking', price: 25 },
    { id: 'fees', name: 'Fee Management', price: 30 },
    { id: 'events', name: 'Events & Notices', price: 10 },
    { id: 'reports', name: 'Reports & Analytics', price: 35 },
    { id: 'integrations', name: 'Third-party Integrations', price: 40 }
  ];

  const plans = {
    starter: { name: 'Starter', discount: 0 },
    professional: { name: 'Professional', discount: 0.1 },
    enterprise: { name: 'Enterprise', discount: 0.2 }
  };

  useEffect(() => {
    calculatePricing();
  }, [featureData.selectedFeatures, featureData.selectedPlan]);

  const calculatePricing = () => {
    const selectedFeatureData = availableFeatures.filter(f => 
      featureData.selectedFeatures.includes(f.id)
    );
    const baseTotal = selectedFeatureData.reduce((sum, f) => sum + f.price, 0);
    const discount = plans[featureData.selectedPlan].discount;
    const total = Math.round(baseTotal * (1 - discount));
    
    setPricing({
      total,
      breakdown: selectedFeatureData.map(f => ({
        name: f.name,
        price: Math.round(f.price * (1 - discount))
      })),
      discount: Math.round(baseTotal * discount)
    });
  };

  const handleSchoolSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/onboarding/complete-school-setup', schoolData);
      if (res.data.success) {
        setCurrentStep('feature_selection');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'School setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureSelection = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/onboarding/select-features', featureData);
      if (res.data.success) {
        setCurrentStep('payment_setup');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Feature selection failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/onboarding/create-checkout-session');
      if (res.data.success) {
        window.location.href = res.data.data.checkoutUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment setup failed');
      setLoading(false);
    }
  };

  const toggleFeature = (featureId) => {
    const feature = availableFeatures.find(f => f.id === featureId);
    if (feature?.required) return;

    setFeatureData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter(id => id !== featureId)
        : [...prev.selectedFeatures, featureId]
    }));
  };

  const renderSchoolSetup = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">School Setup</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="School Name"
          className="w-full p-3 border rounded-lg"
          value={schoolData.schoolDetails.name}
          onChange={(e) => setSchoolData(prev => ({
            ...prev,
            schoolDetails: { ...prev.schoolDetails, name: e.target.value }
          }))}
        />
        
        <select
          className="w-full p-3 border rounded-lg"
          value={schoolData.preferences.timezone}
          onChange={(e) => setSchoolData(prev => ({
            ...prev,
            preferences: { ...prev.preferences, timezone: e.target.value }
          }))}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>

      <button
        onClick={handleSchoolSetup}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );

  const renderFeatureSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Select Features</h2>
      
      <div className="space-y-3">
        {availableFeatures.map(feature => (
          <div
            key={feature.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              featureData.selectedFeatures.includes(feature.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            } ${feature.required ? 'opacity-75' : ''}`}
            onClick={() => toggleFeature(feature.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{feature.name}</h3>
                {feature.required && <span className="text-xs text-blue-600">Required</span>}
              </div>
              <span className="font-semibold">${feature.price}/mo</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Select Plan</h3>
        {Object.entries(plans).map(([key, plan]) => (
          <label key={key} className="flex items-center space-x-3">
            <input
              type="radio"
              name="plan"
              value={key}
              checked={featureData.selectedPlan === key}
              onChange={(e) => setFeatureData(prev => ({
                ...prev,
                selectedPlan: e.target.value
              }))}
            />
            <span>{plan.name} {plan.discount > 0 && `(${plan.discount * 100}% off)`}</span>
          </label>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Pricing Summary</h3>
        {pricing.breakdown.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span>${item.price}/mo</span>
          </div>
        ))}
        {pricing.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-${pricing.discount}/mo</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Total</span>
          <span>${pricing.total}/mo</span>
        </div>
      </div>

      <button
        onClick={handleFeatureSelection}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </div>
  );

  const renderPaymentSetup = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment Setup</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900">Your Selected Plan</h3>
        <p className="text-blue-700">
          {plans[featureData.selectedPlan].name} - ${pricing.total}/month
        </p>
        <p className="text-sm text-blue-600 mt-2">
          14-day free trial • Cancel anytime
        </p>
      </div>

      <button
        onClick={handlePaymentSetup}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Start Free Trial'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 'school_setup' && renderSchoolSetup()}
          {currentStep === 'feature_selection' && renderFeatureSelection()}
          {currentStep === 'payment_setup' && renderPaymentSetup()}
        </div>
      </div>
    </div>
  );
};

export default SchoolOnboarding;