import { useState } from 'react';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import SectionContainer from '../../components/public/SectionContainer';
import Reveal from '../../components/public/Reveal';

const CONTACT_INFO = [
  { icon: '📧', label: 'Email',         value: 'hello@eduflowpro.com',                     href: 'mailto:hello@eduflowpro.com' },
  { icon: '📞', label: 'Phone',         value: '+1 (555) 123-4567',                         href: 'tel:+15551234567' },
  { icon: '📍', label: 'Address',       value: '123 Education Lane, San Francisco, CA 94102', href: null },
  { icon: '🕐', label: 'Support Hours', value: 'Mon–Fri, 9am–6pm PST',                     href: null },
];

const TOPICS = ['General Inquiry', 'Sales & Pricing', 'Technical Support', 'Partnership', 'Feature Request', 'Other'];
const INITIAL = { name: '', email: '', institution: '', topic: '', message: '' };

const ContactPage = () => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.topic) e.topic = 'Please select a topic';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus('sending');
    try {
      const { default: axios } = await import('../../config/axios');
      await axios.post('/api/contact', form);
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-[#111827] placeholder-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
    }`;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-16 pb-16 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Reveal variant="fade" duration={380}>
            <span className="inline-block text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">
              Contact Us
            </span>
          </Reveal>
          <Reveal variant="hero" delay={70} duration={620}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] mb-4">
              We'd love to hear from you
            </h1>
          </Reveal>
          <p className="text-lg text-[#6B7280]">
            Whether you have a question, need a demo, or want to discuss a custom plan — our team is here to help.
          </p>
        </div>
      </section>

      <SectionContainer bg="bg-white">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info — slides from left */}
          <Reveal variant="right" duration={560} className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#111827] mb-2">Get in touch</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Fill out the form and our team will get back to you within 24 hours. For urgent support, email us directly.
              </p>
            </div>

            <div className="space-y-4">
              {CONTACT_INFO.map(({ icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium text-[#2563EB] hover:underline">{value}</a>
                    ) : (
                      <p className="text-sm font-medium text-[#374151]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 h-48 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl mb-2">📍</span>
                <p className="font-semibold text-[#374151] text-sm">EduFlow Pro HQ</p>
                <p className="text-xs text-[#6B7280]">123 Education Lane, San Francisco, CA</p>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-[#2563EB] hover:underline font-medium">
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </Reveal>

          {/* Form — slides from right */}
          <Reveal variant="left" delay={60} duration={560} className="lg:col-span-3">
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Message sent!</h3>
                <p className="text-[#6B7280] mb-6">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <Button variant="primary" onClick={() => setStatus(null)}>Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5" htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input id="name" name="name" type="text" placeholder="John Smith" value={form.name} onChange={handleChange} className={inputClass('name')} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5" htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input id="email" name="email" type="email" placeholder="john@school.edu" value={form.email} onChange={handleChange} className={inputClass('email')} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5" htmlFor="institution">Institution Name</label>
                  <input id="institution" name="institution" type="text" placeholder="Greenfield Academy" value={form.institution} onChange={handleChange} className={inputClass('institution')} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5" htmlFor="topic">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <select id="topic" name="topic" value={form.topic} onChange={handleChange} className={inputClass('topic')}>
                    <option value="">Select a topic...</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5" htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea id="message" name="message" rows={5} placeholder="Tell us how we can help you..." value={form.message} onChange={handleChange} className={`${inputClass('message')} resize-none`} />
                  <div className="flex justify-between mt-1">
                    {errors.message ? <p className="text-red-500 text-xs">{errors.message}</p> : <span />}
                    <p className="text-xs text-[#9CA3AF]">{form.message.length}/500</p>
                  </div>
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                    Something went wrong. Please try again or email us directly at hello@eduflowpro.com
                  </div>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={status === 'sending'}>
                  {status === 'sending' ? 'Sending...' : 'Send Message →'}
                </Button>

                <p className="text-xs text-center text-[#9CA3AF]">
                  By submitting this form, you agree to our{' '}
                  <a href="/privacy" className="text-[#2563EB] hover:underline">Privacy Policy</a>.
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </SectionContainer>
    </PublicLayout>
  );
};

export default ContactPage;
