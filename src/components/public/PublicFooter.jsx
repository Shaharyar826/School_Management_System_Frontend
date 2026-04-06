import { Link } from 'react-router-dom';
import Reveal from './Reveal';

const BRAND_GRADIENT = 'linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%)';
const BRAND_PRIMARY  = '#E91E8C';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features',   to: '/#features' },
    { label: 'Pricing',    to: '/pricing' },
    { label: 'Security',   to: '/about' },
    { label: 'Changelog',  to: '/about' },
  ],
  Company: [
    { label: 'About Us',   to: '/about' },
    { label: 'Contact',    to: '/contact' },
    { label: 'Blog',       to: '/about' },
    { label: 'Careers',    to: '/about' },
  ],
  Legal: [
    { label: 'Privacy Policy',     to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Cookie Policy',      to: '/privacy' },
  ],
};

const SocialIcon = ({ href, label, children }) => (
  <a
    href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    style={{ width: 36, height: 36, borderRadius: 10, background: '#1F2937', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}
    onMouseEnter={e => { e.currentTarget.style.background = BRAND_GRADIENT; e.currentTarget.style.color = '#fff'; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.color = '#9CA3AF'; }}
  >
    {children}
  </a>
);

const PublicFooter = () => (
  <Reveal variant="up" delay={0} duration={600} threshold={0.05} as="footer" className="bg-[#111827] text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

        {/* Brand */}
        <div className="col-span-2">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem' }}>E</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              EduFlow Pro
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
            The complete SaaS platform for modern educational institutions. Trusted by 10,000+ schools worldwide.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <SocialIcon href="https://twitter.com" label="Twitter">
              <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </SocialIcon>
            <SocialIcon href="https://linkedin.com" label="LinkedIn">
              <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </SocialIcon>
            <SocialIcon href="https://github.com" label="GitHub">
              <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </SocialIcon>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
          <div key={group}>
            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{ color: '#9CA3AF', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #1F2937', paddingTop: '2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>© {new Date().getFullYear()} EduFlow Pro. All rights reserved.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
          <Link to="/privacy" style={{ color: '#6B7280', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>Privacy</Link>
          <span>·</span>
          <Link to="/terms" style={{ color: '#6B7280', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>Terms</Link>
          <span>·</span>
          <span>Made with ❤️ for educators</span>
        </div>
      </div>
    </div>
  </Reveal>
);

export default PublicFooter;
