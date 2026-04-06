import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSetup } from '../../context/SetupContext';

/* ─── Design tokens ─────────────────────────────────────────── */
const GRAD       = 'linear-gradient(135deg, #E91E8C, #FF6B35)';
const GRAD_SOFT  = 'linear-gradient(135deg, rgba(233,30,140,0.08), rgba(255,107,53,0.06))';
const PINK       = '#E91E8C';
const DARK       = '#111827';
const MID        = '#6B7280';
const BORDER     = '#E5E7EB';
const CARD_SHADOW = '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)';

/* ─── Plan feature lists ─────────────────────────────────────── */
const PLAN_FEATURES = {
  basic: [
    'Student Management', 'Bulk Student Upload',
    'Teacher Management', 'Admin Staff Management', 'Support Staff Management',
    'Fee Management', 'Fee Collection', 'Fee Receipts', 'Fee Arrears', 'Partial Payments',
    'Salary Management', 'Salary Payment',
    'Attendance Marking', 'Attendance Reports', 'Attendance Summary',
    'Admin Dashboard', 'Stripe Billing', 'Billing Portal',
  ],
  pro: [
    'Everything in Basic',
    'Bulk Teacher Upload', 'Teacher Portal', 'Teacher Dashboard',
    'Notices & Events', 'Meetings', 'Notifications', 'Contact Messages',
    'Result Management', 'Auto Grading',
    'Logo Upload', 'Profile Images', 'Gallery',
    'Upload History', 'Results Export',
  ],
  premium: [
    'Everything in Pro',
    'Student Profile & Photo', 'Siblings Connection', 'Student Portal',
    'Parent Portal', 'Parent Dashboard', 'Student Dashboard',
    'Exam Management', 'School Settings & Branding',
    'Landing Page Events', 'Testimonials', 'Page Content',
    'Public School Website', 'Public Gallery', 'History & Audit Log',
  ],
};

const ALL_FEATURES = [
  { id: 'student_management',     name: 'Student Management' },
  { id: 'bulk_student_upload',    name: 'Bulk Student Upload' },
  { id: 'student_profile',        name: 'Student Profile & Photo' },
  { id: 'siblings_connection',    name: 'Siblings Connection' },
  { id: 'student_portal',         name: 'Student Portal' },
  { id: 'teacher_management',     name: 'Teacher Management' },
  { id: 'admin_staff_management', name: 'Admin Staff Management' },
  { id: 'support_staff_management', name: 'Support Staff Management' },
  { id: 'bulk_teacher_upload',    name: 'Bulk Teacher Upload' },
  { id: 'teacher_portal',         name: 'Teacher Portal' },
  { id: 'parent_portal',          name: 'Parent Portal' },
  { id: 'parent_dashboard',       name: 'Parent Dashboard' },
  { id: 'fee_management',         name: 'Fee Management' },
  { id: 'fee_collection',         name: 'Fee Collection' },
  { id: 'fee_receipts',           name: 'Fee Receipts' },
  { id: 'fee_arrears',            name: 'Fee Arrears Detection' },
  { id: 'partial_payments',       name: 'Partial Payments' },
  { id: 'salary_management',      name: 'Salary Management' },
  { id: 'salary_payment',         name: 'Salary Payment' },
  { id: 'attendance_marking',     name: 'Attendance Marking' },
  { id: 'attendance_reports',     name: 'Attendance Reports' },
  { id: 'attendance_summary',     name: 'Attendance Summary' },
  { id: 'admin_dashboard',        name: 'Admin Dashboard' },
  { id: 'teacher_dashboard',      name: 'Teacher Dashboard' },
  { id: 'student_dashboard',      name: 'Student Dashboard' },
  { id: 'notices',                name: 'Notices & Events' },
  { id: 'meetings',               name: 'Meetings' },
  { id: 'notifications',          name: 'Notifications' },
  { id: 'contact_messages',       name: 'Contact Messages' },
  { id: 'exam_management',        name: 'Exam Management' },
  { id: 'result_management',      name: 'Result Management' },
  { id: 'auto_grading',           name: 'Auto Grading' },
  { id: 'school_settings',        name: 'School Settings & Branding' },
  { id: 'logo_upload',            name: 'Logo Upload' },
  { id: 'profile_images',         name: 'Profile Images' },
  { id: 'gallery',                name: 'Gallery' },
  { id: 'landing_page_events',    name: 'Landing Page Events' },
  { id: 'testimonials',           name: 'Testimonials' },
  { id: 'page_content',           name: 'Page Content' },
  { id: 'public_school_page',     name: 'Public School Website' },
  { id: 'public_gallery',         name: 'Public Gallery' },
  { id: 'upload_history',         name: 'Upload History' },
  { id: 'results_export',         name: 'Results Export' },
  { id: 'history_audit_log',      name: 'History & Audit Log' },
];

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
    stroke={PINK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: 2 }}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const getTenantHeader = () => {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && !hostname.startsWith('127.')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) return parts[0];
  }
  return new URLSearchParams(window.location.search).get('tenant')
    || localStorage.getItem('tenant')
    || 'demo';
};

