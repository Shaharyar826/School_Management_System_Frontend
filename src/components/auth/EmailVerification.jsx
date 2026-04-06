import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const GRAD = 'linear-gradient(135deg, #E91E8C, #FF6B35)';

const EmailVerification = () => {
  const { verifyEmail, resendVerification, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    const token = searchParams.get('token');
    const tenant = searchParams.get('tenant');
    if (token) handleVerification(token, tenant);
  }, [searchParams]);

  const handleVerification = async (token, tenantIdentifier) => {
    try {
      const result = await verifyEmail(token, tenantIdentifier);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        setTimeout(() => navigate(result.redirectTo || '/dashboard'), 2000);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch {
      setStatus('error');
      setMessage('Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!email) { setMessage('Please enter your email address'); return; }
    const tenantIdentifier = window.location.hostname.split('.')[0] || 'demo';
    const result = await resendVerification(email, tenantIdentifier);
    if (result.success) {
      setMessage('Verification email sent! Please check your inbox.');
      setCanResend(false);
      setResendCountdown(60);
      const countdown = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) { clearInterval(countdown); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fef3f2 50%, #f0f9ff 100%)',
      padding: '2rem 1rem',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 48px rgba(233,30,140,0.10), 0 2px 12px rgba(0,0,0,0.06)',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: 440,
      }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: GRAD,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 4px 20px rgba(233,30,140,0.3)',
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"
              stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Email Verification
          </h1>
          {status === 'pending' && (
            <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
              Please check your email and click the verification link
            </p>
          )}
        </div>

        {/* Success state */}
        {status === 'success' && (
          <div style={{
            background: '#F0FDF4', border: '1.5px solid #86EFAC',
            borderRadius: 12, padding: '1rem 1.25rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
              stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{ color: '#15803D', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{message}</p>
              <p style={{ color: '#16A34A', fontSize: '0.8125rem', marginTop: 4 }}>Redirecting to setup…</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div style={{
            background: '#FFF1F2', border: '1.5px solid #FDA4AF',
            borderRadius: 12, padding: '1rem 1.25rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
              stroke="#E11D48" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p style={{ color: '#BE123C', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{message}</p>
          </div>
        )}

        {/* Pending — resend form */}
        {status === 'pending' && (
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email to resend verification"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                border: '1.5px solid #E5E7EB', fontSize: '0.9375rem',
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#E91E8C'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />

            {message && (
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '0.5rem' }}>{message}</p>
            )}

            <button
              onClick={handleResend}
              disabled={loading || !canResend}
              style={{
                marginTop: '1.25rem',
                width: '100%', padding: '0.875rem',
                borderRadius: 9999, border: 'none',
                background: (loading || !canResend) ? '#E5E7EB' : GRAD,
                color: (loading || !canResend) ? '#9CA3AF' : '#fff',
                fontWeight: 700, fontSize: '1rem',
                cursor: (loading || !canResend) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || !canResend) ? 'none' : '0 4px 16px rgba(233,30,140,0.3)',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Sending…' : canResend ? 'Resend Verification Email' : `Resend in ${resendCountdown}s`}
            </button>
          </div>
        )}

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: '#E91E8C', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;