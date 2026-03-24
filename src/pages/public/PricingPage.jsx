import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import PricingCard from '../../components/public/PricingCard';
import SectionContainer, { SectionHeader } from '../../components/public/SectionContainer';
import Button from '../../components/public/Button';
import Reveal from '../../components/public/Reveal';

const PLANS = {
  starter: {
    name: 'Starter', tagline: 'Perfect for small schools',
    monthly: 29, yearly: 290,
    limits: { students: 100, teachers: 5, storage: 500 },
    features: ['Up to 100 students', 'Up to 5 teachers', 'Basic attendance tracking', 'Simple fee management', 'Email notifications', 'Basic reports & dashboard', 'Email support'],
    cta: 'Start Free Trial', note: '7-day free trial included', popular: false,
  },
  professional: {
    name: 'Professional', tagline: 'For growing institutions',
    monthly: 79, yearly: 790,
    limits: { students: 500, teachers: 25, storage: 2000 },
    features: ['Up to 500 students', 'Up to 25 teachers', 'Advanced attendance + fines', 'Bulk fee operations', 'Parent portal access', 'SMS & email notifications', 'Analytics & custom reports', 'Bulk Excel uploads', 'Priority support'],
    cta: 'Start Free Trial', note: '7-day free trial included', popular: true,
  },
  enterprise: {
    name: 'Enterprise', tagline: 'For large schools & chains',
    monthly: 199, yearly: 1990,
    limits: { students: -1, teachers: -1, storage: -1 },
    features: ['Unlimited students & teachers', 'Unlimited storage', 'Custom branding & white-label', 'SSO integration', 'API access', 'Custom integrations', 'Advanced security controls', 'Dedicated account manager', '24/7 priority support'],
    cta: 'Contact Sales', note: 'Custom onboarding included', popular: false,
  },
  district: {
    name: 'District', tagline: 'Multi-campus management',
    monthly: 499, yearly: 4990,
    limits: { students: -1, teachers: -1, storage: -1 },
    features: ['Everything in Enterprise', 'Multi-campus management', 'Centralized super-admin view', 'On-premise deployment option', 'Custom SLA agreement', 'Dedicated infrastructure', 'White-label solution', 'Custom contract & billing'],
    cta: 'Contact Sales', note: 'Custom pricing available', popular: false,
  },
};

const COMPARISON = [
  { feature: 'Students',            starter: '100',    professional: '500',      enterprise: 'Unlimited', district: 'Unlimited' },
  { feature: 'Teachers',            starter: '5',      professional: '25',       enterprise: 'Unlimited', district: 'Unlimited' },
  { feature: 'Storage',             starter: '500 MB', professional: '2 GB',     enterprise: 'Unlimited', district: 'Unlimited' },
  { feature: 'Attendance Tracking', starter: 'Basic',  professional: 'Advanced', enterprise: '✓',         district: '✓' },
  { feature: 'Fee Management',      starter: 'Basic',  professional: 'Full',     enterprise: '✓',         district: '✓' },
  { feature: 'Parent Portal',       starter: '—',      professional: '✓',        enterprise: '✓',         district: '✓' },
  { feature: 'Bulk Uploads',        starter: '—',      professional: '✓',        enterprise: '✓',         district: '✓' },
  { feature: 'Analytics',           starter: 'Basic',  professional: 'Advanced', enterprise: 'Custom',    district: 'Custom' },
  { feature: 'API Access',          starter: '—',      professional: '—',        enterprise: '✓',         district: '✓' },
  { feature: 'Custom Branding',     starter: '—',      professional: '—',        enterprise: '✓',         district: '✓' },
  { feature: 'SSO',                 starter: '—',      professional: '—',        enterprise: '✓',         district: '✓' },
  { feature: 'Multi-Campus',        starter: '—',      professional: '—',        enterprise: '—',         district: '✓' },
  { feature: 'Support',             starter: 'Email',  professional: 'Priority', enterprise: 'Dedicated', district: '24/7 SLA' },
];

const FAQS = [
  { q: 'Is there a free trial?', a: 'Yes! Every plan includes a 7-day free trial. No credit card required to start. You can cancel anytime during the trial.' },
  { q: 'Can I switch plans later?', a: "Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle." },
  { q: 'What happens when I exceed my student limit?', a: "You'll get a warning at 80% usage. When you hit the limit, you'll be prompted to upgrade before adding more students. Existing data is never affected." },
  { q: 'Is my data secure?', a: "Yes. Each school's data is completely isolated in its own database. We use JWT authentication, HTTPS, rate limiting, and industry security best practices." },
  { q: 'Do you offer discounts for NGOs or government schools?', a: 'Yes, we offer special pricing for non-profit educational institutions and government schools. Contact our sales team for details.' },
  { q: 'Can I export my data?', a: 'Yes. You can export all your data in Excel or PDF format at any time. Your data always belongs to you.' },
];

