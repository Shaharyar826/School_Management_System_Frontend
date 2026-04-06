import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSetup } from '../../context/SetupContext';

/* ─── Design tokens ─────────────────────────────────────────── */
const GRAD      = 'linear-gradient(135deg, #E91E8C, #FF6B35)';
const GRAD_SOFT = 'linear-gradient(135deg, rgba(233,30,140,0.07), rgba(255,107,53,0.05))';
const PINK      = '#E91E8C';
const DARK      = '#111827';
const MID       = '#6B7280';
const BORDER    = '#E5E7EB';
const CARD_SH   = '0 2px 16px rgba(0,0,0,0.06)';

const METHOD_TYPES = [
  { value: 'bank_transfer',   label: '🏦 Bank Transfer' },
  { value: 'mobile_payment',  label: '📱 Mobile Payment (JazzCash / EasyPaisa)' },
  { value: 'credit_card',     label: '💳 Credit / Debit Card' },
  { value: 'cash',            label: '💵 Cash' },
  { value: 'other',           label: '📋 Other' },
];

const PillBadge = ({ active }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '0.25rem 0.75rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700,
    background: active ? '#D1FAE5' : '#FEF3C7',
    color: active ? '#065F46' : '#92400E',
  }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#10B981' : '#F59E0B', display: 'inline-block' }} />
    {active ? 'Active' : 'Trial'}
  </span>
);

