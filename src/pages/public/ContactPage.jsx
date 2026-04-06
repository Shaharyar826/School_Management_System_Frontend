import React, { useState } from 'react';
import PublicLayout from '../../components/public/PublicLayout';
import SectionContainer from '../../components/public/SectionContainer';
import Reveal from '../../components/public/Reveal';

/* ── SVG icon helper ───────────────────────────────────────── */
const Icon = ({ d, size = 24, stroke = '#E91E8C', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

/* ── FadeIn wrapper ─────────────────────────────────────────── */
const FadeIn = ({ children, delay = 0, style = {}, className = '' }) => {
  const [vis, setVis] = useState(false);
  const ref = React.useRef(null);
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

const CONTACT_INFO = [
  {
    icon: ['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
    label: 'Email', value: 'hello@eduflowpro.com', href: 'mailto:hello@eduflowpro.com',
    accent: '#E91E8C', bg: 'rgba(233,30,140,0.08)',
  },
  {
    icon: ['M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'],
    label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567',
    accent: '#9333EA', bg: 'rgba(147,51,234,0.08)',
  },
  {
    icon: ['M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'],
    label: 'Address', value: '123 Education Lane, San Francisco, CA 94102', href: null,
    accent: '#FF6B35', bg: 'rgba(255,107,53,0.08)',
  },
  {
    icon: ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'],
    label: 'Support Hours', value: 'Mon–Fri, 9am–6pm PST', href: null,
    accent: '#10B981', bg: 'rgba(16,185,129,0.08)',
  },
];

const TOPICS = ['General Inquiry', 'Sales & Pricing', 'Technical Support', 'Partnership', 'Feature Request', 'Other'];
const INITIAL = { name: '', email: '', institution: '', topic: '', message: '' };

const ContactPage = () => {
  const [form, setForm]     = useState(INITIAL);
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
      await axios.post('/api/complaints/platform-contact', {
        name: form.name,
        email: form.email,
        subject: form.topic || form.institution || 'General Inquiry',
        message: form.message,
      });
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
    border: `1.5px solid ${errors[field] ? '#FCA5A5' : '#E5E7EB'}`,
    background: errors[field] ? '#FEF2F2' : '#fff',
    fontSize: '0.9375rem', color: '#111827',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'Inter, system-ui, sans-serif',
  });

  const FIELD_LABEL = { fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section style={{ background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 1.5rem 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse at center, rgba(233,30,140,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <FadeIn>
            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#E91E8C', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.25)', padding: '0.3rem 0.875rem', borderRadius: 9999, marginBottom: '1.5rem' }}>
              Contact Us
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.12, marginBottom: '1.25rem' }}>
              We'd love to{' '}
              <span style={{ background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                hear from you
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.125rem', lineHeight: 1.75 }}>
              Whether you have a question, need a demo, or want to discuss a custom plan — our team is here to help within 24 hours.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <SectionContainer bg="bg-white">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '3rem', alignItems: 'start' }} className="grid-cols-1 lg:grid-cols-5">

          {/* ── Contact Info ── */}
          <FadeIn style={{ gridColumn: '1 / 2' }} className="lg:col-span-2">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Get in touch</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                Fill out the form and our team will get back to you within 24 hours. For urgent support, email us directly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {CONTACT_INFO.map(({ icon, label, value, href, accent, bg }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon d={icon} size={20} stroke={accent} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
                      {href
                        ? <a href={href} style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#E91E8C', textDecoration: 'none' }}>{value}</a>
                        : <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#374151' }}>{value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                <div style={{ background: 'linear-gradient(135deg, #FFF0F8 0%, #F5F0FF 100%)', height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', gap: '0.5rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(233,30,140,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Icon d={['M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z']} size={22} stroke="#E91E8C" />
                  </div>
                  <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>EduFlow Pro HQ</p>
                  <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>123 Education Lane, San Francisco, CA</p>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8125rem', color: '#E91E8C', fontWeight: 600, textDecoration: 'none' }}>
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* ── Form ── */}
          <FadeIn delay={100} style={{ gridColumn: '2 / 3' }} className="lg:col-span-3">
            {status === 'success' ? (
              <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 20, padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Icon d="M5 13l4 4L19 7" size={36} stroke="#059669" strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Message sent!</h3>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setStatus(null)} style={{ padding: '0.75rem 2rem', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={FIELD_LABEL} htmlFor="name">Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                    <input id="name" name="name" type="text" placeholder="John Smith" value={form.name} onChange={handleChange}
                      style={inputStyle('name')}
                      onFocus={e => { e.target.style.borderColor = '#E91E8C'; e.target.style.boxShadow = '0 0 0 3px rgba(233,30,140,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = errors.name ? '#FCA5A5' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                    {errors.name && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={FIELD_LABEL} htmlFor="email">Email Address <span style={{ color: '#EF4444' }}>*</span></label>
                    <input id="email" name="email" type="email" placeholder="john@school.edu" value={form.email} onChange={handleChange}
                      style={inputStyle('email')}
                      onFocus={e => { e.target.style.borderColor = '#E91E8C'; e.target.style.boxShadow = '0 0 0 3px rgba(233,30,140,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = errors.email ? '#FCA5A5' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                    {errors.email && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label style={FIELD_LABEL} htmlFor="institution">Institution Name</label>
                  <input id="institution" name="institution" type="text" placeholder="Greenfield Academy" value={form.institution} onChange={handleChange}
                    style={inputStyle('institution')}
                    onFocus={e => { e.target.style.borderColor = '#E91E8C'; e.target.style.boxShadow = '0 0 0 3px rgba(233,30,140,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={FIELD_LABEL} htmlFor="topic">Topic <span style={{ color: '#EF4444' }}>*</span></label>
                  <select id="topic" name="topic" value={form.topic} onChange={handleChange}
                    style={{ ...inputStyle('topic'), cursor: 'pointer' }}
                    onFocus={e => { e.target.style.borderColor = '#E91E8C'; e.target.style.boxShadow = '0 0 0 3px rgba(233,30,140,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.topic ? '#FCA5A5' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value="">Select a topic...</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.topic && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.topic}</p>}
                </div>

                <div>
                  <label style={FIELD_LABEL} htmlFor="message">Message <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea id="message" name="message" rows={5} placeholder="Tell us how we can help you..." value={form.message} onChange={handleChange}
                    style={{ ...inputStyle('message'), resize: 'none' }}
                    onFocus={e => { e.target.style.borderColor = '#E91E8C'; e.target.style.boxShadow = '0 0 0 3px rgba(233,30,140,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.message ? '#FCA5A5' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {errors.message ? <p style={{ color: '#EF4444', fontSize: '0.8rem' }}>{errors.message}</p> : <span />}
                    <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{form.message.length}/500</p>
                  </div>
                </div>

                {status === 'error' && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#991B1B', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Icon d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={18} stroke="#DC2626" />
                    Something went wrong. Please try again or email us at hello@eduflowpro.com
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  style={{
                    width: '100%', padding: '0.9375rem', borderRadius: 9999, border: 'none',
                    background: status === 'sending' ? '#D1D5DB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)',
                    color: '#fff', fontWeight: 700, fontSize: '1.0625rem',
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                    boxShadow: status === 'sending' ? 'none' : '0 4px 20px rgba(233,30,140,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}
                >
                  {status === 'sending' ? (
                    <>
                      <span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                      Sending…
                    </>
                  ) : 'Send Message →'}
                </button>

                <p style={{ fontSize: '0.8125rem', textAlign: 'center', color: '#9CA3AF' }}>
                  By submitting this form, you agree to our{' '}
                  <a href="/privacy" style={{ color: '#E91E8C', textDecoration: 'none' }}>Privacy Policy</a>.
                </p>

              </form>
            )}
          </FadeIn>
        </div>
      </SectionContainer>

    </PublicLayout>
  );
};

export default ContactPage;
