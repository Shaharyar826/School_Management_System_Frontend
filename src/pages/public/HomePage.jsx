import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import FeatureCard from '../../components/public/FeatureCard';
import SectionContainer, { SectionHeader } from '../../components/public/SectionContainer';
import Reveal from '../../components/public/Reveal';

/* ─── SVG icon components ──────────────────────────────────── */
const Ico = (props) => (
  <svg width={props.size || 24} height={props.size || 24} fill="none" viewBox="0 0 24 24"
    stroke={props.stroke || 'currentColor'} strokeWidth={props.w || 1.8}
    strokeLinecap="round" strokeLinejoin="round" style={props.style}>
    {props.children}
  </svg>
);

/* ─── Static data ─────────────────────────────────────────── */

const FEATURES = [
  {
    icon: (<Ico><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></Ico>),
    title: 'Student Management', description: 'Complete student lifecycle — enrollment, profiles, bulk uploads, and historical records all in one place.', accent: 'pink', strip: true
  },
  {
    icon: (<Ico><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></Ico>),
    title: 'Teacher & Staff Portal', description: 'Manage teachers, admin staff, and support staff with role-based access and payroll automation.', accent: 'purple', strip: true
  },
  {
    icon: (<Ico><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></Ico>),
    title: 'Attendance Tracking', description: 'Real-time attendance with absence fine calculations, reports, and parent notifications.', accent: 'green', strip: true
  },
  {
    icon: (<Ico><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Ico>),
    title: 'Fee Management', description: 'Automated billing cycles, arrears support, receipts, and financial reporting — zero manual work.', accent: 'orange', strip: true
  },
  {
    icon: (<Ico><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></Ico>),
    title: 'Analytics & Reports', description: 'Role-based dashboards with real-time insights, financial summaries, and usage metrics.', accent: 'blue', strip: true
  },
  {
    icon: (<Ico><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></Ico>),
    title: 'Communication Hub', description: 'Events, notices, meetings, and SMS/email notifications to keep everyone connected.', accent: 'amber', strip: true
  },
  {
    icon: (<Ico><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></Ico>),
    title: 'Enterprise Security', description: 'JWT auth, rate limiting, CORS protection, and complete multi-tenant data isolation.', accent: 'green', strip: true
  },
  {
    icon: (<Ico><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></Ico>),
    title: 'Bulk Operations', description: 'Upload hundreds of students, teachers, or staff via Excel with automatic validation.', accent: 'orange', strip: true
  },
  {
    icon: (<Ico><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Ico>),
    title: 'Multi-Tenant SaaS', description: 'Each school gets its own isolated environment, custom branding, and subdomain.', accent: 'purple', strip: true
  },
];

const STEPS = [
  { step: '01', title: 'Sign Up in Minutes',    description: 'Create your school account, choose your plan, and get your custom subdomain instantly.',  icon: (<Ico stroke="#fff" w={1.8}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></Ico>) },
  { step: '02', title: 'Configure Your School', description: 'Add your branding, set up classes, and invite your staff. Guided onboarding.',             icon: (<Ico stroke="#fff" w={1.8}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Ico>) },
  { step: '03', title: 'Import Your Data',      description: 'Bulk upload students, teachers, and historical records via Excel. We handle the rest.',    icon: (<Ico stroke="#fff" w={1.8}><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></Ico>) },
  { step: '04', title: 'Run Your School',       description: 'Manage attendance, fees, salaries, and communications from one unified dashboard.',        icon: (<Ico stroke="#fff" w={1.8}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></Ico>) },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Sarah Ahmed',
    role: 'Principal, Greenfield Academy',
    initials: 'SA',
    gradientA: '#E91E8C', gradientB: '#FF6B35',
    quote: 'EduFlow Pro transformed how we manage our 800-student school. Fee collection alone saves us 20 hours a month. The bulk upload feature is a game-changer.',
    rating: 5,
  },
  {
    name: 'Muhammad Tariq',
    role: 'Admin, City Public School',
    initials: 'MT',
    gradientA: '#9333EA', gradientB: '#E91E8C',
    quote: 'We switched from spreadsheets to EduFlow Pro in one weekend. The attendance tracking and parent notifications have dramatically reduced absenteeism.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Director, Sunrise Institute',
    initials: 'PS',
    gradientA: '#E91E8C', gradientB: '#FF6B35',
    quote: 'The multi-tenant architecture means our 3 campuses each have their own space but I can see everything from one super-admin view. Absolutely brilliant.',
    rating: 5,
  },
  {
    name: 'Ali Zaman',
    role: 'CEO, National School Network',
    initials: 'AZ',
    gradientA: '#3B82F6', gradientB: '#9333EA',
    quote: 'We manage 12 campuses from a single dashboard. EduFlow Pro made something that felt impossible completely effortless. Best investment we\'ve made.',
    rating: 5,
  },
  {
    name: 'Fatima Malik',
    role: 'Head of Admin, Bright Future',
    initials: 'FM',
    gradientA: '#10B981', gradientB: '#3B82F6',
    quote: 'The fee management module alone replaced 3 different tools we were using. Setup took one afternoon and the team was fully trained in a day.',
    rating: 5,
  },
  {
    name: 'Raza Khan',
    role: 'VP Operations, EduGroup',
    initials: 'RK',
    gradientA: '#F59E0B', gradientB: '#EF4444',
    quote: 'Real-time reports saved our principals at least 4 hours per week. The Google login integration was seamless for our entire staff.',
    rating: 5,
  },
];

