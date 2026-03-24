import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import FeatureCard from '../../components/public/FeatureCard';
import SectionContainer, { SectionHeader } from '../../components/public/SectionContainer';
import Reveal from '../../components/public/Reveal';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '👥', title: 'Student Management', description: 'Complete student lifecycle — enrollment, profiles, bulk uploads, and historical records all in one place.', accent: 'blue' },
  { icon: '🧑🏫', title: 'Teacher & Staff Portal', description: 'Manage teachers, admin staff, and support staff with role-based access and payroll automation.', accent: 'purple' },
  { icon: '📋', title: 'Attendance Tracking', description: 'Real-time attendance with absence fine calculations, reports, and parent notifications.', accent: 'green' },
  { icon: '💰', title: 'Fee Management', description: 'Automated billing cycles, arrears support, receipts, and financial reporting — zero manual work.', accent: 'orange' },
  { icon: '📊', title: 'Analytics & Reports', description: 'Role-based dashboards with real-time insights, financial summaries, and usage metrics.', accent: 'blue' },
  { icon: '📢', title: 'Communication Hub', description: 'Events, notices, meetings, and SMS/email notifications to keep everyone connected.', accent: 'purple' },
  { icon: '🔒', title: 'Enterprise Security', description: 'JWT auth, rate limiting, CORS protection, and complete multi-tenant data isolation.', accent: 'green' },
  { icon: '⚡', title: 'Bulk Operations', description: 'Upload hundreds of students, teachers, or staff via Excel with automatic validation.', accent: 'orange' },
  { icon: '🌐', title: 'Multi-Tenant SaaS', description: 'Each school gets its own isolated environment, custom branding, and subdomain.', accent: 'blue' },
];

const STEPS = [
  { step: '01', title: 'Sign Up in Minutes', description: 'Create your school account, choose your plan, and get your custom subdomain instantly. No IT team needed.', icon: '🚀' },
  { step: '02', title: 'Configure Your School', description: 'Add your branding, set up classes, and invite your staff. Our guided onboarding makes it effortless.', icon: '⚙️' },
  { step: '03', title: 'Import Your Data', description: 'Bulk upload students, teachers, and historical records via Excel. We handle the heavy lifting.', icon: '📤' },
  { step: '04', title: 'Run Your School', description: 'Manage attendance, fees, salaries, and communications from one unified dashboard.', icon: '🎓' },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Sarah Ahmed',
    role: 'Principal, Greenfield Academy',
    avatar: 'SA',
    avatarBg: 'from-blue-500 to-blue-600',
    quote: 'EduFlow Pro transformed how we manage our 800-student school. Fee collection alone saves us 20 hours a month. The bulk upload feature is a game-changer.',
    rating: 5,
  },
  {
    name: 'Muhammad Tariq',
    role: 'Admin, City Public School',
    avatar: 'MT',
    avatarBg: 'from-purple-500 to-purple-600',
    quote: 'We switched from spreadsheets to EduFlow Pro in one weekend. The attendance tracking and parent notifications have dramatically reduced absenteeism.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Director, Sunrise Institute',
    avatar: 'PS',
    avatarBg: 'from-green-500 to-green-600',
    quote: 'The multi-tenant architecture means our 3 campuses each have their own space but I can see everything from one super-admin view. Absolutely brilliant.',
    rating: 5,
  },
];

const PRICING_PREVIEW = [
  { name: 'Starter',      price: 29,  students: 100,         popular: false, color: 'border-blue-200' },
  { name: 'Professional', price: 79,  students: 500,         popular: true,  color: 'border-purple-400' },
  { name: 'Enterprise',   price: 199, students: 'Unlimited', popular: false, color: 'border-green-200' },
];

const STATS = [
  { value: '10,000+', label: 'Schools Onboarded' },
  { value: '2M+',     label: 'Students Managed' },
  { value: '50+',     label: 'Countries' },
  { value: '99.9%',   label: 'Uptime SLA' },
];

// ─── Stat counter — counts up when visible ────────────────────────────────────
const AnimatedStat = ({ value, label, delay }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.unobserve(el); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms,
                     transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      <div className="text-4xl font-extrabold mb-1">{value}</div>
      <div className="text-blue-100 text-sm font-medium">{label}</div>
    </div>
  );
};

