import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import SectionContainer, { SectionHeader } from '../../components/public/SectionContainer';
import Reveal from '../../components/public/Reveal';

/* ── SVG Icon set (no emojis) ──────────────────────────────── */
const Icon = ({ d, size = 24, stroke = '#E91E8C', strokeWidth = 1.7 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const VALUES = [
  {
    d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Education First',
    description: "Every feature we build starts with one question: does this make educators more effective?",
    accent: '#E91E8C', bg: 'rgba(233,30,140,0.08)',
  },
  {
    d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Security & Privacy',
    description: "Your school's data is sacred. We use enterprise-grade security with complete tenant isolation.",
    accent: '#9333EA', bg: 'rgba(147,51,234,0.08)',
  },
  {
    d: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Simplicity',
    description: "Powerful software doesn't have to be complicated. We obsess over making complex things simple.",
    accent: '#FF6B35', bg: 'rgba(255,107,53,0.08)',
  },
  {
    d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Partnership',
    description: "We're not just a vendor — we're a long-term partner invested in your institution's success.",
    accent: '#10B981', bg: 'rgba(16,185,129,0.08)',
  },
];

const WHY_US = [
  { d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', title: 'Built for Scale', description: 'Multi-tenant architecture means your data is isolated and scales from 50 students to 50,000.', accent: '#E91E8C' },
  { d: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Fast Onboarding', description: 'Most schools are fully operational within one afternoon. Guided setup and bulk import tools eliminate weeks of data entry.', accent: '#FF6B35' },
  { d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', title: 'Continuous Innovation', description: 'New features ship every month based on real admin feedback. You\'re always on the latest version.', accent: '#9333EA' },
  { d: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Global & Local', description: 'Designed for international use — multi-currency and multi-language support included.', accent: '#10B981' },
  { d: 'M12 18h.01M8 21h8a2 2 0 002-2v-2H6v2a2 2 0 002 2zM14 3H10a2 2 0 00-2 2v.5a5.5 5.5 0 0011 0V5a2 2 0 00-2-2z', title: 'Mobile Ready', description: 'Fully responsive — teachers can mark attendance and admins can view reports from any device.', accent: '#3B82F6' },
  { d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Compliance Ready', description: 'GDPR-compliant, audit trails, and role-based access controls keep your institution protected.', accent: '#F59E0B' },
];

const TEAM = [
  { name: 'Ahmed Raza',  role: 'CEO & Co-Founder',         initials: 'AR', gradFrom: '#E91E8C', gradTo: '#FF6B35', bio: 'Former school principal turned tech entrepreneur. 15 years in education.' },
  { name: 'Fatima Khan', role: 'CTO & Co-Founder',         initials: 'FK', gradFrom: '#9333EA', gradTo: '#E91E8C', bio: 'Full-stack engineer with a passion for EdTech and scalable systems.' },
  { name: 'Omar Sheikh', role: 'Head of Product',          initials: 'OS', gradFrom: '#10B981', gradTo: '#3B82F6', bio: 'Product designer who spent 5 years building software for schools in South Asia.' },
  { name: 'Aisha Malik', role: 'Head of Customer Success', initials: 'AM', gradFrom: '#FF6B35', gradTo: '#F59E0B', bio: 'Dedicated to ensuring every school gets maximum value from EduFlow Pro.' },
];

const PROBLEMS = [
  { pain: 'Fee collection is manual, error-prone, and takes days each month',              solution: 'Automated billing with one-click receipts and arrears tracking' },
  { pain: 'Attendance is tracked on paper registers that get lost or damaged',              solution: 'Digital attendance with real-time reports and parent notifications' },
  { pain: 'Student data lives in 5 different Excel files with no single source of truth',  solution: 'Unified student profiles with complete history and bulk import' },
  { pain: 'Staff salaries are calculated manually with frequent errors',                   solution: 'Automated payroll with configurable deductions and payment tracking' },
];

/* ── Inline fade-in hook ───────────────────────────────────── */
const FadeIn = ({ children, delay = 0, style = {}, className = '' }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  React.useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)', transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
};

/* ── FAQ Data ─────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'How long does it take to get started?',
    a: 'Most schools are fully operational within one afternoon. Our guided onboarding walks you through setting up classes, importing student data, and inviting staff. No technical expertise required.',
  },
  {
    q: 'Is my school\'s data safe and private?',
    a: 'Absolutely. Every school gets its own completely isolated environment — no data is ever shared between tenants. We use JWT authentication, rate limiting, HTTPS encryption, and regular automated backups.',
  },
  {
    q: 'Can I import existing student and staff records?',
    a: 'Yes. EduFlow Pro supports bulk import via Excel (XLSX/CSV). Our smart validator catches errors before they enter the system. You can import students, teachers, fee records, and class assignments in minutes.',
  },
  {
    q: 'What happens when my free trial ends?',
    a: 'You\'ll be prompted to select a plan. Your data is never deleted — it stays safely stored for 30 days after trial expiry so you can pick up right where you left off once you subscribe.',
  },
  {
    q: 'Do you offer support for non-English speaking schools?',
    a: 'Yes. The interface supports multiple languages and our support team can communicate in English, Urdu, and Arabic. We\'re continuously expanding language support based on user feedback.',
  },
  {
    q: 'Can multiple admins access the system simultaneously?',
    a: 'Yes. EduFlow Pro is built for multi-user, multi-role workflows. You can have admins, vice principals, accountants, and teachers all active at once — each with their own role-based access controls.',
  },
  {
    q: 'Is a mobile app available?',
    a: 'The web app is fully responsive and works great on all devices. A dedicated iOS and Android app is on our Q3 2025 roadmap — existing subscribers will get free access when it launches.',
  },
];

/* ── FAQ Accordion Item ────────────────────────────────────── */
const FAQItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <FadeIn delay={index * 50}>
      <div
        style={{
          background: '#fff',
          border: `1.5px solid ${open ? 'rgba(233,30,140,0.3)' : '#E5E7EB'}`,
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'border-color 0.25s',
          boxShadow: open ? '0 4px 24px rgba(233,30,140,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Question row */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
          aria-expanded={open}
        >
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: 1.45 }}>{q}</span>
          {/* SVG icon: + morphs to × */}
          <span
            style={{
              flexShrink: 0,
              width: 28, height: 28,
              borderRadius: '50%',
              background: open ? 'linear-gradient(135deg, #E91E8C, #FF6B35)' : '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.25s, transform 0.3s',
              transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke={open ? '#fff' : '#6B7280'} strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round"
            >
              {/* Always a + sign; rotation of parent makes it an × when open */}
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>

        {/* Answer — grid-template-rows: 0fr→1fr animates reliably in both directions */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.38s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            <p style={{
              padding: '0 1.5rem 1.25rem',
              color: '#6B7280',
              fontSize: '0.9375rem',
              lineHeight: 1.75,
              borderTop: '1px solid #F3F4F6',
              paddingTop: '1rem',
            }}>
              {a}
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};


const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section style={{ background: '#0A0A0F', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 1.5rem 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse at center, rgba(233,30,140,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
          <FadeIn>
            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#E91E8C', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.25)', padding: '0.3rem 0.875rem', borderRadius: 9999, marginBottom: '1.5rem' }}>
              About Us
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.12, marginBottom: '1.25rem' }}>
              We're on a mission to{' '}
              <span style={{ background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                modernize education management
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.125rem', lineHeight: 1.75, maxWidth: 580, margin: '0 auto' }}>
              EduFlow Pro was born from a simple frustration: school administrators were drowning in spreadsheets, paper registers, and disconnected tools. We built the platform we wished existed.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <SectionContainer bg="bg-white">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2">
          <FadeIn>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderLeft: '4px solid #E91E8C', borderRadius: 16, padding: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icon d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" size={26} stroke="#E91E8C" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.75rem' }}>Our Mission</h2>
              <p style={{ color: '#6B7280', lineHeight: 1.75 }}>
                To empower every educational institution — regardless of size or budget — with the tools they need to operate efficiently, communicate effectively, and focus on what matters most: student success.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderLeft: '4px solid #9333EA', borderRadius: 16, padding: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(147,51,234,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={26} stroke="#9333EA" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.75rem' }}>Our Vision</h2>
              <p style={{ color: '#6B7280', lineHeight: 1.75 }}>
                A world where every school — from a small coaching center in Lahore to a large university in London — has access to enterprise-grade management software that's affordable, intuitive, and built for their reality.
              </p>
            </div>
          </FadeIn>
        </div>
      </SectionContainer>

      {/* ── Problem / Solution ── */}
      <SectionContainer bg="bg-[#F9FAFB]">
        <SectionHeader
          eyebrow="The Problem We Solve"
          title="Schools are still running on spreadsheets"
          subtitle="We've talked to hundreds of school administrators. Here's what we heard:"
        />

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', gap: 0, maxWidth: 860, margin: '0 auto 1.25rem', padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEF2F2', border: '1.5px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#EF4444' }}>Before EduFlow Pro</span>
          </div>
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#ECFDF5', border: '1.5px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#059669' }}>With EduFlow Pro</span>
          </div>
        </div>

        {/* Comparison rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 860, margin: '0 auto' }}>
          {PROBLEMS.map(({ pain, solution }, i) => (
            <FadeIn key={pain} delay={i * 70}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', alignItems: 'stretch', gap: 0 }}>

                {/* Problem side */}
                <div style={{
                  background: '#FFF5F5',
                  border: '1.5px solid #FECACA',
                  borderRight: 'none',
                  borderRadius: '14px 0 0 14px',
                  padding: '1.125rem 1.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#FEE2E2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </span>
                  <p style={{ color: '#7F1D1D', fontWeight: 500, fontSize: '0.9375rem', lineHeight: 1.55, margin: 0 }}>{pain}</p>
                </div>

                {/* Arrow bridge */}
                <div style={{ background: 'linear-gradient(to right, #FFF5F5, #F0FDF4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid transparent', borderTop: '1.5px solid #E5E7EB', borderBottom: '1.5px solid #E5E7EB' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Solution side */}
                <div style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #A7F3D0',
                  borderLeft: 'none',
                  borderRadius: '0 14px 14px 0',
                  padding: '1.125rem 1.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#D1FAE5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <p style={{ color: '#064E3B', fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.55, margin: 0 }}>{solution}</p>
                </div>

              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom trust note */}
        <FadeIn delay={320}>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
              Trusted by <strong style={{ color: '#111827' }}>10,000+ schools</strong> across 40+ countries to solve exactly these problems.
            </p>
          </div>
        </FadeIn>
      </SectionContainer>

      {/* ── Values ── */}
      <SectionContainer bg="bg-white">
        <SectionHeader eyebrow="Our Values" title="What we stand for" subtitle="These principles guide every decision we make — from features to support." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ d, title, description, accent, bg }, i) => (
            <FadeIn key={title} delay={i * 60}>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%', transition: 'box-shadow 0.3s, transform 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Icon d={d} size={26} stroke={accent} />
                </div>
                <h3 style={{ fontWeight: 800, color: '#111827', marginBottom: '0.625rem', fontSize: '1.0625rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.65 }}>{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionContainer>

      {/* ── Why Choose Us ── */}
      <SectionContainer bg="bg-[#F9FAFB]">
        <SectionHeader eyebrow="Why EduFlow Pro" title="Built different, for a reason" subtitle="We didn't just build another school management system. We rethought it from the ground up." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map(({ d, title, description, accent }, i) => (
            <FadeIn key={title} delay={i * 50}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(233,30,140,0.25)' }}>
                  <Icon d={d} size={24} stroke="#fff" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.375rem', fontSize: '1.0625rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.65 }}>{description}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionContainer>

      {/* ── Team ── */}
      <SectionContainer bg="bg-white">
        <SectionHeader eyebrow="Our Team" title="The people behind EduFlow Pro" subtitle="A small, passionate team with deep roots in education and technology." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="grid-cols-2 lg:grid-cols-4">
          {TEAM.map(({ name, role, initials, gradFrom, gradTo, bio }, i) => (
            <FadeIn key={name} delay={i * 70}>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: 68, height: 68, borderRadius: 18, background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.375rem', fontWeight: 800, margin: '0 auto 1.25rem', boxShadow: `0 6px 20px ${gradFrom}44` }}>
                  {initials}
                </div>
                <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{name}</h3>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E91E8C', marginBottom: '0.75rem' }}>{role}</p>
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.6 }}>{bio}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionContainer>

      {/* ── FAQ ── */}
      <SectionContainer bg="bg-[#F9FAFB]">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Everything you need to know about EduFlow Pro. Can't find your answer? Contact our team."
        />
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
        <FadeIn delay={200}>
          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: '#6B7280', fontSize: '0.9375rem' }}>
            Still have questions?{' '}
            <a href="/contact" style={{ color: '#E91E8C', fontWeight: 600, textDecoration: 'none' }}>
              Talk to our team →
            </a>
          </p>
        </FadeIn>
      </SectionContainer>

      {/* ── CTA ── */}
      <section style={{ background: '#0A0A0F', padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse at center, rgba(233,30,140,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '48rem', margin: '0 auto' }}>
          <FadeIn>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: 1.15 }}>
              Join our growing{' '}
              <span style={{ background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>community</span>
            </h2>
          </FadeIn>
          <FadeIn delay={80}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
              10,000+ schools trust EduFlow Pro. Start your free trial today.
            </p>
          </FadeIn>
          <FadeIn delay={160}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/signup')} style={{ padding: '0.9375rem 2rem', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', fontWeight: 700, fontSize: '1.0625rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(233,30,140,0.40)' }}>
                Get Started Free
              </button>
              <button onClick={() => navigate('/contact')} style={{ padding: '0.9375rem 2rem', borderRadius: 9999, border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '1.0625rem', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                Contact Us
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

    </PublicLayout>
  );
};

export default AboutPage;
