import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';

/* ── Shared Header ─────────────────────────────────────────── */
const Header = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-nav)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-lg gradient-text">EduFlow Pro</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {['Features', 'Pricing', 'About'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="school-navbar-link px-3 py-2 rounded-lg text-sm">{l}</a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="btn btn-primary btn-sm">
              Get Started →
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t pt-3" style={{ borderColor: 'var(--border-default)' }}>
            {['Features', 'Pricing', 'About'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="block px-3 py-2 text-sm rounded-lg"
                style={{ color: 'var(--text-primary)' }}>{l}</a>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => navigate('/login')} className="btn btn-secondary btn-sm flex-1">Sign In</button>
              <button onClick={() => navigate('/signup')} className="btn btn-primary btn-sm flex-1">Get Started</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

/* ── Shared Footer ─────────────────────────────────────────── */
const Footer = () => (
  <footer style={{ background: '#0D1117', color: '#9CA3AF' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-white">EduFlow Pro</span>
        </div>
        <p className="text-sm text-center">Empowering educational institutions worldwide</p>
        <p className="text-sm">© 2024 EduFlow Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export { Header, Footer };

/* ── Main Landing ──────────────────────────────────────────── */
const EduFlowLanding = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [signupData, setSignupData] = useState({
    subdomain: '', institutionName: '', adminEmail: '',
    adminPassword: '', adminFirstName: '', adminLastName: '', institutionType: 'education'
  });
  const navigate = useNavigate();

  const plans = {
    starter: { name: 'Starter', price: 29, users: 100, instructors: 5, features: ['Basic Attendance', 'Simple Fee Management', 'Email Support', 'Mobile Access'] },
    professional: { name: 'Professional', price: 79, users: 500, instructors: 25, features: ['Advanced Analytics', 'Bulk Operations', 'Parent Portal', 'SMS Notifications', 'API Access'] },
    enterprise: { name: 'Enterprise', price: 199, users: 'Unlimited', instructors: 'Unlimited', features: ['Custom Branding', 'SSO Integration', 'Dedicated Support', 'Advanced Security', 'Custom Reports'] },
    district: { name: 'District', price: 499, users: 'Unlimited', instructors: 'Unlimited', features: ['Multi-Campus', 'White-label Solution', 'Custom Integrations', 'On-premise Option', 'Priority Support'] }
  };

  const verticals = [
    { id: 'education', name: 'Schools & Colleges', icon: '🎓', desc: 'K-12 Schools, Colleges, Universities' },
    { id: 'training', name: 'Training Centers', icon: '📚', desc: 'Professional Training, Skill Development' },
    { id: 'corporate', name: 'Corporate Learning', icon: '🏢', desc: 'Employee Training, HR Management' },
    { id: 'coaching', name: 'Coaching Institutes', icon: '🎯', desc: 'Test Prep, Competitive Exams' }
  ];

  const features = [
    { title: 'Learner Management', desc: 'Complete learner lifecycle management with advanced analytics and reporting tools.', icon: '👥' },
    { title: 'Instructor Portal', desc: 'Powerful tools for instructors to manage courses, grading and track student progress.', icon: '🎓' },
    { title: 'Financial Operations', desc: 'Automated fee collection, payment processing, and comprehensive financial reporting.', icon: '💰' },
    { title: 'Communication Hub', desc: 'Multi-channel communication with learners, parents, and staff via SMS and email.', icon: '📱' },
    { title: 'Analytics & Insights', desc: 'Real-time dashboards and predictive analytics for data-driven decisions.', icon: '📊' },
    { title: 'Process Automation', desc: 'Workflow automation to reduce manual work and dramatically increase efficiency.', icon: '⚡' }
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/onboarding/signup', { ...signupData, plan: selectedPlan });
      localStorage.setItem('token', response.data.token);
      window.location.href = `https://${signupData.subdomain}.eduflowpro.com/dashboard`;
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-section py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill text-sm font-semibold mb-6"
            style={{ background: 'var(--brand-50)', color: 'var(--brand)', border: '1px solid var(--brand-200)' }}>
            <span>✨</span> The Complete School Management Platform
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-none"
            style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
          >
            Manage Smarter,<br />
            <span className="gradient-text">Grow Faster.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            Streamline operations, enhance productivity, and drive growth for educational institutions worldwide.
            Trusted by 10,000+ institutions across 50+ countries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button onClick={() => navigate('/signup')} className="btn btn-primary btn-xl">
              Start 14-Day Free Trial →
            </button>
            <button
              className="btn btn-secondary btn-xl"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </button>
          </div>

          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No credit card required · Setup in 5 minutes · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Verticals ────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
              Built for Every Educational Institution
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              A flexible platform that adapts to your unique needs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verticals.map(v => (
              <div key={v.id} className="feature-card text-center cursor-pointer">
                <div className="feature-card-icon mx-auto" style={{ fontSize: '1.75rem' }}>{v.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{v.name}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-20" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
              Everything You Need to Succeed
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              A comprehensive suite of tools built for modern educational management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-card-icon" style={{ fontSize: '1.5rem' }}>{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ──────────────────────────────── */}
      <section id="pricing" className="py-20" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              Choose the plan that fits your institution's size and needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(plans).map(([key, plan]) => {
              const isFeatured = key === 'professional';
              return (
                <div
                  key={key}
                  className={`pricing-card ${isFeatured ? 'pricing-card-featured' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPlan(key)}
                >
                  {isFeatured && (
                    <div className="badge badge-popular mb-4 mx-auto block w-fit">Most Popular</div>
                  )}
                  <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>${plan.price}</span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>/month</span>
                  </div>
                  <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Billed annually</p>

                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#10B981' }}>✓</span> Up to {plan.users} learners
                    </li>
                    <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#10B981' }}>✓</span> Up to {plan.instructors} instructors
                    </li>
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#10B981' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => { setSelectedPlan(key); navigate('/signup'); }}
                    className={`btn w-full ${isFeatured ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {selectedPlan === key ? 'Selected →' : 'Get Started'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sign-up Form ─────────────────────────────────── */}
      <section id="signup" className="py-20" style={{ background: 'var(--gradient-brand)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8 md:p-10">
            <h2 className="text-3xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Start Your Free Trial Today
            </h2>
            <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of institutions already using EduFlow Pro
            </p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="field">
                  <label className="field-label">Institution Name</label>
                  <input type="text" placeholder="Your School Name" value={signupData.institutionName}
                    onChange={e => setSignupData({ ...signupData, institutionName: e.target.value })}
                    className="field-input" required />
                </div>
                <div className="field">
                  <label className="field-label">Institution Type</label>
                  <select value={signupData.institutionType}
                    onChange={e => setSignupData({ ...signupData, institutionType: e.target.value })}
                    className="field-input">
                    {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Your Subdomain</label>
                <div className="flex">
                  <input type="text" placeholder="yourschool" value={signupData.subdomain}
                    onChange={e => setSignupData({ ...signupData, subdomain: e.target.value })}
                    className="field-input rounded-r-none flex-1" required />
                  <span className="px-4 flex items-center text-sm font-medium rounded-r-xl"
                    style={{ background: 'var(--bg-muted)', border: '1.5px solid var(--border-default)', borderLeft: 'none', color: 'var(--text-muted)' }}>
                    .eduflowpro.com
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="field">
                  <label className="field-label">Admin First Name</label>
                  <input type="text" placeholder="First Name" value={signupData.adminFirstName}
                    onChange={e => setSignupData({ ...signupData, adminFirstName: e.target.value })}
                    className="field-input" required />
                </div>
                <div className="field">
                  <label className="field-label">Admin Last Name</label>
                  <input type="text" placeholder="Last Name" value={signupData.adminLastName}
                    onChange={e => setSignupData({ ...signupData, adminLastName: e.target.value })}
                    className="field-input" required />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Admin Email</label>
                <input type="email" placeholder="admin@yourschool.edu" value={signupData.adminEmail}
                  onChange={e => setSignupData({ ...signupData, adminEmail: e.target.value })}
                  className="field-input" required />
              </div>

              <div className="field">
                <label className="field-label">Admin Password</label>
                <input type="password" placeholder="••••••••" value={signupData.adminPassword}
                  onChange={e => setSignupData({ ...signupData, adminPassword: e.target.value })}
                  className="field-input" required />
              </div>

              <button type="submit" className="btn btn-primary w-full btn-lg">
                Start Free Trial — {plans[selectedPlan].name} Plan →
              </button>
            </form>

            <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
              14-day free trial · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EduFlowLanding;