import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../../context/AuthContext';
import { AuthLayout } from '../public/PublicLayout';

/* ── All React logic / API calls UNCHANGED ── */

const AuthLogin = () => {
  const { login, googleSignIn, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '', tenantIdentifier: '' });
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    try {
      const result = await login(formData);
      if (result?.success) navigate(result.redirectTo);
      else setError(result?.message || 'Login failed. Please try again.');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleSignIn(credentialResponse.credential, formData.tenantIdentifier);
      if (result.success) navigate(result.redirectTo || '/dashboard');
      else setError(result.message || 'Google sign-in failed. Please use email/password.');
    } catch {
      setError('Google sign-in failed. Please try again or use email/password login.');
    }
  };

  const handleGoogleError = () => setError('Google sign-in failed. Please try again.');

  const busy = loading || localLoading;

  return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 64px)', marginTop: 64, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left Brand Panel ───────────────────────────────── */}
      <div
        className="hidden md:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%)' }}
      >
        {/* Animated blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, color: '#fff', textAlign: 'center', maxWidth: 380, padding: '2rem' }}>
          {/* Logo icon */}
          <div
            style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem',
            }}
          >
            <svg style={{ width: 36, height: 36 }} fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            Welcome back
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
            Sign in to your school management dashboard and pick up right where you left off.
          </p>

          {/* Feature bullets */}
          {[
            {
              icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
              text: 'Manage students & teachers effortlessly',
            },
            {
              icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
              text: 'Real-time attendance & fee reports',
            },
            {
              icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>),
              text: 'Instant notices, events & notifications',
            },
            {
              icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>),
              text: 'Enterprise-grade security & isolation',
            },
          ].map(f => (
            <div
              key={f.text}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                textAlign: 'left', marginBottom: '0.875rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12, padding: '0.75rem 1rem',
                backdropFilter: 'blur(8px)',
              }}
            >
                <span style={{ fontSize: '1.125rem', flexShrink: 0, display: 'flex' }}>{f.icon}</span>
              <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ───────────────────────────────── */}
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', background: '#FAFAFA' }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }} className="md:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              EduFlow Pro
            </span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
              Sign in to your account
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error mb-5">
              <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={onSubmit}>

            <div className="field">
              <label className="field-label">School Subdomain / Tenant ID</label>
              <input type="text" name="tenantIdentifier" required className="field-input"
                value={formData.tenantIdentifier} onChange={onChange} placeholder="e.g. myschool" />
            </div>

            <div className="field">
              <label className="field-label">Email Address</label>
              <input type="email" name="email" required className="field-input"
                value={formData.email} onChange={onChange} placeholder="you@school.edu" />
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" required
                  className="field-input"
                  style={{ paddingRight: '2.75rem' }}
                  value={formData.password} onChange={onChange} placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPassword
                    ? <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                    : <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <button type="button" onClick={() => navigate('/signup')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#E91E8C', padding: 0 }}>
                Don't have an account? Sign up
              </button>
              <button type="button" onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%', padding: '0.875rem',
                background: busy ? '#D1D5DB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)',
                color: '#fff', border: 'none', borderRadius: 9999, fontWeight: 700,
                fontSize: '1.0625rem', cursor: busy ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: busy ? 'none' : '0 4px 20px rgba(233,30,140,0.35)',
                marginTop: '0.25rem',
              }}
            >
              {busy ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>

            <div className="divider">or continue with</div>

            <div style={{ display: 'flex', justifyItems: 'center', width: '100%', alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
                theme="outline" size="large" width="372" text="continue_with" />
            </div>
          </form>
        </div>
      </div>
      </div>
    </AuthLayout>
  );
};

export default AuthLogin;