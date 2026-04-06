import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../config/axios';
import { AuthLayout } from '../public/PublicLayout';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Better Auth standard password reset — sends an email with a reset link
      await axios.post('/api/auth/forget-password', {
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      }, { timeout: 12000 });

      setSuccess('Password reset email sent! Check your inbox and follow the link to reset your password.');
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message;
      setError(msg || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 64px)', marginTop: 64, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', background: '#FAFAFA' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B7280', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '2rem' }}>
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(233,30,140,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <svg style={{ width: 28, height: 28 }} fill="none" viewBox="0 0 24 24" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Forgot Password
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}

            {success ? (
              <div className="alert alert-success">
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ fontSize: '0.875rem' }}>{success}</p>
              </div>
            ) : (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={onSubmit}>
                <div className="field">
                  <label className="field-label">Email Address</label>
                  <input type="email" required className="field-input" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="you@school.edu" />
                </div>
                <button type="submit" disabled={loading || !email}
                  style={{ width: '100%', padding: '0.875rem', background: (loading || !email) ? '#D1D5DB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', border: 'none', borderRadius: 9999, fontWeight: 700, fontSize: '1.0625rem', cursor: (loading || !email) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: (loading || !email) ? 'none' : '0 4px 20px rgba(233,30,140,0.35)', marginTop: '0.5rem' }}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
