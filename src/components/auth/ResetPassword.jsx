import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../config/axios';
import { AuthLayout } from '../public/PublicLayout';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new password reset link.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      // Better Auth standard reset-password endpoint
      await axios.post('/api/auth/reset-password', {
        newPassword,
        token,
      });
      setSuccess('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message;
      setError(msg || 'Failed to reset password. The link may have expired — please request a new one.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 64px)', marginTop: 64, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', background: '#FAFAFA' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(233,30,140,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg style={{ width: 28, height: 28 }} fill="none" viewBox="0 0 24 24" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Reset Password
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Enter your new password below.
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p style={{ fontSize: '0.875rem' }}>{error}</p>
                  {error.includes('expired') && (
                    <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: '#E91E8C', fontWeight: 600 }}>
                      Request a new reset link →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {success ? (
              <div className="alert alert-success">
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p style={{ fontSize: '0.875rem' }}>{success}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: 4 }}>Redirecting to sign in...</p>
                </div>
              </div>
            ) : token && (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">New Password</label>
                  <input type="password" required className="field-input" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" minLength={8} />
                </div>
                <div className="field">
                  <label className="field-label">Confirm New Password</label>
                  <input type="password" required className="field-input" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" minLength={8} />
                </div>
                <button type="submit" disabled={loading || !newPassword || !confirmPassword}
                  style={{ width: '100%', padding: '0.875rem', background: (loading || !newPassword || !confirmPassword) ? '#D1D5DB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', border: 'none', borderRadius: 9999, fontWeight: 700, fontSize: '1.0625rem', cursor: (loading || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: (loading || !newPassword || !confirmPassword) ? 'none' : '0 4px 20px rgba(233,30,140,0.35)', marginTop: '0.5rem' }}>
                  {loading ? 'Resetting...' : 'Reset Password →'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
