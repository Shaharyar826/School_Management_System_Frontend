import { useState, useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import TenantFeaturesContext from '../../context/TenantFeaturesContext';
import TenantConfigContext from '../../context/TenantConfigContext';
import ProfileAvatar from '../common/ProfileAvatar';
import ContactMessageBadge from '../contact/ContactMessageBadge';
import { FEATURES, canRoleAccessFeature } from '../../config/features';
import {
  FaHome, FaCog, FaChalkboardTeacher, FaUserGraduate,
  FaCalendarAlt, FaMoneyBillWave, FaClipboardList, FaBullhorn,
  FaUserCheck, FaChevronLeft, FaChevronRight, FaUserCog,
  FaUserTie, FaUser, FaUpload, FaHistory, FaEnvelope, FaEdit
} from 'react-icons/fa';

/* ── All React logic / context / feature flags UNCHANGED ── */

const Sidebar = () => {
  const { user }       = useContext(AuthContext);
  const { hasFeature } = useContext(TenantFeaturesContext);
  const { schoolName } = useContext(TenantConfigContext);
  const location       = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(c => !c);
  const isActive = (path) => location.pathname === path;

  const navItems = useMemo(() => {
    if (!user) return [];

    const items = [
      { path: '/dashboard', name: 'Dashboard', icon: <FaHome className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal','teacher','student','accountant'] }
    ];

    if (hasFeature(FEATURES.STUDENTS) && canRoleAccessFeature(user.role, FEATURES.STUDENTS))
      items.push({ path: '/students', name: 'Students', icon: <FaUserGraduate className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal','teacher'] });

    if (hasFeature(FEATURES.TEACHERS) && canRoleAccessFeature(user.role, FEATURES.TEACHERS))
      items.push({ path: '/teachers', name: 'Teachers', icon: <FaChalkboardTeacher className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal'] });

    if (hasFeature(FEATURES.ADMIN_STAFF) && canRoleAccessFeature(user.role, FEATURES.ADMIN_STAFF))
      items.push({ path: '/admin-staff', name: 'Admin Staff', icon: <FaUserTie className="w-5 h-5" />, allowedRoles: ['admin','principal'] });

    if (hasFeature(FEATURES.BULK_UPLOAD) && canRoleAccessFeature(user.role, FEATURES.BULK_UPLOAD))
      items.push({ path: '/upload', name: 'Bulk Upload', icon: <FaUpload className="w-5 h-5" />, allowedRoles: ['admin'] });

    if (hasFeature(FEATURES.ATTENDANCE) && canRoleAccessFeature(user.role, FEATURES.ATTENDANCE)) {
      if (user.role === 'student')
        items.push({ path: '/student-attendance', name: 'My Attendance', icon: <FaCalendarAlt className="w-5 h-5" />, allowedRoles: ['student'] });
      else
        items.push({ path: '/attendance', name: 'Attendance', icon: <FaCalendarAlt className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal','teacher'] });
    }

    if (hasFeature(FEATURES.FEES) && canRoleAccessFeature(user.role, FEATURES.FEES)) {
      if (user.role === 'student')
        items.push({ path: '/student-fees', name: 'My Fees', icon: <FaMoneyBillWave className="w-5 h-5" />, allowedRoles: ['student'] });
      else
        items.push({ path: '/fees', name: 'Fees', icon: <FaMoneyBillWave className="w-5 h-5" />, allowedRoles: ['admin','principal','accountant'] });
    }

    if (hasFeature(FEATURES.SALARIES) && canRoleAccessFeature(user.role, FEATURES.SALARIES))
      items.push({ path: '/salaries', name: 'Salaries', icon: <FaMoneyBillWave className="w-5 h-5" />, allowedRoles: ['admin','principal','accountant'] });

    if (hasFeature(FEATURES.EVENTS) && canRoleAccessFeature(user.role, FEATURES.EVENTS))
      items.push({ path: '/events-notices', name: 'Events & Notices', icon: <FaBullhorn className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal','teacher','student','accountant'] });

    if (hasFeature(FEATURES.MEETINGS) && canRoleAccessFeature(user.role, FEATURES.MEETINGS))
      items.push({ path: '/meetings', name: 'Meetings', icon: <FaClipboardList className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal','teacher'] });

    if (hasFeature(FEATURES.CONTACT_MESSAGES) && canRoleAccessFeature(user.role, FEATURES.CONTACT_MESSAGES))
      items.push({ path: '/contact-messages', name: 'Contact Messages', icon: <FaEnvelope className="w-5 h-5" />, allowedRoles: ['admin','principal'], badge: <ContactMessageBadge /> });

    if (hasFeature(FEATURES.HISTORY) && canRoleAccessFeature(user.role, FEATURES.HISTORY))
      items.push({ path: '/history', name: 'History', icon: <FaHistory className="w-5 h-5" />, allowedRoles: ['admin','principal'] });

    if (hasFeature(FEATURES.SCHOOL_SETTINGS) && canRoleAccessFeature(user.role, FEATURES.SCHOOL_SETTINGS))
      items.push({ path: '/school-settings', name: 'School Settings', icon: <FaCog className="w-5 h-5" />, allowedRoles: ['admin','principal'] });

    if (hasFeature(FEATURES.CONTENT_MANAGEMENT) && canRoleAccessFeature(user.role, FEATURES.CONTENT_MANAGEMENT))
      items.push({ path: '/content-management', name: 'Content Management', icon: <FaEdit className="w-5 h-5" />, allowedRoles: ['admin','principal'] });

    items.push({ path: '/profile', name: 'View Profile', icon: <FaUser className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal','teacher','student','accountant'] });
    items.push({ path: '/user-profile', name: 'Profile Settings', icon: <FaCog className="w-5 h-5" />, allowedRoles: ['admin','principal','vice-principal','teacher','student','accountant'] });

    return items.filter(item => item.allowedRoles.includes(user.role) || user.role === 'tenant_system_admin' || user.role === 'owner');
  }, [user, hasFeature]);

  return (
    <div
      className="school-sidebar"
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* ── Header ── */}
      <div className="school-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', overflow: 'hidden' }}>
        {!collapsed && (
          <h2 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
            {schoolName}
          </h2>
        )}
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            flexShrink: 0,
            width: 28, height: 28,
            border: 'none', cursor: 'pointer',
            borderRadius: 8,
            background: 'rgba(233,30,140,0.12)',
            color: '#E91E8C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(233,30,140,0.24)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(233,30,140,0.12)'}
        >
          {collapsed
            ? <FaChevronRight style={{ width: 12, height: 12 }} />
            : <FaChevronLeft  style={{ width: 12, height: 12 }} />
          }
        </button>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: '0.5rem 0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`school-sidebar-item ${active ? 'school-sidebar-item-active' : 'school-sidebar-item-inactive'}`}
                  style={{ justifyContent: collapsed ? 'center' : undefined, paddingLeft: collapsed ? 0 : undefined, paddingRight: collapsed ? 0 : undefined }}
                >
                  <span
                    className="school-sidebar-icon"
                    style={{ position: 'relative', flexShrink: 0, marginRight: collapsed ? 0 : '0.75rem' }}
                  >
                    {item.icon}
                    {item.badge && (
                      <span style={{ position: 'absolute', top: -4, right: -4 }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {!collapsed && (
                    <span style={{ flex: 1, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User Card ── */}
      {user && (
        <div
          style={{
            padding: collapsed ? '0.75rem 0.5rem' : '0.875rem 1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : undefined,
            gap: 10,
            overflow: 'hidden',
          }}
        >
          {/* Avatar with gradient ring */}
          <div
            className="sidebar-avatar-ring"
            style={{ flexShrink: 0 }}
          >
            <ProfileAvatar
              profileImage={user.profileImage}
              name={user.name}
              user={user}
              size="sm"
            />
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#FF80CF', textTransform: 'capitalize' }}>
                {user.role}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