/* ─── Main component ─────────────────────────────────────────── */
const SchoolSetupDashboard = () => {
  const navigate = useNavigate();
  const { refresh: refreshSetup } = useSetup();

  const [studentCount, setStudentCount]       = useState('');
  const [studentCountError, setStudentCountError] = useState('');
  const [selectedPlan, setSelectedPlan]       = useState(null);
  const [showCustom, setShowCustom]           = useState(false);
  const [customFeatures, setCustomFeatures]   = useState([]);
  const [customPrice, setCustomPrice]         = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [setupError, setSetupError]           = useState('');

  const plans = [
    {
      id: 'basic', name: 'Basic',
      pricePerStudentPKR: 25, pricePerStudentUSD: 0.50,
      maxStudents: 200,
      description: 'Perfect for small schools getting started',
    },
    {
      id: 'pro', name: 'Pro',
      pricePerStudentPKR: 50, pricePerStudentUSD: 0.75,
      maxStudents: 1500, popular: true,
      description: 'For growing schools with advanced needs',
    },
    {
      id: 'premium', name: 'Premium',
      pricePerStudentPKR: 75, pricePerStudentUSD: 1.00,
      maxStudents: 2500,
      description: 'Full-featured solution for large institutions',
    },
  ];

  useEffect(() => {
    if (showCustom && customFeatures.length > 0 && studentCount) calculateCustomPrice();
  }, [customFeatures, studentCount]);

  const validateStudentCount = (value, planId) => {
    const count = parseInt(value);
    if (!value || isNaN(count) || count < 1) {
      setStudentCountError('Please enter a valid number of students'); return false;
    }
    const plan = plans.find(p => p.id === planId);
    if (plan && count > plan.maxStudents) {
      setStudentCountError(`${plan.name} plan supports max ${plan.maxStudents} students`); return false;
    }
    setStudentCountError(''); return true;
  };

  const calculateCustomPrice = async () => {
    try {
      const res = await axios.post('/api/stripe/custom-price', {
        features: customFeatures, students: parseInt(studentCount) || 50,
      });
      setCustomPrice(res.data.data);
    } catch (e) { console.error('Failed to calculate custom price:', e); }
  };

  const getMonthlyPrice = (plan) => {
    const count = parseInt(studentCount) || 0;
    if (!count) return null;
    return { pkr: (plan.pricePerStudentPKR * count).toLocaleString(), usd: (plan.pricePerStudentUSD * count).toFixed(2) };
  };

  const toggleCustomFeature = (id) =>
    setCustomFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  // ── Core setup completion ─────────────────────────────────────
  // Called before Stripe checkout — marks the tenant as setup_complete
  // so features are immediately unlocked once the user returns.
  const markSetupComplete = async (planId, count) => {
    try {
      const tenant = getTenantHeader();
      await axios.post('/api/onboarding/complete-setup', {
        plan: planId,
        studentCount: count,
      }, {
        headers: { 'X-Tenant': tenant },
      });
      // Refresh SetupContext so route guards immediately allow dashboard access
      await refreshSetup();
    } catch (e) {
      console.error('complete-setup call failed (non-blocking):', e);
      // Non-blocking — Stripe checkout can still proceed
    }
  };

  const handleSubscribe = async (planId) => {
    if (!validateStudentCount(studentCount, planId)) return;
    setLoading(true);
    setSetupError('');
    try {
      const count = parseInt(studentCount);

      // 1. Mark setup complete in DB first (trial starts)
      await markSetupComplete(planId, count);

      // 2. Create Stripe checkout session
      const res = await axios.post('/api/stripe/create-checkout-session', {
        plan: planId,
        studentCount: count,
        currency: 'pkr',
        customFeatures: planId === 'custom' ? customFeatures : undefined,
        successUrl: `${window.location.origin}/dashboard?setup=success`,
        cancelUrl:  `${window.location.origin}/setup`,
      }, {
        headers: { 'X-Tenant': getTenantHeader() },
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        // No Stripe URL (demo / dev mode) → go directly to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (e) {
      console.error('Checkout failed:', e);
      setSetupError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────── RENDER ───────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fef3f2 50%, #f9fafb 100%)',
      padding: '3rem 1rem',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: GRAD, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 20px rgba(233,30,140,0.3)',
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"
              stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.2)',
            borderRadius: 9999, padding: '0.35rem 1rem',
            color: PINK, fontWeight: 600, fontSize: '0.8125rem',
            marginBottom: '1.25rem',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            14-day free trial · No credit card required upfront
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: DARK, margin: '0 0 0.75rem' }}>
            Choose Your Plan
          </h1>
          <p style={{ color: MID, fontSize: '1.0625rem', margin: 0 }}>
            Select a plan to start your free trial and unlock your school management dashboard.
          </p>

          {/* Mandatory notice */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#FFF7ED', border: '1px solid #FED7AA',
            borderRadius: 10, padding: '0.5rem 1rem', marginTop: '1rem',
            color: '#92400E', fontSize: '0.8125rem', fontWeight: 500,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="#92400E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            Plan selection is required to access the platform
          </div>
        </div>

        {/* ── Plan Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {plans.map((plan) => {
            const monthly    = getMonthlyPrice(plan);
            const isSelected = selectedPlan === plan.id;

            return (
              <div key={plan.id} style={{
                background: '#fff', borderRadius: 20,
                border: `2px solid ${isSelected ? PINK : plan.popular ? 'rgba(233,30,140,0.3)' : BORDER}`,
                boxShadow: isSelected
                  ? '0 8px 32px rgba(233,30,140,0.15)'
                  : plan.popular ? '0 8px 32px rgba(233,30,140,0.08)' : CARD_SHADOW,
                overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
                {plan.popular && (
                  <div style={{ background: GRAD, color: '#fff', textAlign: 'center', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 }}>
                    ✦ Most Popular
                  </div>
                )}

                <div style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: DARK, margin: '0 0 0.25rem' }}>{plan.name}</h3>
                  <p style={{ color: MID, fontSize: '0.875rem', margin: '0 0 1.25rem' }}>{plan.description}</p>

                  <div style={{ background: GRAD_SOFT, border: '1px solid rgba(233,30,140,0.12)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: DARK }}>Rs. {plan.pricePerStudentPKR}</span>
                      <span style={{ color: MID, fontSize: '0.8125rem' }}>/ student / month</span>
                    </div>
                    <p style={{ color: MID, fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                      ${plan.pricePerStudentUSD} USD · Max {plan.maxStudents.toLocaleString()} students
                    </p>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                      Number of students
                    </label>
                    <input
                      type="number" min="1" max={plan.maxStudents}
                      placeholder={`e.g. 100  (max ${plan.maxStudents})`}
                      value={isSelected ? studentCount : ''}
                      onChange={e => { setStudentCount(e.target.value); setSelectedPlan(plan.id); validateStudentCount(e.target.value, plan.id); }}
                      onFocus={() => setSelectedPlan(plan.id)}
                      style={{
                        width: '100%', padding: '0.625rem 0.875rem',
                        border: `1.5px solid ${isSelected && studentCountError ? '#F87171' : isSelected ? PINK : BORDER}`,
                        borderRadius: 10, fontSize: '0.875rem', fontFamily: 'inherit',
                        outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                      }}
                    />
                    {isSelected && studentCountError && (
                      <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4 }}>{studentCountError}</p>
                    )}
                  </div>

                  {isSelected && monthly && !studentCountError && (
                    <div style={{ background: 'rgba(233,30,140,0.05)', border: '1px solid rgba(233,30,140,0.2)', borderRadius: 10, padding: '0.75rem', textAlign: 'center', marginBottom: '1rem' }}>
                      <p style={{ color: MID, fontSize: '0.75rem', margin: '0 0 2px' }}>Your monthly total</p>
                      <p style={{ fontSize: '1.375rem', fontWeight: 800, color: PINK, margin: 0 }}>Rs. {monthly.pkr}/month</p>
                      <p style={{ color: MID, fontSize: '0.75rem', margin: '2px 0 0' }}>${monthly.usd}/month</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 9999, border: 'none',
                      background: loading ? '#E5E7EB' : GRAD,
                      color: loading ? '#9CA3AF' : '#fff',
                      fontWeight: 700, fontSize: '0.9375rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: loading ? 'none' : '0 4px 16px rgba(233,30,140,0.3)',
                      transition: 'all 0.2s', fontFamily: 'inherit', marginBottom: '1.25rem',
                    }}
                  >
                    {loading && selectedPlan === plan.id ? 'Starting trial…' : 'Start 14-Day Free Trial'}
                  </button>

                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', borderTop: `1px solid ${BORDER}`, paddingTop: '1rem' }}>
                    {PLAN_FEATURES[plan.id].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <CheckIcon />
                        <span style={{ color: '#374151', fontSize: '0.875rem' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Custom Plan ── */}
        <div style={{
          background: '#fff', borderRadius: 20,
          border: `2px solid ${showCustom ? PINK : BORDER}`,
          boxShadow: showCustom ? '0 8px 32px rgba(233,30,140,0.10)' : CARD_SHADOW,
          padding: '1.75rem', marginBottom: '2rem',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <div onClick={() => setShowCustom(!showCustom)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: DARK, margin: '0 0 4px' }}>Custom Plan</h3>
              <p style={{ color: MID, fontSize: '0.875rem', margin: 0 }}>Select only the features you need and pay accordingly</p>
            </div>
            <span style={{
              width: 32, height: 32, borderRadius: '50%', background: GRAD_SOFT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.3s', transform: showCustom ? 'rotate(45deg)' : 'rotate(0deg)',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={PINK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </div>

          {showCustom && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ maxWidth: 280, marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                  Number of students
                </label>
                <input
                  type="number" min="1" placeholder="e.g. 150"
                  value={studentCount}
                  onChange={e => setStudentCount(e.target.value)}
                  style={{
                    width: '100%', padding: '0.625rem 0.875rem',
                    border: `1.5px solid ${BORDER}`, borderRadius: 10,
                    fontSize: '0.875rem', fontFamily: 'inherit',
                    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = PINK}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>

              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.875rem' }}>
                Select features <span style={{ color: PINK }}>({customFeatures.length} selected)</span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {ALL_FEATURES.map(f => {
                  const checked = customFeatures.includes(f.id);
                  return (
                    <label key={f.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '0.5rem 0.75rem', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${checked ? PINK : BORDER}`,
                      background: checked ? 'rgba(233,30,140,0.05)' : '#fff',
                      fontSize: '0.8125rem', color: checked ? PINK : '#374151',
                      fontWeight: checked ? 600 : 400, transition: 'all 0.15s',
                    }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleCustomFeature(f.id)}
                        style={{ width: 14, height: 14, accentColor: PINK, cursor: 'pointer' }} />
                      {f.name}
                    </label>
                  );
                })}
              </div>

              {customPrice && customFeatures.length > 0 && studentCount && (
                <div style={{ background: GRAD_SOFT, border: '1px solid rgba(233,30,140,0.2)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontWeight: 700, color: DARK, marginBottom: '1rem', fontSize: '1rem' }}>Your Custom Price Estimate</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <p style={{ color: MID, fontSize: '0.75rem', margin: '0 0 4px' }}>Per student / month</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: PINK, margin: '0 0 2px' }}>Rs. {customPrice.pricePerStudentPKR}</p>
                      <p style={{ color: MID, fontSize: '0.75rem', margin: 0 }}>${customPrice.pricePerStudentUSD}</p>
                    </div>
                    <div>
                      <p style={{ color: MID, fontSize: '0.75rem', margin: '0 0 4px' }}>Monthly total ({studentCount} students)</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: PINK, margin: '0 0 2px' }}>Rs. {customPrice.monthlyPKR?.toLocaleString()}</p>
                      <p style={{ color: MID, fontSize: '0.75rem', margin: 0 }}>${customPrice.monthlyUSD}</p>
                    </div>
                  </div>
                  <p style={{ color: MID, fontSize: '0.75rem', marginTop: '0.75rem' }}>{customFeatures.length} features selected</p>
                </div>
              )}

              {customFeatures.length > 0 && studentCount && (
                <button
                  onClick={() => handleSubscribe('custom')}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.875rem', borderRadius: 9999, border: 'none',
                    background: loading ? '#E5E7EB' : GRAD,
                    color: loading ? '#9CA3AF' : '#fff',
                    fontWeight: 700, fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(233,30,140,0.3)',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Starting trial…' : 'Start 14-Day Free Trial with Custom Plan'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global error */}
        {setupError && (
          <div style={{ textAlign: 'center', color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem' }}>
            {setupError}
          </div>
        )}

        {/* NOTE: Skip button intentionally removed — plan selection is mandatory */}

      </div>
    </div>
  );
};

export default SchoolSetupDashboard;