// ─── Sections ─────────────────────────────────────────────────────────────────

const HeroSection = ({ navigate }) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] pt-12 pb-24">
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2563EB]/8 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#7C3AED]/8 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Badge — fades in first */}
      <Reveal variant="fade" duration={350}>
        <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-1.5 text-sm font-medium text-[#2563EB] shadow-sm mb-8">
          <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
          Now with AI-powered attendance insights
        </div>
      </Reveal>

      {/* Headline — spring easing, the money moment */}
      <Reveal variant="hero" delay={80} duration={650}>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#111827] leading-[1.08] tracking-tight mb-6">
          The Smartest Way to{' '}
          <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
            Run Your School
          </span>
        </h1>
      </Reveal>

      {/* Subhead — gentle up, slightly later */}
      <Reveal variant="up" delay={200} duration={500}>
        <p className="text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10">
          EduFlow Pro is the all-in-one SaaS platform that handles students, staff, fees, attendance,
          and communications — so you can focus on education.
        </p>
      </Reveal>

      {/* CTAs — same wave as subhead */}
      <Reveal variant="up" delay={290} duration={480}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button variant="primary" size="xl" onClick={() => navigate('/signup')}>
            Start 7-Day Free Trial →
          </Button>
          <Button variant="outline" size="xl" onClick={() => navigate('/pricing')}>
            View Pricing
          </Button>
        </div>
        <p className="text-sm text-[#9CA3AF]">No credit card required · Setup in under 5 minutes · Cancel anytime</p>
      </Reveal>

      {/* Dashboard mockup — fades up last, slower */}
      <Reveal variant="up" delay={420} duration={700} threshold={0.05}>
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] h-10 flex items-center px-4 gap-2">
              <span className="w-3 h-3 rounded-full bg-white/30" />
              <span className="w-3 h-3 rounded-full bg-white/30" />
              <span className="w-3 h-3 rounded-full bg-white/30" />
              <span className="ml-4 text-white/70 text-xs font-mono">app.eduflowpro.com/dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Students',   value: '1,248',   icon: '👥', color: 'bg-blue-50 text-[#2563EB]' },
                { label: 'Attendance Today', value: '94.2%',   icon: '✅', color: 'bg-green-50 text-[#10B981]' },
                { label: 'Fees Collected',   value: '$48,200', icon: '💰', color: 'bg-purple-50 text-[#7C3AED]' },
                { label: 'Pending Alerts',   value: '3',       icon: '🔔', color: 'bg-orange-50 text-[#F59E0B]' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className={`rounded-xl p-4 ${color}`}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs font-medium opacity-70">{label}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Class 10-A: 28/30 present',
                'Fee reminder sent to 12 parents',
                'New student enrolled: Ali Hassan',
                'Salary processed for 24 teachers',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#374151] bg-gray-50 rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

// Stats — each number has a slightly irregular delay (not i*90)
const STAT_DELAYS = [0, 110, 195, 305];

const StatsSection = () => (
  <section className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] py-14">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
        {STATS.map(({ value, label }, i) => (
          <AnimatedStat key={label} value={value} label={label} delay={STAT_DELAYS[i]} />
        ))}
      </div>
    </div>
  </section>
);

// Features — NO animation on the grid. Too many items, looks mechanical.
// Only the section header animates (handled by SectionHeader itself).
const FeaturesSection = () => (
  <SectionContainer bg="bg-[#F9FAFB]" id="features">
    <SectionHeader
      eyebrow="Features"
      title="Everything your school needs, nothing it doesn't"
      subtitle="Purpose-built for educational institutions — from small coaching centers to large multi-campus schools."
    />
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
    </div>
  </SectionContainer>
);

// How it works — steps slide up with irregular delays
const STEP_DELAYS = [0, 130, 240, 330];

const HowItWorksSection = () => (
  <SectionContainer bg="bg-white">
    <SectionHeader
      eyebrow="How It Works"
      title="Up and running in one afternoon"
      subtitle="No lengthy onboarding. No IT consultants. Just sign up and start managing your school."
    />
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {STEPS.map(({ step, title, description, icon }, i) => (
        <Reveal key={step} variant="up" delay={STEP_DELAYS[i]} duration={540}>
          <div className="relative">
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#2563EB]/25 to-transparent z-0" />
            )}
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-200">
                {icon}
              </div>
              <div className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-2">Step {step}</div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">{title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </SectionContainer>
);

// Testimonials — first slides from left, last from right, middle fades up
const TestimonialsSection = () => (
  <SectionContainer bg="bg-[#F9FAFB]">
    <SectionHeader
      eyebrow="Testimonials"
      title="Loved by school administrators worldwide"
      subtitle="Join thousands of institutions that have transformed their operations with EduFlow Pro."
    />
    <div className="grid md:grid-cols-3 gap-6">
      {TESTIMONIALS.map(({ name, role, avatar, avatarBg, quote, rating }, i) => {
        const variant = i === 0 ? 'right' : i === 2 ? 'left' : 'up';
        const delay   = i === 0 ? 0 : i === 1 ? 120 : 60;
        return (
          <Reveal key={name} variant={variant} delay={delay} duration={560}>
            <Card className="flex flex-col h-full">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, j) => (
                  <span key={j} className="text-[#F59E0B] text-lg">★</span>
                ))}
              </div>
              <p className="text-[#374151] text-sm leading-relaxed flex-1 mb-6">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#111827] text-sm">{name}</div>
                  <div className="text-xs text-[#6B7280]">{role}</div>
                </div>
              </div>
            </Card>
          </Reveal>
        );
      })}
    </div>
  </SectionContainer>
);

