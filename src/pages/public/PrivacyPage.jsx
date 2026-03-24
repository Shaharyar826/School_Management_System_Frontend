import PublicLayout from '../../components/public/PublicLayout';
import Reveal from '../../components/public/Reveal';

const SECTIONS = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: [
      {
        subtitle: '1.1 Information You Provide',
        text: 'When you register for EduFlow Pro, we collect information you provide directly, including: school name, administrator name and email address, billing information (processed securely by Stripe), and school configuration data such as student and staff records you import.',
      },
      {
        subtitle: '1.2 Information Collected Automatically',
        text: 'We automatically collect certain information when you use our platform: IP address, browser type and version, pages visited and time spent, device information, and usage patterns to improve our service.',
      },
      {
        subtitle: '1.3 Student & Staff Data',
        text: 'As a school management platform, you may upload student and staff records. This data is processed on your behalf as a data processor. You remain the data controller for all student and staff information uploaded to your account.',
      },
    ],
  },
  {
    id: 'usage',
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: '2.1 Service Delivery',
        text: 'We use your information to provide, maintain, and improve EduFlow Pro, process transactions, send service-related communications, and respond to your support requests.',
      },
      {
        subtitle: '2.2 Platform Improvement',
        text: 'We analyze aggregated, anonymized usage data to understand how our platform is used and to develop new features. We never sell your personal data or use student data for advertising purposes.',
      },
      {
        subtitle: '2.3 Legal Compliance',
        text: 'We may use your information to comply with applicable laws and regulations, enforce our Terms of Service, and protect the rights and safety of our users.',
      },
    ],
  },
  {
    id: 'sharing',
    title: '3. Data Sharing & Disclosure',
    content: [
      {
        subtitle: '3.1 We Do Not Sell Your Data',
        text: 'EduFlow Pro does not sell, rent, or trade your personal information or your students\' data to third parties for marketing or any other commercial purposes.',
      },
      {
        subtitle: '3.2 Service Providers',
        text: 'We share data with trusted service providers who assist in operating our platform: Stripe for payment processing, MongoDB Atlas for database hosting, and Cloudinary for file storage. All providers are contractually bound to protect your data.',
      },
      {
        subtitle: '3.3 Legal Requirements',
        text: 'We may disclose information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights or the safety of our users.',
      },
    ],
  },
  {
    id: 'security',
    title: '4. Data Security',
    content: [
      {
        subtitle: '4.1 Technical Safeguards',
        text: 'We implement industry-standard security measures including: TLS/SSL encryption for all data in transit, AES-256 encryption for sensitive data at rest, multi-tenant database isolation ensuring your data is never mixed with other schools\' data, JWT-based authentication with secure token management, and rate limiting to prevent brute-force attacks.',
      },
      {
        subtitle: '4.2 Access Controls',
        text: 'Access to your data is strictly controlled through role-based permissions. Only authorized personnel within your institution can access your data, based on the roles you assign.',
      },
      {
        subtitle: '4.3 Breach Notification',
        text: 'In the unlikely event of a data breach affecting your information, we will notify you within 72 hours of becoming aware of the breach, as required by applicable data protection laws.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '5. Cookies & Tracking',
    content: [
      {
        subtitle: '5.1 Essential Cookies',
        text: 'We use essential cookies to maintain your login session and ensure the platform functions correctly. These cannot be disabled as they are necessary for the service.',
      },
      {
        subtitle: '5.2 Analytics Cookies',
        text: 'With your consent, we use analytics cookies to understand how you use our platform. This helps us improve the user experience. You can opt out of analytics cookies in your account settings.',
      },
      {
        subtitle: '5.3 Managing Cookies',
        text: 'You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of EduFlow Pro.',
      },
    ],
  },
  {
    id: 'rights',
    title: '6. Your Rights',
    content: [
      {
        subtitle: '6.1 Data Access & Portability',
        text: 'You have the right to access all data we hold about your institution and to export it in a machine-readable format at any time. Use the export feature in your dashboard or contact us at privacy@eduflowpro.com.',
      },
      {
        subtitle: '6.2 Data Deletion',
        text: 'You may request deletion of your account and all associated data at any time. Upon account closure, we will delete your data within 30 days, except where retention is required by law.',
      },
      {
        subtitle: '6.3 GDPR Rights',
        text: 'If you are located in the European Economic Area, you have additional rights under GDPR including the right to rectification, restriction of processing, and the right to lodge a complaint with a supervisory authority.',
      },
    ],
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: [
      {
        subtitle: '7.1 Active Accounts',
        text: 'We retain your data for as long as your account is active or as needed to provide you with our services.',
      },
      {
        subtitle: '7.2 Account Closure',
        text: 'After account closure, we retain data for 30 days to allow for account recovery, after which it is permanently deleted from our systems.',
      },
    ],
  },
  {
    id: 'contact',
    title: '8. Contact Us',
    content: [
      {
        subtitle: 'Privacy Inquiries',
        text: 'For any privacy-related questions or to exercise your rights, contact our Data Protection Officer at: privacy@eduflowpro.com or write to us at EduFlow Pro, 123 Education Lane, San Francisco, CA 94102.',
      },
    ],
  },
];

const PrivacyPage = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="pt-16 pb-12 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <span className="inline-block text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">
          Legal
        </span>
        <Reveal variant="hero" delay={40} duration={580}>
          <h1 className="text-4xl font-extrabold text-[#111827] mb-4">Privacy Policy</h1>
        </Reveal>
        <p className="text-[#6B7280]">
          Last updated: <strong>January 1, 2025</strong>
        </p>
        <p className="text-sm text-[#6B7280] mt-3 max-w-xl mx-auto">
          EduFlow Pro is committed to protecting your privacy and the privacy of your students. This policy explains how we collect, use, and protect your information.
        </p>
      </div>
    </section>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sticky TOC */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Contents</p>
            <nav className="space-y-1">
              {SECTIONS.map(({ id, title }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-sm text-[#374151] hover:text-[#2563EB] py-1 transition-colors"
                >
                  {title.split('. ')[1] || title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 max-w-3xl">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
            <strong>Summary:</strong> We collect only what we need, never sell your data, keep student information strictly confidential, and give you full control over your data.
          </div>

          <div className="space-y-10">
            {SECTIONS.map(({ id, title, content }) => (
              <section key={id} id={id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-[#111827] mb-4 pb-2 border-b border-gray-100">{title}</h2>
                <div className="space-y-5">
                  {content.map(({ subtitle, text }) => (
                    <div key={subtitle}>
                      <h3 className="font-semibold text-[#374151] mb-1.5">{subtitle}</h3>
                      <p className="text-[#6B7280] text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  </PublicLayout>
);

export default PrivacyPage;
