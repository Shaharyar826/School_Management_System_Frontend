import { useState, useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import TenantFeaturesContext from '../../context/TenantFeaturesContext';
import TenantConfigContext from '../../context/TenantConfigContext';
import ProfileAvatar from '../common/ProfileAvatar';
import ContactMessageBadge from '../contact/ContactMessageBadge';
import { FEATURES, canRoleAccessFeature } from '../../config/features';
import {
  FaHome,
  FaCog,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaBullhorn,
  FaUserCheck,
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaUserTie,
  FaUser,
  FaUpload,
  FaHistory,
  FaEnvelope,
  FaEdit
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const { hasFeature } = useContext(TenantFeaturesContext);
  const { schoolName } = useContext(TenantConfigContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define navigation items based on user role and enabled features
  const navItems = useMemo(() => {
    if (!user) return [];

    const items = [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: <FaHome className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
      }
    ];

    // Students - only if feature enabled and user has access
    if (hasFeature(FEATURES.STUDENTS) && canRoleAccessFeature(user.role, FEATURES.STUDENTS)) {
      items.push({
        path: '/students',
        name: 'Students',
        icon: <FaUserGraduate className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher']
      });
    }

    // Teachers - only if feature enabled and user has access
    if (hasFeature(FEATURES.TEACHERS) && canRoleAccessFeature(user.role, FEATURES.TEACHERS)) {
      items.push({
        path: '/teachers',
        name: 'Teachers',
        icon: <FaChalkboardTeacher className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal']
      });
    }

    // Admin Staff - only if feature enabled and user has access
    if (hasFeature(FEATURES.ADMIN_STAFF) && canRoleAccessFeature(user.role, FEATURES.ADMIN_STAFF)) {
      items.push({
        path: '/admin-staff',
        name: 'Admin Staff',
        icon: <FaUserTie className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });
    }

    // Bulk Upload - only if feature enabled and user has access
    if (hasFeature(FEATURES.BULK_UPLOAD) && canRoleAccessFeature(user.role, FEATURES.BULK_UPLOAD)) {
      items.push({
        path: '/upload',
        name: 'Bulk Upload',
        icon: <FaUpload className="w-5 h-5" />,
        allowedRoles: ['admin']
      });
    }

    // Attendance - only if feature enabled and user has access
    if (hasFeature(FEATURES.ATTENDANCE) && canRoleAccessFeature(user.role, FEATURES.ATTENDANCE)) {
      if (user.role === 'student') {
        items.push({
          path: '/student-attendance',
          name: 'My Attendance',
          icon: <FaCalendarAlt className="w-5 h-5" />,
          allowedRoles: ['student']
        });
      } else {
        items.push({
          path: '/attendance',
          name: 'Attendance',
          icon: <FaCalendarAlt className="w-5 h-5" />,
          allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher']
        });
      }
    }

    // Fees - only if feature enabled and user has access
    if (hasFeature(FEATURES.FEES) && canRoleAccessFeature(user.role, FEATURES.FEES)) {
      if (user.role === 'student') {
        items.push({
          path: '/student-fees',
          name: 'My Fees',
          icon: <FaMoneyBillWave className="w-5 h-5" />,
          allowedRoles: ['student']
        });
      } else {
        items.push({
          path: '/fees',
          name: 'Fees',
          icon: <FaMoneyBillWave className="w-5 h-5" />,
          allowedRoles: ['admin', 'principal', 'accountant']
        });
      }
    }

    // Salaries - only if feature enabled and user has access
    if (hasFeature(FEATURES.SALARIES) && canRoleAccessFeature(user.role, FEATURES.SALARIES)) {
      items.push({
        path: '/salaries',
        name: 'Salaries',
        icon: <FaMoneyBillWave className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'accountant']
      });
    }

    // Events & Notices - only if feature enabled and user has access
    if (hasFeature(FEATURES.EVENTS) && canRoleAccessFeature(user.role, FEATURES.EVENTS)) {
      items.push({
        path: '/events-notices',
        name: 'Events & Notices',
        icon: <FaBullhorn className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
      });
    }

    // Meetings - only if feature enabled and user has access
    if (hasFeature(FEATURES.MEETINGS) && canRoleAccessFeature(user.role, FEATURES.MEETINGS)) {
      items.push({
        path: '/meetings',
        name: 'Meetings',
        icon: <FaClipboardList className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher']
      });
    }

    // Contact Messages - only if feature enabled and user has access
    if (hasFeature(FEATURES.CONTACT_MESSAGES) && canRoleAccessFeature(user.role, FEATURES.CONTACT_MESSAGES)) {
      items.push({
        path: '/contact-messages',
        name: 'Contact Messages',
        icon: <FaEnvelope className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal'],
        badge: <ContactMessageBadge />
      });
    }

    // History - only if feature enabled and user has access
    if (hasFeature(FEATURES.HISTORY) && canRoleAccessFeature(user.role, FEATURES.HISTORY)) {
      items.push({
        path: '/history',
        name: 'History',
        icon: <FaHistory className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });
    }

    // School Settings - only if feature enabled and user has access
    if (hasFeature(FEATURES.SCHOOL_SETTINGS) && canRoleAccessFeature(user.role, FEATURES.SCHOOL_SETTINGS)) {
      items.push({
        path: '/school-settings',
        name: 'School Settings',
        icon: <FaCog className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });
    }

    // Content Management - only if feature enabled and user has access
    if (hasFeature(FEATURES.CONTENT_MANAGEMENT) && canRoleAccessFeature(user.role, FEATURES.CONTENT_MANAGEMENT)) {
      items.push({
        path: '/content-management',
        name: 'Content Management',
        icon: <FaEdit className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });
    }

    // Profile items - always available
    items.push({
      path: '/profile',
      name: 'View Profile',
      icon: <FaUser className="w-5 h-5" />,
      allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
    });

    items.push({
      path: '/user-profile',
      name: 'Profile Settings',
      icon: <FaCog className="w-5 h-5" />,
      allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
    });

    return items.filter(item => item.allowedRoles.includes(user.role));
  }, [user, hasFeature]);

  return (
    <div className={`school-sidebar h-auto min-h-full ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out relative z-20`}>
      <div className="school-sidebar-header flex justify-between items-center p-4 border-b border-school-navy-light">
        {!collapsed && (
          <h2 className="text-xl font-bold">{schoolName}</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-school-navy-light focus:outline-none"
        >
          {collapsed ? <FaChevronRight className="text-school-yellow" /> : <FaChevronLeft className="text-school-yellow" />}
        </button>
      </div>

      <nav className="mt-5">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`school-sidebar-item ${
                  isActive(item.path)
                    ? 'school-sidebar-item-active'
                    : 'school-sidebar-item-inactive'
                }`}
              >
                <span className="mr-3 school-sidebar-icon relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute">
                      {item.badge}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <span className="flex-1">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && user && (
        <div className="relative w-full p-4 mt-8 border-t border-school-navy-light">
          <div className="flex items-center">
            <ProfileAvatar
              profileImage={user.profileImage}
              name={user.name}
              user={user}
              size="md"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-school-yellow capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
