import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import SectionContainer, { SectionHeader } from '../../components/public/SectionContainer';
import Reveal from '../../components/public/Reveal';

const VALUES = [
  { icon: '🎯', title: 'Education First', description: "Every feature we build starts with one question: does this help educators do their job better?" },
  { icon: '🔒', title: 'Security & Privacy', description: "Your school's data is sacred. We use enterprise-grade security and complete tenant isolation." },
  { icon: '⚡', title: 'Simplicity', description: "Powerful software doesn't have to be complicated. We obsess over making complex things simple." },
  { icon: '🤝', title: 'Partnership', description: "We're not just a vendor — we're a long-term partner invested in your institution's success." },
];

const WHY_US = [
  { icon: '🏗️', title: 'Built for Scale', description: 'Multi-tenant architecture means your data is isolated and the platform scales with you — from 50 students to 50,000.' },
  { icon: '🚀', title: 'Fast Onboarding', description: 'Most schools are fully operational within one afternoon. Our guided setup and bulk import tools eliminate weeks of data entry.' },
  { icon: '💡', title: 'Continuous Innovation', description: "We ship new features every month based on real feedback from school administrators. You're always on the latest version." },
  { icon: '🌍', title: 'Global & Local', description: 'Designed for international use but sensitive to local needs — multi-currency, multi-language support coming soon.' },
  { icon: '📱', title: 'Mobile Ready', description: 'Fully responsive design means teachers can mark attendance and admins can check reports from any device.' },
  { icon: '🛡️', title: 'Compliance Ready', description: 'GDPR-compliant data handling, audit trails, and role-based access controls keep you covered.' },
];

const TEAM = [
  { name: 'Ahmed Raza',  role: 'CEO & Co-Founder',         avatar: 'AR', bg: 'from-blue-500 to-blue-600',    bio: 'Former school principal turned tech entrepreneur. 15 years in education.' },
  { name: 'Fatima Khan', role: 'CTO & Co-Founder',         avatar: 'FK', bg: 'from-purple-500 to-purple-600', bio: 'Full-stack engineer with a passion for EdTech and scalable systems.' },
  { name: 'Omar Sheikh', role: 'Head of Product',          avatar: 'OS', bg: 'from-green-500 to-green-600',   bio: 'Product designer who spent 5 years building software for schools in South Asia.' },
  { name: 'Aisha Malik', role: 'Head of Customer Success', avatar: 'AM', bg: 'from-orange-500 to-orange-600', bio: 'Dedicated to ensuring every school gets maximum value from EduFlow Pro.' },
];

const PROBLEMS = [
  { pain: 'Fee collection is manual, error-prone, and takes days every month',           solution: 'Automated billing with one-click receipts and arrears tracking' },
  { pain: 'Attendance is tracked on paper registers that get lost or damaged',            solution: 'Digital attendance with real-time reports and parent notifications' },
  { pain: 'Student data lives in 5 different Excel files with no single source of truth', solution: 'Unified student profiles with complete history and bulk import' },
  { pain: 'Staff salaries are calculated manually with frequent errors',                  solution: 'Automated payroll with configurable deductions and payment tracking' },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero — spring on headline only */}
      <section className="pt-16 pb-20 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal variant="fade" duration={380}>
            <span className="inline-block text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">
              About Us
            </span>
          </Reveal>
          <Reveal variant="hero" delay={75} duration={640}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-6">
              We're on a mission to{' '}
              <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                modernize education management
              </span>
            </h1>
          </Reveal>
          <p className="text-lg text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
            EduFlow Pro was born from a simple frustration: school administrators were drowning in spreadsheets,
            paper registers, and disconnected tools. We built the platform we wished existed.
          </p>
        </div>
      </section>

      {/* Mission & Vision — slide from opposite sides (contextually meaningful) */}
      <SectionContainer bg="bg-white">
        <div className="grid md:grid-cols-2 gap-8">
          <Reveal variant="right" duration={580}>
            <Card className="border-l-4 border-[#2563EB]">
              <div className="text-3xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-[#111827] mb-3">Our Mission</h2>
              <p className="text-[#6B7280] leading-relaxed">
                To empower every educational institution — regardless of size or budget — with the tools they need
                to operate efficiently, communicate effectively, and focus on what matters most: student success.
              </p>
            </Card>
          </Reveal>
          <Reveal variant="left" delay={80} duration={580}>
            <Card className="border-l-4 border-[#7C3AED]">
              <div className="text-3xl mb-4">🔭</div>
              <h2 className="text-2xl font-bold text-[#111827] mb-3">Our Vision</h2>
              <p className="text-[#6B7280] leading-relaxed">
                A world where every school, from a small coaching center in Lahore to a large university in London,
                has access to enterprise-grade management software that's affordable, intuitive, and built for their reality.
              </p>
            </Card>
          </Reveal>
        </div>
      </SectionContainer>

      {/* Problem/Solution — no animation, it's a content list */}
      <SectionContainer bg="bg-[#F9FAFB]">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            eyebrow="The Problem We Solve"
            title="Schools are still running on spreadsheets"
            subtitle="We've talked to hundreds of school administrators. Here's what we heard:"
          />
          <div className="space-y-4">
            {PROBLEMS.map(({ pain, solution }) => (
              <div key={pain} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-red-400 text-lg flex-shrink-0">✗</span>
                  <p className="text-[#374151] font-medium text-sm">{pain}</p>
                </div>
                <div className="flex items-start gap-3 ml-7">
                  <span className="text-[#10B981] text-lg flex-shrink-0">✓</span>
                  <p className="text-[#10B981] text-sm font-medium">{solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* Values — no animation on 4 small cards */}
      <SectionContainer bg="bg-white">
        <SectionHeader
          eyebrow="Our Values"
          title="What we stand for"
          subtitle="These principles guide every decision we make — from product features to customer support."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon, title, description }) => (
            <Card key={title} className="text-center">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-bold text-[#111827] mb-2">{title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* Why Choose Us — only the section header animates */}
      <SectionContainer bg="bg-[#F9FAFB]">
        <SectionHeader
          eyebrow="Why EduFlow Pro"
          title="Built different, for a reason"
          subtitle="We didn't just build another school management system. We rethought it from the ground up."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_US.map(({ icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-[#111827] mb-1">{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* Team — no animation, just clean cards */}
      <SectionContainer bg="bg-white">
        <SectionHeader
          eyebrow="Our Team"
          title="The people behind EduFlow Pro"
          subtitle="A small, passionate team with deep roots in education and technology."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map(({ name, role, avatar, bg, bio }) => (
            <Card key={name} className="text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg`}>
                {avatar}
              </div>
              <h3 className="font-bold text-[#111827]">{name}</h3>
              <p className="text-xs font-semibold text-[#2563EB] mb-2">{role}</p>
              <p className="text-xs text-[#6B7280] leading-relaxed">{bio}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <Reveal variant="hero" duration={580}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Join our growing community</h2>
          </Reveal>
          <p className="text-blue-100 mb-8">10,000+ schools trust EduFlow Pro. Start your free trial today.</p>
          <Reveal variant="up" delay={130} duration={440}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" onClick={() => navigate('/signup')}>Get Started Free</Button>
              <Button size="lg" className="border-2 border-white/40 text-white hover:bg-white/10 bg-transparent" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;