const BillingToggle = ({ interval, onChange }) => (
  <div className="flex items-center justify-center gap-4 mb-12">
    <span className={`text-sm font-semibold ${interval === 'month' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>Monthly</span>
    <button
      onClick={() => onChange(interval === 'month' ? 'year' : 'month')}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 ${interval === 'year' ? 'bg-[#7C3AED]' : 'bg-gray-300'}`}
      aria-label="Toggle billing interval"
    >
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${interval === 'year' ? 'translate-x-7' : ''}`} />
    </button>
    <span className={`text-sm font-semibold ${interval === 'year' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
      Yearly
      <span className="ml-2 bg-green-100 text-[#10B981] text-xs font-bold px-2 py-0.5 rounded-full">Save ~17%</span>
    </span>
  </div>
);

const PricingPage = () => {
  const [interval, setInterval] = useState('month');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (planKey) => {
    if (PLANS[planKey].cta === 'Contact Sales') { navigate('/contact'); return; }
    setLoadingPlan(planKey);
    setTimeout(() => { navigate('/signup'); setLoadingPlan(null); }, 600);
  };

  return (
    <PublicLayout>
      {/* Hero — cascade in */}
      <section className="pt-16 pb-4 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal variant="fade" duration={380}>
            <span className="inline-block text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">
              Pricing
            </span>
          </Reveal>
          <Reveal variant="hero" delay={70} duration={600}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] mb-4">
              Simple, transparent pricing
            </h1>
          </Reveal>
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto mb-10">
            Start free, scale as you grow. Every plan includes a 7-day trial with no credit card required.
          </p>
          <BillingToggle interval={interval} onChange={setInterval} />
        </div>
      </section>

      {/* Plans — only popular card gets scale animation */}
      <SectionContainer bg="bg-white" className="pt-4">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {Object.entries(PLANS).map(([key, plan]) =>
            plan.popular ? (
              <Reveal key={key} variant="scale" duration={500}>
                <PricingCard planKey={key} plan={plan} interval={interval} isPopular onSelect={handleSelect} loading={loadingPlan === key} />
              </Reveal>
            ) : (
              <PricingCard key={key} planKey={key} plan={plan} interval={interval} isPopular={false} onSelect={handleSelect} loading={loadingPlan === key} />
            )
          )}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[#6B7280]">
          {['🔒 SSL Encrypted', '✅ GDPR Compliant', '💳 Secure Payments via Stripe', '🔄 Cancel Anytime', '📞 24/7 Support'].map(b => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </SectionContainer>

      {/* Comparison table — no animation, it's a data table */}
      <SectionContainer bg="bg-[#F9FAFB]">
        <SectionHeader eyebrow="Compare Plans" title="Full feature comparison" subtitle="See exactly what's included in each plan before you decide." />
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 font-semibold text-[#374151] w-1/3">Feature</th>
                {['Starter', 'Professional', 'Enterprise', 'District'].map(p => (
                  <th key={p} className={`px-4 py-4 font-bold text-center ${p === 'Professional' ? 'text-[#7C3AED]' : 'text-[#374151]'}`}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(({ feature, starter, professional, enterprise, district }, i) => (
                <tr key={feature} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-6 py-3.5 font-medium text-[#374151]">{feature}</td>
                  {[starter, professional, enterprise, district].map((val, j) => (
                    <td key={j} className={`px-4 py-3.5 text-center ${val === '—' ? 'text-gray-300' : val === '✓' ? 'text-[#10B981] font-bold text-base' : 'text-[#374151]'}`}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionContainer>

      {/* FAQ — no animation on list items */}
      <SectionContainer bg="bg-white">
        <SectionHeader eyebrow="FAQ" title="Frequently asked questions" subtitle="Everything you need to know about EduFlow Pro pricing." />
        <div className="max-w-3xl mx-auto grid gap-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-[#F9FAFB] rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-[#111827] mb-2">{q}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <Reveal variant="hero" duration={580}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Still have questions?</h2>
          </Reveal>
          <p className="text-blue-100 mb-8">Our team is happy to walk you through the right plan for your institution.</p>
          <Reveal variant="up" delay={120} duration={440}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" onClick={() => navigate('/signup')}>Start Free Trial</Button>
              <Button size="lg" className="border-2 border-white/40 text-white hover:bg-white/10 bg-transparent" onClick={() => navigate('/contact')}>
                Talk to Sales
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PricingPage;
