import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../config/axios';
import SuperAdminContext from '../../context/SuperAdminContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: color }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '2px 0 0', letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    active:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    trial:        'bg-amber-50 text-amber-700 border-amber-200',
    trialing:     'bg-amber-50 text-amber-700 border-amber-200',
    suspended:    'bg-red-50 text-red-700 border-red-200',
    setup_pending:'bg-slate-100 text-slate-600 border-slate-200',
    inactive:     'bg-slate-100 text-slate-500 border-slate-200',
  };
  return `inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${map[status] || map.inactive}`;
};

const SuperAdminDashboard = () => {
  const { token } = useContext(SuperAdminContext);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [unread, setUnread] = useState({ complaints: 0, contacts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('/api/super-admin/stats', { headers }),
      axios.get('/api/super-admin/analytics', { headers }),
      axios.get('/api/super-admin/tenants?limit=5', { headers }),
      axios.get('/api/super-admin/complaints?status=open&limit=1', { headers }),
      axios.get('/api/super-admin/contacts?unread=true&limit=1', { headers }),
    ]).then(([s, a, t, c, m]) => {
      setStats(s.data.data);
      setAnalytics(a.data.data);
      setTenants(t.data.data || []);
      setUnread({ complaints: c.data.totalCount || 0, contacts: m.data.unreadCount || 0 });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #E91E8C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    </SuperAdminLayout>
  );

  return (
    <SuperAdminLayout>
      <div style={{ padding: '1.5rem', maxWidth: 1280, margin: '0 auto' }} className="space-y-6">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Platform overview and key metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Schools" value={stats?.totalTenants} color="rgba(233,30,140,0.1)"
            icon={<svg width="20" height="20" fill="none" stroke="#E91E8C" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
          <StatCard label="Active Schools" value={stats?.activeTenants} color="rgba(16,185,129,0.1)"
            icon={<svg width="20" height="20" fill="none" stroke="#10B981" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Total Users" value={stats?.totalUsers} color="rgba(147,51,234,0.1)"
            icon={<svg width="20" height="20" fill="none" stroke="#9333EA" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          <StatCard label="Open Complaints" value={unread.complaints} sub={`${unread.contacts} unread messages`} color="rgba(255,107,53,0.1)"
            icon={<svg width="20" height="20" fill="none" stroke="#FF6B35" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1rem' }}>Tenant Growth</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics?.tenantGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Line type="monotone" dataKey="tenants" stroke="#E91E8C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1rem' }}>Users by Role</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={Object.entries(analytics?.usersByRole || {}).map(([role, count]) => ({ role, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="role" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" fill="#E91E8C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12 }} className="lg:col-span-2">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Recent Schools</h3>
              <Link to="/super-admin/tenants" style={{ fontSize: 12, color: '#E91E8C', fontWeight: 500, textDecoration: 'none' }}>View all</Link>
            </div>
            <div>
              {tenants.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: 13 }}>No schools yet</p>}
              {tenants.map(t => (
                <div key={t.id} style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F9FAFB' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>{t.schoolName || t.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{t.slug}.eduflow.com</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={statusBadge(t.status)}>{t.status}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Manage Pricing Plans', href: '/super-admin/pricing', bg: 'rgba(233,30,140,0.06)', color: '#E91E8C', hover: 'rgba(233,30,140,0.12)' },
                { label: `Complaints (${unread.complaints} open)`, href: '/super-admin/complaints', bg: 'rgba(255,107,53,0.06)', color: '#FF6B35', hover: 'rgba(255,107,53,0.12)' },
                { label: `Messages (${unread.contacts} unread)`, href: '/super-admin/contacts', bg: 'rgba(147,51,234,0.06)', color: '#9333EA', hover: 'rgba(147,51,234,0.12)' },
                { label: 'View All Tenants', href: '/super-admin/tenants', bg: 'rgba(16,185,129,0.06)', color: '#10B981', hover: 'rgba(16,185,129,0.12)' },
                { label: 'Site Settings', href: '/super-admin/settings', bg: 'rgba(107,114,128,0.06)', color: '#6B7280', hover: 'rgba(107,114,128,0.12)' },
              ].map(a => (
                <Link key={a.href} to={a.href}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderRadius: 8, fontSize: 13, fontWeight: 500, color: a.color, background: a.bg, textDecoration: 'none', transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = a.hover}
                  onMouseLeave={e => e.currentTarget.style.background = a.bg}>
                  {a.label}
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