const Spinner = () => (
  <div style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(233,30,140,0.2)', borderTopColor: PINK, animation: 'spin 0.7s linear infinite' }}>
    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
  </div>
);

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: DARK, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: MID, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const fieldStyle = {
  width: '100%', padding: '0.625rem 0.875rem',
  border: `1.5px solid ${BORDER}`, borderRadius: 10,
  fontSize: '0.875rem', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' };

/* ─── Main component ─────────────────────────────────────────── */
const TenantBillingPage = () => {
  const queryClient = useQueryClient();
  const { subscriptionPlan, trialActive, trialDaysLeft, hasActiveSubscription, trialEndsAt } = useSetup();

  const [showAddModal, setShowAddModal]     = useState(false);
  const [editingMethod, setEditingMethod]   = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [portalLoading, setPortalLoading]   = useState(false);
  const [portalError, setPortalError]       = useState('');

  const [form, setForm] = useState({ type: 'bank_transfer', name: '', details: '', isActive: true });

  // ── Data fetching ─────────────────────────────────────────────
  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ['tenantSubscription'],
    queryFn: async () => {
      const res = await axios.get('/api/stripe/subscription');
      return res.data.data;
    },
    retry: 1,
  });

  const { data: paymentMethods = [], isLoading: pmLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const res = await axios.get('/api/payment-methods');
      return res.data.data || [];
    },
  });

  // ── Mutations ─────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data) => axios.post('/api/payment-methods', data),
    onSuccess: () => { queryClient.invalidateQueries(['paymentMethods']); setShowAddModal(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => axios.put(`/api/payment-methods/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries(['paymentMethods']); setEditingMethod(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/payment-methods/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['paymentMethods']); setDeleteTarget(null); },
  });

  const resetForm = () => setForm({ type: 'bank_transfer', name: '', details: '', isActive: true });

  const openEdit = (method) => {
    setForm({ type: method.type, name: method.name, details: method.details, isActive: method.isActive });
    setEditingMethod(method);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleStripePortal = async () => {
    setPortalLoading(true);
    setPortalError('');
    try {
      const res = await axios.post('/api/stripe/create-portal-session', {
        returnUrl: window.location.href,
      });
      if (res.data.url) window.location.href = res.data.url;
    } catch (e) {
      setPortalError(e.response?.data?.message || 'Could not open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const formattedTrialEnd = trialEnd
    ? trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  /* ──────────────── RENDER ──────────────────────────────────── */
  return (
    <div style={{ padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif", maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: DARK, margin: '0 0 0.375rem' }}>
          Billing & Subscription
        </h1>
        <p style={{ color: MID, margin: 0, fontSize: '0.9375rem' }}>
          Manage your subscription and configure payment methods for your school.
        </p>
      </div>

      {/* ── Subscription Card ── */}
      <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: CARD_SH, padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: DARK, margin: 0 }}>Current Subscription</h2>
          <PillBadge active={hasActiveSubscription} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Plan', value: subData?.plan ? (subData.plan.charAt(0).toUpperCase() + subData.plan.slice(1)) : (subscriptionPlan?.charAt(0).toUpperCase() + subscriptionPlan?.slice(1) || 'Trial') },
            { label: 'Status', value: subData?.status || (trialActive ? 'Trialing' : 'Inactive') },
            { label: 'Trial Ends', value: formattedTrialEnd },
            { label: 'Days Left', value: trialActive ? `${trialDaysLeft} days` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: GRAD_SOFT, borderRadius: 14, padding: '1rem', border: '1px solid rgba(233,30,140,0.10)' }}>
              <p style={{ color: MID, fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontWeight: 800, fontSize: '1.0625rem', color: DARK, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Stripe Portal Button */}
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '1.25rem' }}>
          <p style={{ color: MID, fontSize: '0.875rem', marginBottom: '0.875rem' }}>
            Manage your SaaS subscription, view invoices, and update billing details via the Stripe portal.
          </p>
          {portalError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.625rem 1rem', color: '#EF4444', fontSize: '0.8125rem', marginBottom: '0.875rem' }}>
              {portalError}
            </div>
          )}
          <button
            onClick={handleStripePortal}
            disabled={portalLoading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.625rem 1.5rem', borderRadius: 9999, border: 'none',
              background: portalLoading ? '#E5E7EB' : GRAD,
              color: portalLoading ? '#9CA3AF' : '#fff',
              fontWeight: 700, fontSize: '0.9375rem', cursor: portalLoading ? 'not-allowed' : 'pointer',
              boxShadow: portalLoading ? 'none' : '0 4px 16px rgba(233,30,140,0.25)',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
          >
            {portalLoading ? <><Spinner /> Opening portal…</> : '💳 Manage Subscription via Stripe'}
          </button>
        </div>
      </div>

      {/* ── Payment Methods (in-school) ── */}
      <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: CARD_SH, padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: DARK, margin: '0 0 4px' }}>
              In-School Payment Methods
            </h2>
            <p style={{ color: MID, fontSize: '0.8125rem', margin: 0 }}>
              Payment options shown to parents & students for school fee collection
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none',
              background: GRAD, color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', boxShadow: '0 3px 12px rgba(233,30,140,0.25)',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
          >
            + Add Method
          </button>
        </div>

        {pmLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: MID }}><Spinner /></div>
        ) : paymentMethods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: GRAD_SOFT, borderRadius: 14, border: `1px dashed rgba(233,30,140,0.25)`, marginTop: '1.25rem' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>💳</p>
            <p style={{ fontWeight: 700, color: DARK, margin: '0 0 0.375rem' }}>No payment methods configured</p>
            <p style={{ color: MID, fontSize: '0.8125rem', margin: 0 }}>Add bank transfer details, JazzCash numbers, or other payment options.</p>
          </div>
        ) : (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {paymentMethods.map((method) => (
              <div key={method.id} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '1rem 1.25rem', borderRadius: 14,
                border: `1.5px solid ${method.isActive ? 'rgba(233,30,140,0.2)' : BORDER}`,
                background: method.isActive ? GRAD_SOFT : '#FAFAFA',
                gap: '1rem', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: DARK, fontSize: '0.9375rem' }}>{method.name}</span>
                    <span style={{
                      padding: '0.15rem 0.6rem', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700,
                      background: method.isActive ? '#D1FAE5' : '#F3F4F6',
                      color: method.isActive ? '#065F46' : '#6B7280',
                    }}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ color: MID, fontSize: '0.8125rem', margin: '0 0 4px' }}>
                    {METHOD_TYPES.find(t => t.value === method.type)?.label || method.type}
                  </p>
                  {method.details && (
                    <p style={{ color: '#374151', fontSize: '0.8125rem', margin: 0, fontFamily: 'monospace', background: 'rgba(0,0,0,0.04)', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 6 }}>
                      {method.details}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(method)}
                    style={{ padding: '0.4rem 1rem', borderRadius: 9999, border: `1.5px solid ${BORDER}`, background: '#fff', color: DARK, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(method)}
                    style={{ padding: '0.4rem 1rem', borderRadius: 9999, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      <Modal
        open={showAddModal || !!editingMethod}
        title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        onClose={() => { setShowAddModal(false); setEditingMethod(null); resetForm(); }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Payment Type</label>
            <select
              value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ ...fieldStyle }}
            >
              {METHOD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Display Name *</label>
            <input
              type="text" placeholder="e.g. HBL Bank Transfer, JazzCash – Admin"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Account / Details</label>
            <textarea
              placeholder="Account number, IBAN, mobile number, or payment instructions…"
              value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
              rows={3}
              style={{ ...fieldStyle, resize: 'vertical' }}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            <input
              type="checkbox" checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: PINK, cursor: 'pointer' }}
            />
            Active (visible to parents & students)
          </label>

          {(createMutation.error || updateMutation.error) && (
            <p style={{ color: '#EF4444', fontSize: '0.8125rem', margin: 0 }}>
              {(createMutation.error || updateMutation.error)?.response?.data?.message || 'Something went wrong'}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button
              onClick={() => { setShowAddModal(false); setEditingMethod(null); resetForm(); }}
              style={{ padding: '0.625rem 1.25rem', borderRadius: 9999, border: `1.5px solid ${BORDER}`, background: '#fff', color: MID, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending || !form.name.trim()}
              style={{
                padding: '0.625rem 1.5rem', borderRadius: 9999, border: 'none',
                background: !form.name.trim() ? '#E5E7EB' : GRAD,
                color: !form.name.trim() ? '#9CA3AF' : '#fff',
                fontWeight: 700, fontSize: '0.875rem',
                cursor: !form.name.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving…' : (editingMethod ? 'Save Changes' : 'Add Method')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteTarget} title="Delete Payment Method" onClose={() => setDeleteTarget(null)}>
        <p style={{ color: MID, marginBottom: '1.5rem' }}>
          Are you sure you want to delete <strong style={{ color: DARK }}>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setDeleteTarget(null)}
            style={{ padding: '0.625rem 1.25rem', borderRadius: 9999, border: `1.5px solid ${BORDER}`, background: '#fff', color: MID, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={() => deleteMutation.mutate(deleteTarget.id)}
            disabled={deleteMutation.isPending}
            style={{
              padding: '0.625rem 1.5rem', borderRadius: 9999, border: 'none',
              background: '#EF4444', color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default TenantBillingPage;
