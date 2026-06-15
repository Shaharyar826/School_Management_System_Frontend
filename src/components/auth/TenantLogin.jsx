import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from '../../config/axios';
import FormInput from '../common/FormInput';
import FloatingPasswordInput from '../common/FloatingPasswordInput';

const TenantLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [step, setStep]           = useState(1);
  const [subdomain, setSubdomain] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubdomainSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.get(`/api/auth/check-tenant/${subdomain}`);
      if (res.data.success && res.data.exists) {
        if (res.data.data.status === 'suspended') {
          setError('This school account is suspended. Please contact support.');
        } else {
          setStep(2);
        }
      } else {
        setError('School not found. Please check your school subdomain.');
      }
    } catch {
      setError('Unable to verify school. Please try again.');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await login({ ...loginData, tenantIdentifier: subdomain });
      if (result.success) navigate(result.redirectTo || '/dashboard');
      else setError(result.message || 'Login failed');
    } catch {
      setError('Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF0F8, #F5F0FF, #FAFAFA)', padding: '2rem 1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, boxShadow: '0 4px 30px rgba(233,30,140,0.08)', border: '1px solid #F3E8FF', padding: '2.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 16px rgba(233,30,140,0.3)' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>
            {step === 1 ? 'Find Your School' : 'Sign In'}
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            {step === 1 ? 'Enter your school subdomain to continue' : `Signing in to ${subdomain}.learnexes.com`}
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.75rem 1rem', color: '#EF4444', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubdomainSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <FormInput
                id="subdomain" name="subdomain" type="text"
                label="School Subdomain" required
                value={subdomain}
                onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                e.g. myschool → myschool.learnexes.com
              </p>
            </div>
            <button type="submit" disabled={loading || !subdomain}
              style={{ width: '100%', padding: '0.875rem', borderRadius: 9999, border: 'none', background: loading || !subdomain ? '#E5E7EB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: loading || !subdomain ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: '1rem', cursor: loading || !subdomain ? 'not-allowed' : 'pointer', boxShadow: loading || !subdomain ? 'none' : '0 4px 20px rgba(233,30,140,0.3)' }}>
              {loading ? 'Checking…' : 'Continue →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <FormInput
              id="email" name="email" type="email" label="Email Address" required
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
            />
            <FloatingPasswordInput
              id="password" name="password" label="Password" required
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              autoComplete="current-password"
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 9999, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer' }}>
                ← Back
              </button>
              <button type="submit" disabled={loading}
                style={{ flex: 2, padding: '0.75rem', borderRadius: 9999, border: 'none', background: loading ? '#E5E7EB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: loading ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: '0.9375rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(233,30,140,0.3)' }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TenantLogin;
