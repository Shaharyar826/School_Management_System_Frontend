import PublicLayout from '../../components/public/PublicLayout';
import Reveal from '../../components/public/Reveal';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: 'By accessing or using EduFlow Pro ("the Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms. If you do not agree to these Terms, do not use the Service.',
  },
  {
    id: 'service',
    title: '2. Description of Service',
    content: 'EduFlow Pro is a cloud-based school management platform that provides tools for managing students, staff, attendance, fees, and communications. The Service is provided on a subscription basis with different tiers offering varying features and usage limits. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice.',
  },
  {
    id: 'accounts',
    title: '3. Account Registration & Security',
    subsections: [
      { title: '3.1 Account Creation', text: 'To use EduFlow Pro, you must create an account by providing accurate and complete information. Each school or institution requires a separate account (tenant). You are responsible for maintaining the confidentiality of your login credentials.' },
      { title: '3.2 Account Security', text: 'You are responsible for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized use of your account.' },
      { title: '3.3 Account Eligibility', text: 'You must be at least 18 years old and have the legal authority to enter into contracts on behalf of your institution to create an account.' },
    ],
  },
  {
    id: 'subscription',
    title: '4. Subscription & Billing',
    subsections: [
      { title: '4.1 Subscription Plans', text: 'EduFlow Pro offers multiple subscription tiers (Starter, Professional, Enterprise, District). Each plan has defined usage limits and features as described on our Pricing page. You agree to use the Service within the limits of your chosen plan.' },
      { title: '4.2 Payment Terms', text: 'Subscription fees are billed in advance on a monthly or annual basis. All payments are processed securely through Stripe. By providing payment information, you authorize us to charge your payment method for all fees incurred.' },
      { title: '4.3 Free Trial', text: 'New accounts receive a 7-day free trial. No credit card is required to start a trial. At the end of the trial period, you must subscribe to a paid plan to continue using the Service. Trial accounts that are not converted will be automatically deactivated.' },
      { title: '4.4 Refund Policy', text: 'We offer a 14-day money-back guarantee for new paid subscriptions. After 14 days, subscription fees are non-refundable. If you cancel your subscription, you will retain access until the end of your current billing period.' },
      { title: '4.5 Price Changes', text: 'We reserve the right to change subscription prices with 30 days\' notice. Price changes will not affect your current billing period. Continued use of the Service after a price change constitutes acceptance of the new pricing.' },
    ],
  },
  {
    id: 'data',
    title: '5. Data Ownership & Privacy',
    subsections: [
      { title: '5.1 Your Data', text: 'You retain full ownership of all data you upload to EduFlow Pro, including student records, staff information, and financial data. We process this data on your behalf as a data processor.' },
      { title: '5.2 Data Processing', text: 'By using EduFlow Pro, you grant us a limited license to process your data solely for the purpose of providing the Service. We will not use your data for any other purpose without your explicit consent.' },
      { title: '5.3 Data Export', text: 'You may export your data at any time in standard formats (Excel, PDF). Upon account termination, you have 30 days to export your data before it is permanently deleted.' },
    ],
  },
  {
    id: 'acceptable-use',
    title: '6. Acceptable Use Policy',
    content: 'You agree not to use EduFlow Pro to: (a) violate any applicable laws or regulations; (b) upload malicious code, viruses, or harmful content; (c) attempt to gain unauthorized access to our systems or other users\' accounts; (d) use the Service to harass, abuse, or harm others; (e) reverse engineer or attempt to extract the source code of our software; (f) resell or sublicense the Service without our written permission; (g) use automated tools to scrape or extract data from the platform.',
  },
  {
    id: 'ip',
    title: '7. Intellectual Property',
    subsections: [
      { title: '7.1 Our IP', text: 'EduFlow Pro, including its software, design, trademarks, and content, is owned by us and protected by intellectual property laws. You may not copy, modify, or distribute our software or content without written permission.' },
      { title: '7.2 Your IP', text: 'You retain all intellectual property rights in the content and data you upload to the Service. By uploading content, you grant us a limited license to use it solely to provide the Service.' },
    ],
  },
  {
    id: 'liability',
    title: '8. Limitation of Liability',
    content: 'To the maximum extent permitted by law, EduFlow Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service. Our total liability for any claim arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim. Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.',
  },
  {
    id: 'warranty',
    title: '9. Disclaimer of Warranties',
    content: 'The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely secure. We make no warranty regarding the accuracy or reliability of any information obtained through the Service.',
  },
  {
    id: 'termination',
    title: '10. Termination',
    subsections: [
      { title: '10.1 By You', text: 'You may cancel your subscription at any time through your account settings or by contacting us. Cancellation takes effect at the end of your current billing period.' },
      { title: '10.2 By Us', text: 'We may suspend or terminate your account immediately if you violate these Terms, fail to pay subscription fees, or engage in fraudulent activity. We will provide notice where reasonably possible.' },
      { title: '10.3 Effect of Termination', text: 'Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days after termination to allow for data export, after which it will be permanently deleted.' },
    ],
  },
  {
    id: 'governing',
    title: '11. Governing Law & Disputes',
    content: 'These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved through binding arbitration in San Francisco, California, except that either party may seek injunctive relief in court for intellectual property violations.',
  },
  {
    id: 'changes',
    title: '12. Changes to Terms',
    content: 'We may update these Terms from time to time. We will notify you of material changes via email or a prominent notice in the Service at least 30 days before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the updated Terms.',
  },
  {
    id: 'contact-legal',
    title: '13. Contact Information',
    content: 'For questions about these Terms, contact us at: legal@eduflowpro.com or EduFlow Pro, 123 Education Lane, San Francisco, CA 94102, USA.',
  },
];

const TermsPage = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="pt-16 pb-12 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <span className="inline-block text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">
          Legal
        </span>
        <Reveal variant="hero" delay={40} duration={580}>
          <h1 className="text-4xl font-extrabold text-[#111827] mb-4">Terms & Conditions</h1>
        </Reveal>
        <p className="text-[#6B7280]">
          Last updated: <strong>January 1, 2025</strong>
        </p>
        <p className="text-sm text-[#6B7280] mt-3 max-w-xl mx-auto">
          Please read these Terms carefully before using EduFlow Pro. By using our service, you agree to be bound by these Terms.
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
                  {title.replace(/^\d+\.\s/, '')}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 max-w-3xl">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
            <strong>Key points:</strong> You own your data. We offer a 7-day free trial and 14-day money-back guarantee. You can cancel anytime. We never sell your data.
          </div>

          <div className="space-y-10">
            {SECTIONS.map(({ id, title, content, subsections }) => (
              <section key={id} id={id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-[#111827] mb-4 pb-2 border-b border-gray-100">{title}</h2>
                {content && <p className="text-[#6B7280] text-sm leading-relaxed">{content}</p>}
                {subsections && (
                  <div className="space-y-4">
                    {subsections.map(({ title: st, text }) => (
                      <div key={st}>
                        <h3 className="font-semibold text-[#374151] mb-1.5">{st}</h3>
                        <p className="text-[#6B7280] text-sm leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200 text-sm text-[#6B7280]">
            <p>If you have questions about these Terms, please <a href="/contact" className="text-[#2563EB] hover:underline">contact us</a>. We're happy to clarify anything.</p>
          </div>
        </article>
      </div>
    </div>
  </PublicLayout>
);

export default TermsPage;
