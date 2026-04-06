import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { AuthLayout } from '../public/PublicLayout';
import AuthContext from '../../context/AuthContext';

const SetPassword = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');

  useEffect(() => {
    if (isAuthenticated === false) navigate('/login');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await axios.post('/api/auth/set-password', { newPassword });
      setSuccess('Password set successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password. Please try again.');
      setLoading(false);
    }
  };

  if (!user) return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E91E8C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 64px)', marginTop: 64, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', background: '#FAFAFA' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(233,30,140,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg style={{ width: 28, height: 28 }} fill="none" viewBox="0 0 24 24" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Set Your Password
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Welcome, {user.name?.split(' ')[0] || 'there'}! You logged in via a secure link. Set a password to sign in directly next time.
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}

            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <svg style={{ width: 48, height: 48, margin: '0 auto 1rem', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{success}</h3>
                <p style={{ color: '#6B7280' }}>Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">New Password</label>
                  <input type="password" required className="field-input" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" minLength={8} />
                </div>
                <div className="field">
                  <label className="field-label">Confirm Password</label>
                  <input type="password" required className="field-input" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" minLength={8} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="submit" disabled={loading || !newPassword || !confirmPassword}
                    style={{ width: '100%', padding: '0.875rem', background: (loading || !newPassword || !confirmPassword) ? '#D1D5DB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', border: 'none', borderRadius: 9999, fontWeight: 700, fontSize: '1.0625rem', cursor: (loading || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: (loading || !newPassword || !confirmPassword) ? 'none' : '0 4px 20px rgba(233,30,140,0.35)' }}>
                    {loading ? 'Saving...' : 'Set Password & Continue'}
                  </button>
                  <button type="button" onClick={() => navigate('/dashboard')} disabled={loading}
                    style={{ width: '100%', padding: '0.875rem', background: 'transparent', border: '1.5px solid #E5E7EB', borderRadius: 9999, color: '#4B5563', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                    Skip — Go to Dashboard
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SetPassword;
