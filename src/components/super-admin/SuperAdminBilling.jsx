import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../config/axios';

const DARK   = '#111827';
const MID    = '#6B7280';
const BORDER = '#E5E7EB';
const GRAD   = 'linear-gradient(135deg,#E91E8C,#FF6B35)';
const CARD   = { background: '#fff', borderRadius: 16, border: `1px solid ${BORDER}`, padding: '1.5rem', marginBottom: '1rem' };
const INP    = { padding: '0.4rem 0.75rem', border: `1.5px solid ${BORDER}`, borderRadius: 8, fontSize: '0.875rem', width: 80 };

const StatusBadge = ({ status }) => {
  const map = {
    active:    ['#D1FAE5','#065F46'],
    trialing:  ['#DBEAFE','#1E40AF'],
    past_due:  ['#FEF3C7','#92400E'],
    suspended: ['#FEE2E2','#991B1B'],
    inactive:  ['#F3F4F6','#374151'],
  };
  const [bg, color] = map[status] || map.inactive;
  return <span style={{ padding: '0.15rem 0.6rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>{status}</span>;
};

const Btn = ({ label, color = GRAD, onClick, loading }) => (
  <button onClick={onClick} disabled={loading}
    style={{ padding: '0.4rem 0.875rem', borderRadius: 9999, border: 'none', background: loading ? '#E5E7EB' : color, color: loading ? '#9CA3AF' : '#fff', fontWeight: 600, fontSize: '0.8125rem', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
    {loading ? '…' : label}
  </button>
);

// ── Gateway Toggle Panel ──────────────────────────────────────────────────────
export const GatewayTogglePanel = () => {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['gatewaySettings'],
    queryFn: () => axios.get('/api/super-admin/billing/gateway').then(r => r.data.data),
  });

  const setGateway = useMutation({
    mutationFn: (gw) => axios.post('/api/super-admin/billing/gateway', { gateway: gw }),
    onSuccess: (_, gw) => { queryClient.invalidateQueries(['gatewaySettings']); setMsg(`✅ Active gateway: ${gw}`); setTimeout(() => setMsg(''), 3000); },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || e.message}`),
  });

  const GWS = [
    { id: 'manual',  icon: '🔒', label: 'Manual / Disabled', color: '#6B7280', bg: '#F3F4F6',
      desc: 'No gateway active. Accounts activated manually by super admin.' },
    { id: 'safepay', icon: '🇵🇰', label: 'SafePay (PKR)',     color: '#0EA5E9', bg: '#E0F2FE',
      desc: 'Hosted checkout redirect. One-time PKR payments only. No auto-renewal.',
      warn: 'One-time payments only. Auto-renewal not supported.' },
    { id: 'stripe',  icon: '💳', label: 'Stripe (USD/PKR)',  color: '#635BFF', bg: '#EEF2FF',
      desc: 'Full auto-billing with off-session charges. Requires live Stripe account.',
      warn: 'Requires live Stripe credentials before enabling.' },
  ];

  const active = data?.activeGateway || 'manual';

  return (
    <div style={{ ...CARD, marginBottom: '1.5rem' }}>
      <h3 style={{ fontWeight: 800, color: DARK, marginBottom: '0.25rem', fontSize: '1rem' }}>Payment Gateway</h3>
      <p style={{ color: MID, fontSize: '0.8125rem', marginBottom: '1.25rem' }}>Controls how subscription payments are processed platform-wide.</p>
      {msg && <div style={{ padding: '0.5rem 0.875rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.8125rem', background: msg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', color: msg.startsWith('✅') ? '#16A34A' : '#EF4444', border: `1px solid ${msg.startsWith('✅') ? '#BBF7D0' : '#FECACA'}` }}>{msg}</div>}
      {isLoading ? <p style={{ color: MID }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {GWS.map(gw => {
            const on = active === gw.id;
            return (
              <div key={gw.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 12, gap: '1rem', flexWrap: 'wrap', border: `2px solid ${on ? gw.color : BORDER}`, background: on ? gw.bg : '#FAFAFA', transition: 'all 0.15s' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.125rem' }}>{gw.icon}</span>
                    <span style={{ fontWeight: 700, color: DARK, fontSize: '0.9375rem' }}>{gw.label}</span>
                    {on && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 9999, background: gw.color, color: '#fff' }}>ACTIVE</span>}
                  </div>
                  <p style={{ color: MID, fontSize: '0.8125rem', margin: '0 0 0.2rem' }}>{gw.desc}</p>
                  {gw.warn && <p style={{ color: '#F59E0B', fontSize: '0.75rem', margin: 0, fontWeight: 600 }}>⚠️ {gw.warn}</p>}
                </div>
                {!on && <button onClick={() => setGateway.mutate(gw.id)} disabled={setGateway.isPending} style={{ padding: '0.4rem 1rem', borderRadius: 9999, border: `2px solid ${gw.color}`, background: '#fff', color: gw.color, fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}>{setGateway.isPending ? '…' : 'Enable'}</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Tenant Billing Controls (reusable sub-component) ─────────────────────────
const TenantBillingControls = ({ tenantId, tenantName }) => {
  const queryClient = useQueryClient();
  const [tab, setTab]       = useState('actions');
  const [msg, setMsg]       = useState('');
  const [inp, setInp]       = useState({ days: 7, credits: 500, plan: 'basic', studentCount: 50 });

  const key = ['sa-billing', tenantId];

  const { data: sub } = useQuery({
    queryKey: [...key, 'sub'],
    queryFn: () => axios.get(`/api/super-admin/tenants/${tenantId}`).then(r => r.data.data?.subscription),
    enabled: !!tenantId,
  });
  const { data: logs = [] } = useQuery({
    queryKey: [...key, 'log'],
    queryFn: () => axios.get(`/api/super-admin/tenants/${tenantId}/billing/log`).then(r => r.data.data),
    enabled: !!tenantId && tab === 'log',
  });
  const { data: invoices = [] } = useQuery({
    queryKey: [...key, 'invoices'],
    queryFn: () => axios.get(`/api/super-admin/tenants/${tenantId}/billing/invoices`).then(r => r.data.data),
    enabled: !!tenantId && tab === 'invoices',
  });

  const post  = (path, body = {}) => axios.post(`/api/super-admin/tenants/${tenantId}/billing/${path}`, body);
  const act   = (path, body, label) => ({
    mutationFn: () => post(path, body),
    onSuccess:  (r) => { setMsg(`✅ ${label}: ${r.data.message || 'Done'}`); queryClient.invalidateQueries(key); },
    onError:    (e) => setMsg(`❌ ${e.response?.data?.message || e.message}`),
  });

  const extendTrialMut = useMutation(act('extend-trial',  { days: inp.days }, 'Trial extended'));
  const extendGraceMut = useMutation(act('extend-grace',  { days: inp.days }, 'Grace extended'));
  const activateMut    = useMutation(act('activate',      {}, 'Account activated'));
  const suspendMut     = useMutation(act('suspend',       {}, 'Account suspended'));
  const changePlanMut  = useMutation(act('change-plan',   { plan: inp.plan, studentCount: inp.studentCount }, 'Plan changed'));
  const creditsMut     = useMutation(act('apply-credits', { credits: inp.credits * 100 }, 'Credits applied'));
  const retryMut       = useMutation(act('force-retry',   {}, 'Payment retried'));

  return (
    <div>
      <p style={{ fontWeight: 800, color: DARK, fontSize: '1rem', marginBottom: '0.25rem' }}>{tenantName}</p>

      {msg && <div style={{ padding: '0.625rem 1rem', borderRadius: 10, marginBottom: '1rem', background: msg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', color: msg.startsWith('✅') ? '#16A34A' : '#EF4444', border: `1px solid ${msg.startsWith('✅') ? '#BBF7D0' : '#FECACA'}`, fontSize: '0.875rem' }}>{msg}</div>}

      {sub && (
        <div style={{ ...CARD, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: DARK }}>Plan: {sub.plan}</span>
            <StatusBadge status={sub.status} />
            {sub.cancelAtPeriodEnd && <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600 }}>Cancels at period end</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem', fontSize: '0.8125rem', color: MID }}>
            {sub.trialEnd        && <span>Trial ends: {new Date(sub.trialEnd).toLocaleDateString()}</span>}
            {sub.currentPeriodEnd && <span>Period ends: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>}
            {sub.gracePeriodEnd  && <span style={{ color: '#F59E0B', fontWeight: 600 }}>Grace ends: {new Date(sub.gracePeriodEnd).toLocaleDateString()}</span>}
            {sub.promoCredits > 0 && <span style={{ color: '#10B981', fontWeight: 600 }}>Credits: ${(sub.promoCredits / 100).toFixed(2)}</span>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['actions', 'log', 'invoices'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.4rem 1rem', borderRadius: 9999, border: `1.5px solid ${tab === t ? '#E91E8C' : BORDER}`, background: tab === t ? 'rgba(233,30,140,0.08)' : '#fff', color: tab === t ? '#E91E8C' : MID, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'actions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={CARD}>
            <p style={{ fontWeight: 700, color: DARK, marginBottom: '0.75rem' }}>Extend Trial</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label style={{ color: MID, fontSize: '0.875rem' }}>Days:</label>
              <input type="number" min={1} max={90} value={inp.days} onChange={e => setInp(p => ({ ...p, days: e.target.value }))} style={INP} />
              <Btn label="Extend Trial" onClick={() => extendTrialMut.mutate()} loading={extendTrialMut.isPending} />
            </div>
          </div>
          <div style={CARD}>
            <p style={{ fontWeight: 700, color: DARK, marginBottom: '0.75rem' }}>Extend Grace Period</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label style={{ color: MID, fontSize: '0.875rem' }}>Days:</label>
              <input type="number" min={1} max={30} value={inp.days} onChange={e => setInp(p => ({ ...p, days: e.target.value }))} style={INP} />
              <Btn label="Extend Grace" color="#F59E0B" onClick={() => extendGraceMut.mutate()} loading={extendGraceMut.isPending} />
            </div>
          </div>
          <div style={CARD}>
            <p style={{ fontWeight: 700, color: DARK, marginBottom: '0.75rem' }}>Account Status</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Btn label="✅ Activate"            color="#10B981" onClick={() => activateMut.mutate()} loading={activateMut.isPending} />
              <Btn label="🔒 Suspend"             color="#EF4444" onClick={() => suspendMut.mutate()}  loading={suspendMut.isPending} />
              <Btn label="🔄 Force Retry Payment" onClick={() => retryMut.mutate()}    loading={retryMut.isPending} />
            </div>
          </div>
          <div style={CARD}>
            <p style={{ fontWeight: 700, color: DARK, marginBottom: '0.75rem' }}>Change Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select value={inp.plan} onChange={e => setInp(p => ({ ...p, plan: e.target.value }))} style={{ ...INP, width: 'auto' }}>
                {['basic','pro','premium','custom'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <label style={{ color: MID, fontSize: '0.875rem' }}>Students:</label>
              <input type="number" min={1} value={inp.studentCount} onChange={e => setInp(p => ({ ...p, studentCount: e.target.value }))} style={INP} />
              <Btn label="Change Plan" onClick={() => changePlanMut.mutate()} loading={changePlanMut.isPending} />
            </div>
          </div>
          <div style={CARD}>
            <p style={{ fontWeight: 700, color: DARK, marginBottom: '0.75rem' }}>Apply Promotional Credits</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label style={{ color: MID, fontSize: '0.875rem' }}>Amount (USD):</label>
              <input type="number" min={1} value={inp.credits} onChange={e => setInp(p => ({ ...p, credits: e.target.value }))} style={INP} />
              <Btn label="Apply Credits" color="#10B981" onClick={() => creditsMut.mutate()} loading={creditsMut.isPending} />
            </div>
          </div>
        </div>
      )}

      {tab === 'log' && (
        <div style={CARD}>
          <h3 style={{ fontWeight: 700, color: DARK, marginBottom: '1rem' }}>Billing Audit Log</h3>
          {logs.length === 0 ? <p style={{ color: MID }}>No log entries.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {logs.map(l => (
                <div key={l.id} style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: `1px solid ${BORDER}`, fontSize: '0.8125rem', flexWrap: 'wrap' }}>
                  <span style={{ color: MID, whiteSpace: 'nowrap', minWidth: 130 }}>{new Date(l.createdAt).toLocaleString()}</span>
                  <span style={{ fontWeight: 600, color: DARK, minWidth: 160 }}>{l.action}</span>
                  <span style={{ color: MID }}>by {l.performedBy}</span>
                  {l.details && Object.keys(l.details).length > 0 && (
                    <span style={{ color: '#9CA3AF', fontFamily: 'monospace', fontSize: '0.75rem' }}>{JSON.stringify(l.details)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'invoices' && (
        <div style={CARD}>
          <h3 style={{ fontWeight: 700, color: DARK, marginBottom: '1rem' }}>Invoices</h3>
          {invoices.length === 0 ? <p style={{ color: MID }}>No invoices.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                    {['Date','Plan','Amount','Status','Retries'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: MID, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: '0.625rem 0.75rem', color: DARK }}>{new Date(inv.billingDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: DARK, textTransform: 'capitalize' }}>{inv.planName}</td>
                      <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600, color: DARK }}>{inv.currency?.toUpperCase()} {parseFloat(inv.amount).toFixed(2)}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: inv.status === 'paid' ? '#D1FAE5' : inv.status === 'failed' ? '#FEE2E2' : '#FEF3C7', color: inv.status === 'paid' ? '#065F46' : inv.status === 'failed' ? '#991B1B' : '#92400E' }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', color: MID }}>{inv.retryCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Standalone page at /super-admin/billing ───────────────────────────────────
const SuperAdminBilling = () => {
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);

  const { data: tenants = [] } = useQuery({
    queryKey: ['sa-tenants-search', search],
    queryFn: () => axios.get(`/api/super-admin/tenants?limit=20&search=${encodeURIComponent(search)}`).then(r => r.data.data || []),
  });

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", maxWidth: 920, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontWeight: 900, color: DARK, fontSize: '1.75rem', marginBottom: '0.375rem' }}>Billing Management</h1>
      <p style={{ color: MID, marginBottom: '2rem' }}>Manage payment gateways and tenant subscription controls.</p>

      {/* Gateway toggle — always visible */}
      <GatewayTogglePanel />

      {/* Tenant controls */}
      <div style={{ ...CARD, marginBottom: 0 }}>
        <h3 style={{ fontWeight: 800, color: DARK, marginBottom: '1rem', fontSize: '1rem' }}>Tenant Billing Controls</h3>

        {!selected ? (
          <>
            <input
              type="text"
              placeholder="Search school name or subdomain…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 1rem', border: `1.5px solid ${BORDER}`, borderRadius: 9999, fontSize: '0.875rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            {tenants.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tenants.slice(0, 12).map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelected(t)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 10, border: `1.5px solid ${BORDER}`, cursor: 'pointer', background: '#FAFAFA', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#E91E8C'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                  >
                    <div>
                      <p style={{ fontWeight: 700, color: DARK, margin: 0 }}>{t.schoolName || t.name}</p>
                      <p style={{ color: MID, fontSize: '0.8125rem', margin: 0 }}>{t.slug} · {t.status}</p>
                    </div>
                    <span style={{ color: '#E91E8C', fontWeight: 600, fontSize: '0.8125rem' }}>Manage →</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: MID, textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem' }}>
                {search ? `No schools found for "${search}"` : 'Type a school name to search.'}
              </p>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: MID, fontSize: '0.875rem', fontWeight: 600, padding: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              ← Back to list
            </button>
            <TenantBillingControls tenantId={selected.id} tenantName={selected.schoolName || selected.name} />
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminBilling;
