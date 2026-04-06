import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import TenantFeaturesContext from '../../context/TenantFeaturesContext';
import TenantConfigContext from '../../context/TenantConfigContext';
import ProfileAvatar from '../common/ProfileAvatar';
import NotificationBadge from '../common/NotificationBadge';
import ThemeToggle from '../common/ThemeToggle';
import { FEATURES, canRoleAccessFeature } from '../../config/features';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { hasFeature } = useContext(TenantFeaturesContext);
  const { schoolName } = useContext(TenantConfigContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="school-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left — Brand + Desktop Links */}
          <div className="flex flex-1 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full object-cover rounded-lg"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <span style={{ display: 'none' }}>E</span>
                </div>
                <span className="school-navbar-brand hidden sm:block">{schoolName}</span>
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden navbar:ml-8 navbar:flex navbar:items-center navbar:gap-1">
              <Link to="/" className="school-navbar-link px-3 py-2 rounded-lg">Home</Link>

              {user && (
                <>
                  <Link to="/dashboard" className="school-navbar-link px-3 py-2 rounded-lg">Dashboard</Link>

                  {hasFeature(FEATURES.TEACHERS) && canRoleAccessFeature(user?.role, FEATURES.TEACHERS) && (
                    <Link to="/teachers" className="school-navbar-link px-3 py-2 rounded-lg">Teachers</Link>
                  )}
                  {hasFeature(FEATURES.STUDENTS) && canRoleAccessFeature(user?.role, FEATURES.STUDENTS) && (
                    <Link to="/students" className="school-navbar-link px-3 py-2 rounded-lg">Students</Link>
                  )}
                  {hasFeature(FEATURES.ATTENDANCE) && canRoleAccessFeature(user?.role, FEATURES.ATTENDANCE) && (
                    <Link to="/attendance" className="school-navbar-link px-3 py-2 rounded-lg">Attendance</Link>
                  )}
                  {hasFeature(FEATURES.EVENTS) && canRoleAccessFeature(user?.role, FEATURES.EVENTS) && (
                    <Link to="/events-notices" className="school-navbar-link px-3 py-2 rounded-lg">Events</Link>
                  )}
                  {hasFeature(FEATURES.FEES) && canRoleAccessFeature(user?.role, FEATURES.FEES) && (
                    <Link to="/fees" className="school-navbar-link px-3 py-2 rounded-lg">Fees</Link>
                  )}
                  {hasFeature(FEATURES.SALARIES) && canRoleAccessFeature(user?.role, FEATURES.SALARIES) && (
                    <Link to="/salaries" className="school-navbar-link px-3 py-2 rounded-lg">Salaries</Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right — Actions */}
          <div className="hidden navbar:flex navbar:items-center navbar:gap-3">
            <ThemeToggle />

            {user ? (
              <>
                <NotificationBadge />

                {hasFeature(FEATURES.MEETINGS) && canRoleAccessFeature(user?.role, FEATURES.MEETINGS) && (
                  <Link
                    to="/meetings"
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.background = 'var(--brand-50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                    title="Meetings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={e => { e.stopPropagation(); toggleDropdown(); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-pill border transition-all"
                    style={{
                      borderColor: 'var(--border-default)',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-300)'; e.currentTarget.style.background = 'var(--brand-50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <ProfileAvatar profileImage={user.profileImage} name={user.name} user={user} size="sm" />
                    <span className="text-sm font-medium truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 py-1 z-[100] navbar-dropdown dropdown-menu-fix"
                      onClick={e => e.stopPropagation()}
                    >
                      {user.role === 'teacher' && (
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm dropdown-menu-fix"
                          style={{ color: 'var(--text-primary)' }}
                          onClick={e => { e.preventDefault(); e.stopPropagation(); setDropdownOpen(false); navigate('/profile'); }}
                        >
                          <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                      )}
                      <div style={{ height: '1px', background: 'var(--border-default)', margin: '4px 0' }} />
                      <button
                        onClick={e => { e.stopPropagation(); setDropdownOpen(false); handleLogout(); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left dropdown-menu-fix"
                        style={{ color: '#EF4444' }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="school-button school-button-primary">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center navbar:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)', background: isOpen ? 'var(--brand-50)' : 'transparent' }}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="navbar:hidden border-t animate-fade-in"
          style={{ borderColor: 'var(--border-default)', background: '#fff' }}
        >
          <div className="px-3 pt-2 pb-3 space-y-1">
            {[
              { to: '/', label: 'Home', always: true },
              { to: '/dashboard', label: 'Dashboard', show: !!user },
              { to: '/teachers', label: 'Teachers', show: user && hasFeature(FEATURES.TEACHERS) && canRoleAccessFeature(user?.role, FEATURES.TEACHERS) },
              { to: '/students', label: 'Students', show: user && hasFeature(FEATURES.STUDENTS) && canRoleAccessFeature(user?.role, FEATURES.STUDENTS) },
              { to: '/attendance', label: 'Attendance', show: user && hasFeature(FEATURES.ATTENDANCE) && canRoleAccessFeature(user?.role, FEATURES.ATTENDANCE) },
              { to: '/events-notices', label: 'Events & Notices', show: user && hasFeature(FEATURES.EVENTS) && canRoleAccessFeature(user?.role, FEATURES.EVENTS) },
              { to: '/meetings', label: 'Meetings', show: user && hasFeature(FEATURES.MEETINGS) && canRoleAccessFeature(user?.role, FEATURES.MEETINGS) },
              { to: '/notifications', label: 'Notifications', show: !!user },
              { to: '/profile', label: 'My Profile', show: user?.role === 'teacher' },
              { to: '/fees', label: 'Fees', show: user && hasFeature(FEATURES.FEES) && canRoleAccessFeature(user?.role, FEATURES.FEES) },
              { to: '/salaries', label: 'Salaries', show: user && hasFeature(FEATURES.SALARIES) && canRoleAccessFeature(user?.role, FEATURES.SALARIES) },
            ].filter(l => l.always || l.show).map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="px-4 pt-3 pb-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
            {user ? (
              <div className="flex items-center gap-3">
                <ProfileAvatar profileImage={user.profileImage} name={user.name} user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#EF4444', background: '#FEF2F2' }}
                    title="Sign out"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/login" className="school-button school-button-primary flex-1 justify-center">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

