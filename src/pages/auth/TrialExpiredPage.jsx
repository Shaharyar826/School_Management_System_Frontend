import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSetup } from '../../context/SetupContext';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const GRAD   = 'linear-gradient(135deg, #E91E8C, #FF6B35)';
const PINK   = '#E91E8C';
const DARK   = '#111827';
const MID    = '#6B7280';
const BORDER = '#E5E7EB';

const TrialExpiredPage = () => {
  const navigate   = useNavigate();
  const { logout } = useContext(AuthContext);
  const { subscriptionPlan, trialEndsAt, refresh } = useSetup();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleAddPaymentMethod = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/stripe/create-portal-session', {
        returnUrl: `${window.location.origin}/billing`,
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setError('Could not connect to billing portal. Please contact support.');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const formattedDate = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

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
            stroke="url(#grad)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
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
          padding: '2.5rem 2rem',
          marginBottom: '1.5rem',
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: DARK, margin: '0 0 0.75rem' }}>
            Your free trial has ended
          </h1>

          {formattedDate && (
            <p style={{ color: MID, fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>
              Your 14-day trial expired on <strong style={{ color: DARK }}>{formattedDate}</strong>
            </p>
          )}

          <p style={{ color: MID, fontSize: '0.9375rem', margin: '0 0 2rem' }}>
            To continue using your <strong style={{ color: DARK, textTransform: 'capitalize' }}>{subscriptionPlan || 'selected'}</strong> plan,
            please add a payment method. No charges until you confirm.
          </p>

          {/* What you get */}
          <div style={{ background: 'linear-gradient(135deg, rgba(233,30,140,0.06), rgba(255,107,53,0.04))', border: '1px solid rgba(233,30,140,0.15)', borderRadius: 14, padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: DARK, margin: '0 0 0.875rem' }}>
              When you add a payment method:
            </p>
            {[
              'Your plan restores immediately',
              'All your data stays intact',
              'First charge is processed today',
              'Cancel anytime from the billing portal',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                  stroke={PINK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ color: '#374151', fontSize: '0.875rem' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
              padding: '0.75rem 1rem', color: '#EF4444', fontSize: '0.875rem',
              marginBottom: '1rem', textAlign: 'left',
            }}>
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAddPaymentMethod}
            disabled={loading}
            style={{
              width: '100%', padding: '1rem', borderRadius: 9999, border: 'none',
              background: loading ? '#E5E7EB' : GRAD,
              color: loading ? '#9CA3AF' : '#fff',
              fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(233,30,140,0.35)',
              transition: 'all 0.2s', fontFamily: 'inherit', marginBottom: '0.875rem',
            }}
          >
            {loading ? 'Opening billing portal…' : 'Add Payment Method →'}
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: 9999,
              border: `1.5px solid ${BORDER}`, background: 'transparent',
              color: MID, fontWeight: 600, fontSize: '0.9375rem',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.color = DARK; }}
            onMouseLeave={e => { e.target.style.borderColor = BORDER; e.target.style.color = MID; }}
          >
            Sign out
          </button>
        </div>

        <p style={{ color: MID, fontSize: '0.8125rem' }}>
          Questions?{' '}
          <a href="mailto:support@learnify.school" style={{ color: PINK, fontWeight: 600, textDecoration: 'none' }}>
            Contact our support team
          </a>
        </p>

      </div>
    </div>
  );
};

export default TrialExpiredPage;
