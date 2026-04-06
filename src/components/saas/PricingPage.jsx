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

  useEffect(() => { fetchPricingData(); }, []);

  const fetchPricingData = async () => {
    try {
      const response = await axios.get('/api/billing/pricing');
      setPricingData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
    }
  };

  useEffect(() => {
    if (pricingData) fetchOnboardingStatus();
  }, [pricingData]);

  const fetchOnboardingStatus = async () => {
    setLoading(true);
    try {
      const tenantIdentifier = window.location.hostname.split('.')[0] || 'cbhstj';
      const headers = { 'X-Tenant': tenantIdentifier };
      const response = await axios.get('/api/onboarding/status', { headers });
      if (response.data.success) {
        let enabledFeatures = response.data.data.tenant.settings?.features?.enabled || [];
        enabledFeatures = enabledFeatures.map(f => f.toLowerCase());
        setSelectedFeatures(enabledFeatures);
        calculatePricing(enabledFeatures);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding status:', err);
      const urlParams = new URLSearchParams(window.location.search);
      const featuresParam = urlParams.get('features');
      if (featuresParam) {
        let features = featuresParam.split(',').map(f => f.toLowerCase());
        setSelectedFeatures(features);
        calculatePricing(features);
      } else {
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
    if (!pricingData || features.length === 0) { setPricing({ total: 0, breakdown: [] }); return; }
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStudentCount = parseInt(urlParams.get('students')) || studentCount;
      setStudentCount(urlStudentCount);
      const response = await axios.post('/api/billing/estimate', {
        studentCount: urlStudentCount,
        features: features.map(f => f.toUpperCase())
      });
      const estimate = response.data.data;
      setPricing({ total: estimate.finalCost, breakdown: estimate.breakdown });
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
      setPricing({ total: 0, breakdown: [] });
    }
  };

  const handleStartTrial = async () => {
    if (selectedFeatures.length === 0) { setError('Please select at least one feature to start your trial'); return; }
    setCheckoutLoading(true);
    setError('');
    try {
      const tenantIdentifier = window.location.hostname.split('.')[0] || 'cbhstj';
      const headers = { 'X-Tenant': tenantIdentifier };
      await axios.post('/api/onboarding/select-features', {
        selectedFeatures: selectedFeatures.map(f => f.toUpperCase()),
        selectedPlan: 'starter', studentCount
      }, { headers });
      const response = await axios.post('/api/onboarding/create-checkout-session', {}, { headers });
      if (response.data.success && response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else setError('Failed to create checkout session');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start trial');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (selectedFeatures.length === 0) { setError('Please select at least one feature to proceed'); return; }
    setCheckoutLoading(true);
    setError('');
    try {
      const tenantIdentifier = window.location.hostname.split('.')[0] || 'cbhstj';
      const headers = { 'X-Tenant': tenantIdentifier };
      await axios.post('/api/onboarding/select-features', {
        selectedFeatures: selectedFeatures.map(f => f.toUpperCase()),
        selectedPlan: 'starter', studentCount
      }, { headers });
      const response = await axios.post('/api/onboarding/create-checkout-session', {}, { headers });
      if (response.data.success && response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else setError('Failed to create checkout session');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment setup failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading your plan…</p>
        </div>
      </div>
    );
  }

  const benefits = [
    { title: 'Complete School Management', desc: 'All selected features fully integrated' },
    { title: 'Cloud-Based Access', desc: 'Access from anywhere, anytime' },
    { title: 'Regular Updates', desc: 'New features added monthly' },
    { title: 'Priority Support', desc: '24/7 help when you need it' },
  ];

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
            style={{ background: 'var(--brand-50)', color: 'var(--brand)', border: '1px solid var(--brand-200)' }}
          >
            💳 Your Custom Plan
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Your School Management Plan
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Based on the features you selected for your institution
          </p>
        </div>

        {error && (
          <div className="alert alert-info mb-8">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* ── Selected Features (left 2 cols) ── */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="px-6 py-5" style={{ background: 'var(--brand-50)', borderBottom: '1px solid var(--border-default)' }}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Selected Features</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Your customized school management solution</p>
              </div>
              <div className="p-6">
                {selectedFeatures.length > 0 ? (
                  <div className="space-y-2">
                    {pricing.breakdown.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 px-4 rounded-xl"
                        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: '#10B981', flexShrink: 0 }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          ${item.totalCost?.toFixed(2) || item.price}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No features selected</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Please go back and select features for your school.</p>
                    <button
                      onClick={() => navigate('/setup?step=features')}
                      className="btn btn-primary btn-sm"
                    >
                      Select Features →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Pricing Summary (right col) ── */}
          <div className="flex flex-col gap-4">
            {/* Total card */}
            <div className="card-brand rounded-2xl p-6 text-white">
              <p className="text-white/80 text-sm font-medium mb-2">Total Monthly Cost</p>
              <p className="text-4xl font-bold mb-1">${pricing.total?.toFixed(2) || '0.00'}</p>
              <p className="text-white/70 text-xs">/month · billed monthly</p>
              <div className="mt-6 space-y-2 text-sm text-white/90">
                {['14-day free trial', 'Cancel anytime', 'No setup fees', '24/7 support'].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <span>✓</span><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Students */}
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Students</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{studentCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>enrolled learners</p>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <button
              onClick={handleStartTrial}
              disabled={checkoutLoading || selectedFeatures.length === 0}
              className="btn btn-success btn-lg flex-1"
            >
              {checkoutLoading
                ? <span className="flex items-center gap-2 justify-center"><span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />Starting…</span>
                : '🚀 Start 14-Day Free Trial'}
            </button>
            <button
              onClick={handlePayNow}
              disabled={checkoutLoading || selectedFeatures.length === 0}
              className="btn btn-primary btn-lg flex-1"
            >
              {checkoutLoading
                ? <span className="flex items-center gap-2 justify-center"><span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />Processing…</span>
                : '💳 Pay Now & Start Immediately'}
            </button>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            🔒 Secure payment powered by Stripe · Your data is protected with bank-level encryption
          </p>
        </div>

        {/* ── Benefits Grid ── */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>What You Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#ECFDF5' }}
                >
                  <svg className="w-4 h-4" style={{ color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{b.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;