// Pricing preview — popular card scales in, others just appear
const PricingPreviewSection = ({ navigate }) => (
  <SectionContainer bg="bg-white">
    <SectionHeader
      eyebrow="Pricing"
      title="Simple, transparent pricing"
      subtitle="Start free, scale as you grow. No hidden fees, no surprises."
    />
    <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
      {PRICING_PREVIEW.map(({ name, price, students, popular, color }) => (
        popular ? (
          <Reveal key={name} variant="scale" duration={520}>
            <div className={`relative border-2 ${color} rounded-2xl p-6 text-center shadow-xl bg-white`}>
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </span>
              <h3 className="font-bold text-[#111827] mb-2">{name}</h3>
              <div className="text-3xl font-extrabold text-[#111827] mb-1">${price}<span className="text-base font-normal text-[#6B7280]">/mo</span></div>
              <p className="text-sm text-[#6B7280] mb-4">Up to {students.toLocaleString()} students</p>
              <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/signup')}>Get Started</Button>
            </div>
          </Reveal>
        ) : (
          <div key={name} className={`relative border-2 ${color} rounded-2xl p-6 text-center shadow-sm bg-white`}>
            <h3 className="font-bold text-[#111827] mb-2">{name}</h3>
            <div className="text-3xl font-extrabold text-[#111827] mb-1">${price}<span className="text-base font-normal text-[#6B7280]">/mo</span></div>
            <p className="text-sm text-[#6B7280] mb-4">Up to {typeof students === 'number' ? students.toLocaleString() : students} students</p>
            <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        )
      ))}
    </div>
    <div className="text-center">
      <Link to="/pricing" className="text-[#2563EB] font-semibold hover:underline text-sm">
        View full pricing & feature comparison →
      </Link>
    </div>
  </SectionContainer>
);

// CTA — headline springs in, buttons fade up
const CTASection = ({ navigate }) => (
  <section className="py-24 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
    </div>
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
      <Reveal variant="hero" duration={600}>
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
          Ready to modernize your school?
        </h2>
      </Reveal>
      <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">
        Join 10,000+ institutions already running smarter with EduFlow Pro. Start your free trial today.
      </p>
      <Reveal variant="up" delay={140} duration={460}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="white" size="xl" onClick={() => navigate('/signup')}>
            Start Free Trial — No Card Needed
          </Button>
          <Button
            size="xl"
            className="border-2 border-white/40 text-white hover:bg-white/10 bg-transparent"
            onClick={() => navigate('/contact')}
          >
            Talk to Sales
          </Button>
        </div>
      </Reveal>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

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
      <CTASection navigate={navigate} />
    </PublicLayout>
  );
};

export default HomePage;
