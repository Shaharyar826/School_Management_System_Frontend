import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';

/* Pure-JS responsive hook — no Tailwind class dependency */
const useWindowWidth = () => {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const NAV_LINKS = [
  { label: 'Home',    to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const BRAND_GRADIENT = 'linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%)';

/* ── Inline SVG icons — no extra deps ──────────────────────── */
const IconMenu = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Logo = () => (
  <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(233,30,140,0.3)', flexShrink: 0 }}>
      {/* Book icon SVG */}
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <span style={{ fontWeight: 800, fontSize: '1.125rem', background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
      EduFlow Pro
    </span>
  </Link>
);

const PublicNavbar = () => {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const windowWidth = useWindowWidth();
  const isDesktop   = windowWidth >= 768;

  /* Scroll listener — triggers blur/shadow. Resets on route change. */
  useEffect(() => {
    setScrolled(false);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  /* Close mobile menu on route change */
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Active page detection (for pink highlight on active link)
  const activePath = location.pathname;

  // ── Clean white on load → frosted glass blur + shadow on scroll ──
  const headerStyle = {
    position:            'fixed',
    top:                  0,
    left:                 0,
    right:                0,
    zIndex:               50,
    // Animate background, blur, shadow and border together
    transition:          'background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
    // Before scroll: solid white (0.99 opacity) — blur would have nothing to show through
    // After scroll:  semi-transparent (0.72 opacity) — so blur creates visible frosted glass
    background:          scrolled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.99)',
    backdropFilter:      scrolled ? 'blur(20px) saturate(180%)' : 'none',
    WebkitBackdropFilter:scrolled ? 'blur(20px) saturate(180%)' : 'none',
    borderBottom:        scrolled ? '1px solid rgba(229,231,235,0.6)' : '1px solid rgba(229,231,235,0.3)',
    boxShadow:           scrolled
      ? '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
      : 'none',
  };


  // Nav link colors — always dark; active link is brand pink
  const linkColor = (active) => active ? '#E91E8C' : '#374151';
  const linkBg    = (active) => active ? 'rgba(233,30,140,0.08)' : 'transparent';

  // Sign In button — always dark border, always dark text
  const signInStyle = {
    padding: '0.5rem 1.25rem', borderRadius: 9999,
    border: '1.5px solid #E5E7EB', background: 'transparent',
    color: '#374151', fontWeight: 600, fontSize: '0.875rem',
    cursor: 'pointer', transition: 'all 0.2s',
  };

  // Hamburger button
  const hamburgerStyle = {
    display: isDesktop ? 'none' : 'flex',
    alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, borderRadius: 10, border: 'none',
    background: '#F3F4F6', color: '#374151',
    cursor: 'pointer', transition: 'all 0.2s',
  };

  return (
    <header style={headerStyle}>
      <nav
        style={{
          maxWidth:       '80rem',
          margin:         '0 auto',
          padding:        '0 1.5rem',
          height:         64,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo />

        {/* Desktop nav links */}
        <ul style={{
          display: isDesktop ? 'flex' : 'none',
          alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0,
        }}>
          {NAV_LINKS.map(({ label, to }) => {
            const active = activePath === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: 10,
                    fontSize: '0.9rem', fontWeight: 500,
                    color: linkColor(active),
                    background: linkBg(active),
                    textDecoration: 'none', transition: 'all 0.2s', display: 'block',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#E91E8C'; e.currentTarget.style.background = 'rgba(233,30,140,0.08)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTAs */}
        <div style={{ display: isDesktop ? 'flex' : 'none', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/login')}
            style={signInStyle}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E91E8C'; e.currentTarget.style.color = '#E91E8C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding:     '0.5rem 1.25rem',
              borderRadius: 9999,
              border:       'none',
              background:  BRAND_GRADIENT,
              color:       '#fff',
              fontWeight:  700,
              fontSize:    '0.875rem',
              cursor:      'pointer',
              boxShadow:   '0 2px 12px rgba(233,30,140,0.3)',
              transition:  'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(233,30,140,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(233,30,140,0.3)'; }}
          >
            Start Free Trial
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          style={hamburgerStyle}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {/* Mobile menu — hidden on desktop */}
      {menuOpen && !isDesktop && (
        <div style={{ background: '#fff', borderTop: '1px solid #F3F4F6', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} className="md:hidden">
          <ul style={{ padding: '0.75rem 1rem', listStyle: 'none', margin: 0 }}>
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  style={{
                    display:        'block',
                    padding:        '0.75rem 1rem',
                    borderRadius:   10,
                    fontSize:       '0.9375rem',
                    fontWeight:     500,
                    color:          location.pathname === to ? '#E91E8C' : '#374151',
                    background:     location.pathname === to ? 'rgba(233,30,140,0.06)' : 'transparent',
                    textDecoration: 'none',
                    marginBottom:   2,
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ padding: '0.5rem 1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 9999, border: '1.5px solid #E5E7EB', background: 'transparent', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', color: '#374151' }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 9999, border: 'none', background: BRAND_GRADIENT, color: '#fff', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 2px 12px rgba(233,30,140,0.3)' }}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
