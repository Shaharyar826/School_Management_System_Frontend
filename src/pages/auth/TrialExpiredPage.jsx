import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { useSetup } from '../../context/SetupContext';
import AuthContext from '../../context/AuthContext';

const GRAD   = 'linear-gradient(135deg, #E91E8C, #FF6B35)';
const SAFEPAY_GRAD = 'linear-gradient(135deg, #0EA5E9, #0284C7)';
const PINK   = '#E91E8C';
const DARK   = '#111827';
const MID    = '#6B7280';
const BORDER = '#E5E7EB';

// ── Fetch active gateway (no auth needed for public config endpoint) ───────────
const useActiveGateway = () => {
  const [gateway, setGateway] = useState('manual');
  useEffect(() => {
    axios.get('/api/safepay/gateway/public')
      .then(r => setGateway(r.data.data?.activeGateway || 'manual'))
      .catch(() => setGateway('manual'));
  }, []);
  return gateway;
};

const TrialExpiredPage = () => {
  const navigate   = useNavigate();
  const { logout } = useContext(AuthContext);
  const { subscriptionPlan, trialEndsAt, refresh } = useSetup();
  const gateway = useActiveGateway();

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [verifying, setVerifying] = useState(false);

  // Handle return from SafePay redirect
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const spStatus = params.get('safepay');
    const invoice  = params.get('invoice');
    if (spStatus === 'success' && invoice) {
      setVerifying(true);
      axios.get(`/api/safepay/verify?invoiceId=${invoice}&token=${params.get('token') || ''}`)
        .then(() => {
          window.history.replaceState({}, '', window.location.pathname);
          refresh?.();
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          setError('Payment could not be verified automatically. Please contact support.');
          setVerifying(false);
        });
    }
  }, []);

  // ── SafePay: redirect to hosted checkout ──────────────────────────────────
  const handleSafePayCheckout = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/safepay/checkout', {
        plan: subscriptionPlan || 'basic',
        studentCount: 50,
      });
      if (data.redirectUrl) window.location.href = data.redirectUrl;
    } catch (e) {
      setError(e.response?.data?.message || 'Could not initiate payment. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Manual: redirect to tenant billing page ───────────────────────────────
  const handleManualContact = () => navigate('/tenant-admin/billing');

  const formattedDate = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E91E8C', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: MID, fontWeight: 600 }}>Verifying your payment…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fef3f2 50%, #f9fafb 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(233,30,140,0.12), rgba(255,107,53,0.10))',
          border: '1.5px solid rgba(233,30,140,0.2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24"
            stroke="url(#g1)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E91E8C" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
            </defs>
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 24,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          padding: '2.5rem 2rem', marginBottom: '1.5rem',
        }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: DARK, margin: '0 0 0.75rem' }}>
            Your free trial has ended
          </h1>

          {formattedDate && (
            <p style={{ color: MID, fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>
              Your 14-day trial expired on <strong style={{ color: DARK }}>{formattedDate}</strong>
            </p>
          )}

          <p style={{ color: MID, fontSize: '0.9375rem', margin: '0 0 1.75rem' }}>
            To continue using the <strong style={{ color: DARK, textTransform: 'capitalize' }}>{subscriptionPlan || 'selected'}</strong> plan,
            complete your subscription payment below.
          </p>

          {/* Benefits */}
          <div style={{ background: 'linear-gradient(135deg, rgba(233,30,140,0.06), rgba(255,107,53,0.04))', border: '1px solid rgba(233,30,140,0.15)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.75rem', textAlign: 'left' }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: DARK, margin: '0 0 0.75rem' }}>After payment:</p>
            {['Your plan restores immediately', 'All your school data stays intact', 'Access continues for 30 days', 'Cancel anytime'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={PINK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ color: '#374151', fontSize: '0.875rem' }}>{item}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.75rem 1rem', color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'left' }}>
              {error}
            </div>
          )}

          {/* Gateway-specific CTA */}
          {gateway === 'safepay' && (
            <button
              onClick={handleSafePayCheckout}
              disabled={loading}
              style={{
                width: '100%', padding: '1rem', borderRadius: 9999, border: 'none',
                background: loading ? '#E5E7EB' : SAFEPAY_GRAD,
                color: loading ? '#9CA3AF' : '#fff',
                fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(14,165,233,0.35)',
                marginBottom: '0.875rem', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Redirecting to SafePay…' : '🇵🇰 Pay Now via SafePay (PKR)'}
            </button>
          )}

          {gateway === 'stripe' && (
            <button
              onClick={async () => {
                setLoading(true); setError('');
                try {
                  const { data } = await axios.post('/api/stripe/create-portal-session', { returnUrl: window.location.href });
                  if (data.url) window.location.href = data.url;
                } catch (e) {
                  setError(e.response?.data?.message || 'Could not open billing portal.');
                } finally { setLoading(false); }
              }}
              disabled={loading}
              style={{
                width: '100%', padding: '1rem', borderRadius: 9999, border: 'none',
                background: loading ? '#E5E7EB' : GRAD,
                color: loading ? '#9CA3AF' : '#fff',
                fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(233,30,140,0.35)',
                marginBottom: '0.875rem', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Opening billing portal…' : '💳 Add Payment Method →'}
            </button>
          )}

          {gateway === 'manual' && (
            <div style={{ background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.25rem', marginBottom: '0.875rem', textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: DARK, margin: '0 0 0.5rem', fontSize: '0.9375rem' }}>🔒 Manual Billing Active</p>
              <p style={{ color: MID, fontSize: '0.875rem', margin: '0 0 1rem' }}>
                Please contact your administrator to activate your subscription. Once payment is confirmed, your account will be restored.
              </p>
              <button onClick={handleManualContact} style={{ padding: '0.625rem 1.5rem', borderRadius: 9999, border: 'none', background: GRAD, color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Go to Billing Page →
              </button>
            </div>
          )}

          <button
            onClick={async () => { await logout(); navigate('/login', { replace: true }); }}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 9999, border: `1.5px solid ${BORDER}`, background: 'transparent', color: MID, fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sign out
          </button>
        </div>

        <p style={{ color: MID, fontSize: '0.8125rem' }}>
          Questions?{' '}
          <a href="mailto:support@learnify.school" style={{ color: PINK, fontWeight: 600, textDecoration: 'none' }}>
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default TrialExpiredPage;