const STATS = [
  { value: '10,000+', label: 'Schools Onboarded' },
  { value: '2M+',     label: 'Students Managed'  },
  { value: '50+',     label: 'Countries'          },
  { value: '99.9%',   label: 'Uptime SLA'         },
];

const PRICING_PREVIEW = [
  { name: 'Starter',      price: 29,  students: 100,         popular: false },
  { name: 'Professional', price: 79,  students: 500,         popular: true  },
  { name: 'Enterprise',   price: 199, students: 'Unlimited', popular: false },
];

const FAQS = [
  { q: 'Is there a free trial?',                       a: 'Yes! Every plan includes a 7-day free trial. No credit card required to start.' },
  { q: 'Can I switch plans later?',                    a: 'Absolutely. Upgrade or downgrade any time. Changes take effect immediately or at next billing cycle.' },
  { q: 'How secure is my data?',                       a: "Each school's data is isolated in its own database with JWT auth, HTTPS, and rate limiting." },
  { q: 'Do you support bulk data import?',             a: 'Yes — upload hundreds of students, teachers, and staff via Excel with automatic validation.' },
  { q: 'Is it mobile responsive?',                     a: 'Yes. The full dashboard, attendance, and fee modules work on any device.' },
];

/* ─── Scroll-triggered reveal wrapper ─────────────────────── */

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(el); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ─── Strips for feature cards ─────────────────────────────── */

const STRIP_COLORS = {
  pink:   '#E91E8C',
  orange: '#FF6B35',
  purple: '#9333EA',
  green:  '#10B981',
  blue:   '#3B82F6',
  amber:  '#F59E0B',
};
const STRIP_BG = {
  pink:   'rgba(233,30,140,0.08)',
  orange: 'rgba(255,107,53,0.08)',
  purple: 'rgba(147,51,234,0.08)',
  green:  'rgba(16,185,129,0.08)',
  blue:   'rgba(59,130,246,0.08)',
  amber:  'rgba(245,158,11,0.08)',
};

