import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect } from 'react';
import axios from '../../config/axios';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '2px 0 0', letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 11, color: '#10B981', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  </div>
);

const SuperAdminBilling = () => {
  const [billingData, setBillingData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => { fetchAll(); }, [timeRange]);

  const fetchAll = async () => {
    const token = localStorage.getItem('superAdminToken');
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [b, t] = await Promise.allSettled([
        axios.get(`/api/super-admin/billing/overview?range=${timeRange}`, { headers: h }),
        axios.get(`/api/super-admin/billing/transactions?range=${timeRange}`, { headers: h }),
      ]);
      if (b.status === 'fulfilled') setBillingData(b.value.data.data);
      if (t.status === 'fulfilled') setTransactions(t.value.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #E91E8C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    </SuperAdminLayout>
  );

  const statusStyle = (s) => ({
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
    background: s === 'succeeded' ? 'rgba(16,185,129,0.1)' : s === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
    color: s === 'succeeded' ? '#10B981' : s === 'failed' ? '#EF4444' : '#F59E0B',
  });

  return (
    <SuperAdminLayout>
      <div style={{ padding: '1.5rem', maxWidth: 1280, margin: '0 auto' }} className="space-y-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Billing & Revenue</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Monitor payments, subscriptions, and revenue analytics</p>
          </div>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
            style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#374151', outline: 'none' }}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={`$${billingData?.totalRevenue?.toLocaleString() || 0}`}
            sub={billingData?.revenueGrowth ? `+${billingData.revenueGrowth}% from last period` : null}
            color="rgba(16,185,129,0.1)"
            icon={<svg width="20" height="20" fill="none" stroke="#10B981" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Monthly Recurring Revenue" value={`$${billingData?.monthlyRecurring?.toLocaleString() || 0}`}
            color="rgba(233,30,140,0.1)"
            icon={<svg width="20" height="20" fill="none" stroke="#E91E8C" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
          <StatCard label="Active Subscriptions" value={billingData?.activeSubscriptions || 0}
            color="rgba(147,51,234,0.1)"
            icon={<svg width="20" height="20" fill="none" stroke="#9333EA" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        {/* Transactions table */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Recent Transactions</h3>
          </div>
          {transactions.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', fontSize: 13 }}>No transactions found for the selected period.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#F9FAFB' }}>
                  {['School', 'Plan', 'Amount', 'Status', 'Date', 'Stripe ID'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 500, color: '#111827' }}>{t.tenant}</td>
                      <td style={{ padding: '12px 20px' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: 'rgba(233,30,140,0.1)', color: '#E91E8C' }}>{t.plan}</span></td>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#111827' }}>${t.amount}</td>
                      <td style={{ padding: '12px 20px' }}><span style={statusStyle(t.status)}>{t.status}</span></td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: '#6B7280' }}>{new Date(t.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 20px' }}><code style={{ fontSize: 11, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{t.stripeId}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stripe status */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Connected to Stripe</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>Webhooks active, payments processing normally</p>
            </div>
          </div>
          <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer"
            style={{ fontSize: 13, fontWeight: 500, color: '#E91E8C', textDecoration: 'none', border: '1px solid rgba(233,30,140,0.3)', padding: '6px 14px', borderRadius: 8 }}>
            View in Stripe
          </a>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBilling;
