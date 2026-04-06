import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect } from 'react';
import axios from '../../config/axios';

const ROLE_COLORS = {
  admin:              { bg: 'rgba(233,30,140,0.1)', color: '#E91E8C' },
  tenant_system_admin:{ bg: 'rgba(233,30,140,0.1)', color: '#E91E8C' },
  principal:          { bg: 'rgba(255,107,53,0.1)', color: '#FF6B35' },
  teacher:            { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6' },
  student:            { bg: 'rgba(16,185,129,0.1)',  color: '#10B981' },
  parent:             { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B' },
  accountant:         { bg: 'rgba(147,51,234,0.1)',  color: '#9333EA' },
};

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchUsers(); }, [role, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const params = new URLSearchParams({ page, limit: 50 });
      if (role !== 'all') params.set('role', role);
      if (search) params.set('search', search);
      const res = await axios.get(`/api/super-admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.data || []);
      setTotal(res.data.totalCount || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('superAdminToken');
    await axios.put(`/api/super-admin/users/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    const token = localStorage.getItem('superAdminToken');
    await axios.delete(`/api/super-admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const roleStyle = (r) => ROLE_COLORS[r] || { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
  const statusStyle = (s) => ({
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
    background: s === 'active' ? 'rgba(16,185,129,0.1)' : s === 'suspended' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
    color: s === 'active' ? '#10B981' : s === 'suspended' ? '#EF4444' : '#F59E0B',
  });

  return (
    <SuperAdminLayout>
      <div style={{ padding: '1.5rem', maxWidth: 1280, margin: '0 auto' }} className="space-y-5">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Global Users</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>{total} total users across all schools</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: total, color: 'rgba(233,30,140,0.1)', stroke: '#E91E8C', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'rgba(16,185,129,0.1)', stroke: '#10B981', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Teachers', value: users.filter(u => u.role === 'teacher').length, color: 'rgba(59,130,246,0.1)', stroke: '#3B82F6', d: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
            { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'rgba(147,51,234,0.1)', stroke: '#9333EA', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          ].map(({ label, value, color, stroke, d }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" stroke={stroke} viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '1px 0 0' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUsers()}
            style={{ flex: 1, minWidth: 200, border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none' }} />
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
            style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#374151', outline: 'none' }}>
            <option value="all">All Roles</option>
            {['admin','principal','teacher','student','accountant','parent','support_staff'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <div style={{ width: 28, height: 28, border: '2px solid #E91E8C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', fontSize: 13 }}>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#F9FAFB' }}>
                  {['User', 'School', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>{u.firstName} {u.lastName}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{u.email}</p>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{u.tenant?.schoolName || '—'}</p>
                        {u.tenant?.subdomain && <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{u.tenant.subdomain}.eduflow.com</p>}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, ...roleStyle(u.role) }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={statusStyle(u.status)}>{u.status}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <select value={u.status} onChange={e => updateStatus(u.id, e.target.value)}
                            style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#374151', outline: 'none' }}>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <button onClick={() => deleteUser(u.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontWeight: 500, padding: '4px 6px' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminUsers;
