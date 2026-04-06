import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#E91E8C', '#FF6B35', '#9333EA', '#10B981', '#3B82F6'];

const StatCard = ({ label, value, color, icon }) => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '2px 0 0', letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
    </div>
  </div>
);

const SuperAdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchData(); }, [timeRange]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const res = await axios.get(`/api/super-admin/analytics?range=${timeRange}`, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const card = (style) => ({ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, ...style });
  const tabCls = (t) => tab === t
    ? { borderBottom: '2px solid #E91E8C', color: '#E91E8C', padding: '8px 4px', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }
    : { borderBottom: '2px solid transparent', color: '#6B7280', padding: '8px 4px', fontWeight: 400, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' };

  if (loading) return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #E91E8C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    </SuperAdminLayout>
  );

  return (
    <SuperAdminLayout>
      <div style={{ padding: '1.5rem', maxWidth: 1280, margin: '0 auto' }} className="space-y-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Analytics</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Platform-wide metrics and insights</p>
          </div>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
            style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#374151', outline: 'none' }}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB' }}>
          {['overview', 'growth', 'features', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabCls(t)} className="capitalize">{t}</button>
          ))}
        </div>

        {tab === 'overview' && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Schools" value={data.overview.totalTenants} color="rgba(233,30,140,0.1)"
              icon={<svg width="20" height="20" fill="none" stroke="#E91E8C" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
            <StatCard label="Active Users" value={data.overview.activeUsers?.toLocaleString()} color="rgba(16,185,129,0.1)"
              icon={<svg width="20" height="20" fill="none" stroke="#10B981" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <StatCard label="Total Revenue" value={`$${data.overview.totalRevenue?.toLocaleString() || 0}`} color="rgba(255,107,53,0.1)"
              icon={<svg width="20" height="20" fill="none" stroke="#FF6B35" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard label="Growth Rate" value={`${data.overview.growthRate}%`} color="rgba(147,51,234,0.1)"
              icon={<svg width="20" height="20" fill="none" stroke="#9333EA" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
          </div>
        )}

        {tab === 'growth' && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div style={card({ padding: '1.25rem' })}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1rem' }}>Tenant Growth</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.tenantGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <Line type="monotone" dataKey="tenants" stroke="#E91E8C" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={card({ padding: '1.25rem' })}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1rem' }}>Revenue Growth</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.revenueGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip formatter={v => [`$${v}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="revenue" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'features' && data && (
          <div style={card({ overflow: 'hidden' })}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Feature Usage</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#F9FAFB' }}>
                {['Feature', 'Usage %', 'Active Tenants', 'Adoption'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {data.featureUsage.map((f, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 500, color: '#111827' }}>{f.feature}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 64, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                          <div style={{ width: `${f.usage}%`, height: '100%', background: 'linear-gradient(90deg, #E91E8C, #FF6B35)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#374151' }}>{f.usage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 13, color: '#374151' }}>{f.tenants}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: f.usage > 80 ? 'rgba(16,185,129,0.1)' : f.usage > 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: f.usage > 80 ? '#10B981' : f.usage > 60 ? '#F59E0B' : '#EF4444' }}>
                        {f.usage > 80 ? 'High' : f.usage > 60 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'users' && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={card({ padding: '1.25rem' })}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1rem' }}>User Distribution by Role</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={Object.entries(data.usersByRole).map(([role, value]) => ({ name: role, value }))}
                    cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {Object.keys(data.usersByRole).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={card({ padding: '1.25rem' })}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 1rem' }}>User Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Daily Active Users', value: data.userActivity.dailyActiveUsers?.toLocaleString() },
                  { label: 'Weekly Active Users', value: data.userActivity.weeklyActiveUsers?.toLocaleString() },
                  { label: 'Monthly Active Users', value: data.userActivity.monthlyActiveUsers?.toLocaleString() },
                  { label: 'Avg Session Duration', value: data.userActivity.averageSessionDuration },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;
