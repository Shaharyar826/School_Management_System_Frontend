import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import TeacherDashboard from '../teachers/TeacherDashboard';
import StudentDashboard from '../students/StudentDashboard';
import ParentDashboard from '../parent/ParentDashboard';
import NoticeList from '../notices/NoticeList';
import { useDashboardStats } from '../../hooks/useDashboard';
import ComplaintModal from '../common/ComplaintModal';

/* ── StatCard ────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, iconClass, link, linkLabel, topColor }) => (
  <div
    className="stat-card"
    style={{ '--stat-top': topColor }}
  >
    {/* Color-coded top accent bar */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: topColor, borderRadius: '16px 16px 0 0' }} />

    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>{value}</p>
      </div>
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
    </div>

    {link && (
      <Link to={link} style={{ fontSize: '0.8125rem', fontWeight: 600, color: topColor, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {linkLabel} <span>→</span>
      </Link>
    )}
  </div>
);

/* ── Skeleton ────────────────────────────────────────────────── */
const StatSkeleton = () => (
  <div className="stat-card animate-pulse">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, borderRadius: 6, width: 96, background: '#E5E7EB', marginBottom: 10 }} />
        <div style={{ height: 32, borderRadius: 8, width: 64, background: '#E5E7EB' }} />
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E5E7EB' }} />
    </div>
    <div style={{ height: 12, borderRadius: 6, width: 72, background: '#E5E7EB' }} />
  </div>
);

/* ── Main Dashboard ──────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [showComplaint, setShowComplaint] = useState(false);

  /* Role-based sub-dashboards — logic unchanged */
  if (user && (user.role === 'tenant_system_admin' || user.role === 'admin' || user.role === 'principal')) {
    return <AdminDashboard />;
  }
  if (user && user.role === 'teacher') return <TeacherDashboard />;
  if (user && user.role === 'student') return <StudentDashboard />;
  if (user && user.role === 'parent') return <ParentDashboard />;

  const { data: dashboardData, isLoading: loading, error: queryError } = useDashboardStats(user?.role);

  const stats = {
    totalStudents:   dashboardData?.totalStudents   || 0,
    totalTeachers:   dashboardData?.totalTeachers   || 0,
    todayAttendance: dashboardData?.todayAttendance || 0,
    feesDue:         dashboardData?.feesDue         || 0,
  };
  const notices = dashboardData?.recentNotices || [];
  const error   = queryError?.response?.data?.message || (queryError ? 'Failed to load dashboard data' : '');

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconClass: 'stat-icon-brand',  link: '/students',  linkLabel: 'View all students',  topColor: '#E91E8C',
    },
    {
      label: 'Total Teachers',
      value: stats.totalTeachers,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      iconClass: 'stat-icon-purple', link: '/teachers',  linkLabel: 'View all teachers',  topColor: '#9333EA',
    },
    {
      label: "Today's Attendance",
      value: stats.todayAttendance,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      iconClass: 'stat-icon-green',  link: '/attendance',linkLabel: 'View details',        topColor: '#10B981',
    },
    {
      label: 'Fees Due',
      value: `₹${stats.feesDue.toLocaleString()}`,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconClass: 'stat-icon-amber',  link: '/fees',      linkLabel: 'View all fees',       topColor: '#F59E0B',
    },
  ];

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#FAFAFA', padding: '2rem 0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Welcome Banner ── */}
        <div className="welcome-card" style={{ marginBottom: '2rem' }}>
          <div className="welcome-card-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500, marginBottom: 4 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem' }}>
                Here's what's happening at your school today.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/events-notices" style={{ padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 9999, color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                Post Notice
              </Link>
              <Link to="/students" style={{ padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 9999, color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Add Student
              </Link>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {loading
            ? [...Array(4)].map((_, i) => <StatSkeleton key={i} />)
            : statCards.map((s, i) => <StatCard key={i} {...s} />)
          }
        </div>

        {/* ── Bottom Section ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

          {/* Notices */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}>
                Recent Events & Notices
              </h2>
              <Link to="/events-notices" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E91E8C', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>
            <div style={{ padding: '1rem' }}>
              <NoticeList limit={3} showAddButton={false} isDashboard={true} notices={notices} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                {
                  to: '/students',
                  label: 'Add Student',
                  desc: 'Enroll a new learner',
                  color: '#E91E8C',
                  icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>),
                },
                {
                  to: '/attendance',
                  label: 'Mark Attendance',
                  desc: "Record today's attendance",
                  color: '#10B981',
                  icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
                },
                {
                  to: '/fees',
                  label: 'Record Payment',
                  desc: 'Log a fee payment',
                  color: '#F59E0B',
                  icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>),
                },
                {
                  to: '/events-notices',
                  label: 'Post Notice',
                  desc: 'Publish an announcement',
                  color: '#9333EA',
                  icon: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>),
                },
              ].map(a => (
                <Link
                  key={a.to}
                  to={a.to}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 12, background: '#F9FAFB', border: '1px solid transparent', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F8'; e.currentTarget.style.borderColor = '#FFB3E3'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>{a.label}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{a.desc}</p>
                  </div>
                  <svg style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}

              {/* File Complaint button */}
              <button
                onClick={() => setShowComplaint(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 12, background: '#F9FAFB', border: '1px solid transparent', width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F8'; e.currentTarget.style.borderColor = '#FFB3E3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E91E8C" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>File a Complaint</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Report an issue to EduFlow support</p>
                </div>
                <svg style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
    {showComplaint && <ComplaintModal onClose={() => setShowComplaint(false)} />}
    </>
  );
};

export default Dashboard;