const FeatureStripCard = ({ icon, title, description, accent = 'pink', delay = 0 }) => {
  const color = STRIP_COLORS[accent] || '#E91E8C';
  const bg    = STRIP_BG[accent]    || 'rgba(233,30,140,0.08)';
  return (
    <FadeIn delay={delay}>
      <div
        className="h-full"
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderLeft: `4px solid ${color}`,
          borderRadius: 16,
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px ${color}22`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', marginBottom: '1rem' }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6 }}>{description}</p>
      </div>
    </FadeIn>
  );
};

/* ─── Sections ─────────────────────────────────────────────── */

const HeroSection = ({ navigate }) => (
  <section
    className="hero-dark"
    style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '5rem', paddingBottom: '6rem' }}
  >
    {/* Decorative orbs */}
    <div className="hero-orb hero-orb-pink" style={{ width: 500, height: 500, top: -120, left: '60%' }} />
    <div className="hero-orb hero-orb-orange" style={{ width: 360, height: 360, bottom: 0, left: -80 }} />
    <div className="hero-orb hero-orb-purple" style={{ width: 280, height: 280, top: '30%', right: -60 }} />

    <div className="hero-dark-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

      {/* Frosted badge */}
      <FadeIn delay={0}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <span className="badge-frosted">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
            Now live — AI-powered attendance insights
          </span>
        </div>
      </FadeIn>

      {/* Headline */}
      <FadeIn delay={80}>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
          }}
        >
          The Smartest Way to{' '}
          <span className="gradient-text-hero">Run Your School</span>
        </h1>
      </FadeIn>

      {/* Sub-headline */}
      <FadeIn delay={170}>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 600,
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          EduFlow Pro is the all-in-one SaaS platform that handles students, staff, fees,
          attendance, and communications — so you can focus on education.
        </p>
      </FadeIn>

      {/* CTA row */}
      <FadeIn delay={250}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate('/signup')}
            className="btn-hero btn btn-xl"
          >
            Start 7-Day Free Trial →
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-ghost-dark btn btn-xl"
          >
            View Pricing
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem' }}>
          No credit card required · Setup in under 5 minutes · Cancel anytime
        </p>
      </FadeIn>

      {/* Floating dashboard mockup */}
      <FadeIn delay={400}>
        <div
          className="animate-float"
          style={{
            marginTop: '4rem',
            maxWidth: 900,
            margin: '4rem auto 0',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Fake browser bar */}
          <div style={{ height: 40, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>app.eduflowpro.com/dashboard</span>
          </div>

          {/* Mock dashboard content */}
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              {
                label: 'Total Students', value: '1,248',
                icon: (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
                color: '#E91E8C', bg: 'rgba(233,30,140,0.12)',
              },
              {
                label: 'Attendance Today', value: '94.2%',
                icon: (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
                color: '#10B981', bg: 'rgba(16,185,129,0.12)',
              },
              {
                label: 'Fees Collected', value: '$48,200',
                icon: (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
                color: '#FF6B35', bg: 'rgba(255,107,53,0.12)',
              },
              {
                label: 'Pending Alerts', value: '3',
                icon: (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>),
                color: '#9333EA', bg: 'rgba(147,51,234,0.12)',
              },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 12, padding: '1rem', color }}>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: `${color}22` }}>{icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '0 1.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {[
              'Class 10-A: 28/30 present',
              'Fee reminder sent to 12 parents',
              'New student enrolled: Ali Hassan',
              'Salary processed for 24 teachers',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  </section>
);

/* ─── Stats Band ───────────────────────────────────────────── */

const StatsSection = () => (
  <section style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%)', padding: '3.5rem 1rem' }}>
    <div className="max-w-7xl mx-auto px-4">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center', color: '#fff' }}>
        {STATS.map(({ value, label }, i) => (
          <FadeIn key={label} delay={i * 80}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{label}</div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Features (strip cards, light bg) ─────────────────────── */

const FeaturesSection = () => (
  <SectionContainer bg="bg-[#F9FAFB]" id="features">
    <SectionHeader
      eyebrow="Features"
      title="Everything your school needs, nothing it doesn't"
      subtitle="Purpose-built for educational institutions — from small coaching centers to large multi-campus schools."
    />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
      {FEATURES.map((f, i) => (
        <FeatureStripCard key={f.title} {...f} delay={i * 55} />
      ))}
    </div>
  </SectionContainer>
);

/* ─── How It Works ─────────────────────────────────────────── */

const HowItWorksSection = () => (
  <SectionContainer bg="bg-white" id="how-it-works">
    <SectionHeader
      eyebrow="How It Works"
      title="Up and running in one afternoon"
      subtitle="No lengthy onboarding. No IT consultants. No setup fees."
    />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', position: 'relative' }}>
      {/* connector line */}
      <div style={{ position: 'absolute', top: 40, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(to right, rgba(233,30,140,0.2), rgba(255,107,53,0.2))', zIndex: 0 }} />

      {STEPS.map(({ step, title, description, icon }, i) => (
        <FadeIn key={step} delay={i * 100}>
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'linear-gradient(135deg, #E91E8C, #FF6B35)',
                boxShadow: '0 8px 24px rgba(233,30,140,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', margin: '0 auto 1.25rem',
              }}
            >
              {icon}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E91E8C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Step {step}</div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.65 }}>{description}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  </SectionContainer>
);

/* ─── Testimonials (dark bg like Framer template) ──────────── */

const TestimonialsSection = () => (
  <section style={{ background: '#0A0A0F', padding: '6rem 1rem', position: 'relative', overflow: 'hidden' }}>
    {/* Glow orbs */}
    <div style={{ position: 'absolute', top: -100, left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(233,30,140,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: -60, right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,107,53,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <FadeIn>
          <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#E91E8C', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.25)', padding: '0.3rem 0.875rem', borderRadius: 9999, marginBottom: '1.25rem' }}>
            Testimonials
          </span>
        </FadeIn>
        <FadeIn delay={80}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
            Loved by school administrators <span className="gradient-text-hero">worldwide</span>
          </h2>
        </FadeIn>
        <FadeIn delay={150}>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', fontSize: '1.0625rem' }}>
            Join thousands of institutions already running smarter with EduFlow Pro.
          </p>
        </FadeIn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {TESTIMONIALS.map(({ name, role, initials, gradientA, gradientB, quote, rating }, i) => (
          <FadeIn key={name} delay={i * 70}>
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: '1.75rem',
                position: 'relative',
                transition: 'background 0.3s, border-color 0.3s, transform 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(233,30,140,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Big quote mark */}
              <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '4rem', lineHeight: 1, fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${gradientA}, ${gradientB})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', opacity: 0.3 }}>"</span>

              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: '1rem' }}>
                {Array.from({ length: rating }).map((_, j) => (
                  <span key={j} style={{ color: '#F59E0B', fontSize: '0.875rem' }}>★</span>
                ))}
              </div>

              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{quote}"</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${gradientA}, ${gradientB})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.8125rem', fontWeight: 700,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{role}</div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Pricing Preview ──────────────────────────────────────── */

const PricingPreviewSection = ({ navigate }) => (
  <SectionContainer bg="bg-white">
    <SectionHeader
      eyebrow="Pricing"
      title="Simple, transparent pricing"
      subtitle="Start free, scale as you grow. No hidden fees, no surprises."
    />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: 900, margin: '0 auto 2.5rem' }}>
      {PRICING_PREVIEW.map(({ name, price, students, popular }) => (
        <div
          key={name}
          style={{
            background: '#fff',
            border: `2px solid ${popular ? '#E91E8C' : '#E5E7EB'}`,
            borderRadius: 20,
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            boxShadow: popular ? '0 8px 32px rgba(233,30,140,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
            transform: popular ? 'scale(1.04)' : 'none',
            transition: 'box-shadow 0.3s, transform 0.3s',
          }}
        >
          {popular && (
            <span
              style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #E91E8C, #FF6B35)',
                color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                padding: '0.25rem 0.875rem', borderRadius: 9999, whiteSpace: 'nowrap',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}
            >
              ✦ Most Popular
            </span>
          )}
          <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{name}</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>
            ${price}<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B7280' }}>/mo</span>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.5rem 0 1.25rem' }}>
            Up to {typeof students === 'number' ? students.toLocaleString() : students} students
          </p>
          <button
            onClick={() => navigate('/signup')}
            style={{
              width: '100%', padding: '0.75rem',
              background: popular ? 'linear-gradient(135deg, #E91E8C, #FF6B35)' : 'transparent',
              color: popular ? '#fff' : '#E91E8C',
              border: `1.5px solid ${popular ? 'transparent' : '#E91E8C'}`,
              borderRadius: 9999, fontWeight: 600, cursor: 'pointer',
              fontSize: '0.9375rem', transition: 'all 0.2s',
            }}
          >
            Get Started
          </button>
        </div>
      ))}
    </div>
    <div style={{ textAlign: 'center' }}>
      <Link to="/pricing" style={{ color: '#E91E8C', fontSize: '0.9375rem', fontWeight: 600 }}>
        View full pricing & feature comparison →
      </Link>
    </div>
  </SectionContainer>
);

/* ─── FAQ ──────────────────────────────────────────────────── */

const FAQItem = ({ q, a, index = 0 }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: '#fff',
        border: `1.5px solid ${open ? 'rgba(233,30,140,0.3)' : '#E5E7EB'}`,
        borderRadius: 16, overflow: 'hidden',
        transition: 'border-color 0.25s',
        boxShadow: open ? '0 4px 24px rgba(233,30,140,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem',
          padding: '1.25rem 1.5rem', background: 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: 1.45 }}>{q}</span>
        <span
          style={{
            flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
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
            color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.75,
            borderTop: '1px solid #F3F4F6', paddingTop: '1rem',
          }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQSection = () => (
  <SectionContainer bg="bg-[#F9FAFB]">
    <SectionHeader eyebrow="FAQ" title="Got Questions? We've Got Answers." subtitle="Everything you need to know before getting started." />
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {FAQS.map((item, i) => <FAQItem key={item.q} {...item} index={i} />)}
    </div>
  </SectionContainer>
);

/* ─── CTA Banner (dark) ────────────────────────────────────── */

const CTASection = ({ navigate }) => (
  <section style={{ background: '#0A0A0F', padding: '6rem 1rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse at center, rgba(233,30,140,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

    <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <FadeIn>
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}
        >
          Your School Deserves{' '}
          <span className="gradient-text-hero">Better Software</span>
        </h2>
      </FadeIn>
      <FadeIn delay={100}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem' }}>
          Join 10,000+ institutions already running smarter with EduFlow Pro. Start your free trial today.
        </p>
      </FadeIn>
      <FadeIn delay={180}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/signup')} className="btn-hero btn btn-xl">
            Start Free Trial — No Card Needed
          </button>
          <button onClick={() => navigate('/contact')} className="btn-ghost-dark btn btn-xl">
            Talk to Sales
          </button>
        </div>
      </FadeIn>
    </div>
  </section>
);

/* ─── Page ─────────────────────────────────────────────────── */

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <HeroSection navigate={navigate} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingPreviewSection navigate={navigate} />
      <FAQSection />
      <CTASection navigate={navigate} />
    </PublicLayout>
  );
};

export default HomePage;
