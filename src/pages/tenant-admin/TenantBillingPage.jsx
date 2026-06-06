import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../../config/axios';

const GRAD  = 'linear-gradient(135deg, #E91E8C, #FF6B35)';
const PINK  = '#E91E8C';
const DARK  = '#111827';
const MID   = '#6B7280';
const BORDER = '#E5E7EB';
const CARD_S = { background: '#fff', borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '1.75rem', marginBottom: '1.5rem' };

// ── Stripe promise ────────────────────────────────────────────────────────────
let _stripePromise = null;
const getStripePromise = async () => {
  if (!_stripePromise) {
    const { data } = await axios.get('/api/stripe/config');
    _stripePromise = loadStripe(data.publishableKey);
  }
  return _stripePromise;
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active:    { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
    trialing:  { bg: '#DBEAFE', color: '#1E40AF', label: 'Trial' },
    past_due:  { bg: '#FEF3C7', color: '#92400E', label: 'Past Due' },
    suspended: { bg: '#FEE2E2', color: '#991B1B', label: 'Suspended' },
    inactive:  { bg: '#F3F4F6', color: '#374151', label: 'Inactive' },
    cancelled: { bg: '#F3F4F6', color: '#374151', label: 'Cancelled' },
  };
  const s = map[status] || map.inactive;
  return <span style={{ padding: '0.2rem 0.75rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>;
};

// ── Stripe Add Card Form ──────────────────────────────────────────────────────
const AddCardForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/stripe/setup-intent');
      const result = await stripe.confirmCardSetup(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) { setError(result.error.message); return; }
      await axios.post('/api/stripe/payment-methods/confirm', {
        paymentMethodId: result.setupIntent.payment_method,
        setAsDefault: true,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', background: '#FAFAFA' }}>
        <CardElement options={{ style: { base: { fontSize: '15px', color: DARK, '::placeholder': { color: MID } } } }} />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: `1.5px solid ${BORDER}`, background: '#fff', color: MID, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
        <button type="submit" disabled={loading || !stripe} style={{ padding: '0.5rem 1.5rem', borderRadius: 9999, border: 'none', background: loading ? '#E5E7EB' : GRAD, color: loading ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving…' : 'Save Card'}
        </button>
      </div>
    </form>
  );
};

// ── SafePay Pay Now Panel ─────────────────────────────────────────────────────
const SafePayPanel = ({ sub, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Handle return from SafePay redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status  = params.get('safepay');
    const invoice = params.get('invoice');
    if (status === 'success' && invoice) {
      // Verify payment with backend after redirect
      axios.get(`/api/safepay/verify?invoiceId=${invoice}&token=${params.get('token') || ''}`)
        .then(() => { onSuccess(); window.history.replaceState({}, '', window.location.pathname); })
        .catch(() => {});
    }
  }, []);

  const handlePayNow = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/safepay/checkout', {
        plan: sub?.plan || 'basic',
        studentCount: sub?.studentCount || 50,
      });
      if (data.redirectUrl) window.location.href = data.redirectUrl;
    } catch (e) {
      setError(e.response?.data?.message || 'Could not initiate payment. Please try again.');
    } finally { setLoading(false); }
  };

  const needsPayment = ['trialing', 'inactive', 'past_due', 'suspended', 'cancelled'].includes(sub?.status);

  return (
    <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>🇵🇰</span>
        <span style={{ fontWeight: 800, color: '#0C4A6E', fontSize: '0.9375rem' }}>Pay with SafePay (PKR)</span>
      </div>
      <p style={{ color: '#0369A1', fontSize: '0.8125rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>
        Complete your monthly subscription payment via SafePay. You will be redirected to the SafePay checkout page.
        After payment, your subscription will be automatically extended by 30 days.
      </p>
      {error && <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{error}</p>}
      {needsPayment ? (
        <button
          onClick={handlePayNow}
          disabled={loading}
          style={{ padding: '0.625rem 1.75rem', borderRadius: 9999, border: 'none', background: loading ? '#E5E7EB' : 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: loading ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: '0.9375rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(14,165,233,0.35)' }}
        >
          {loading ? 'Redirecting…' : '💳 Pay Now (PKR)'}
        </button>
      ) : (
        <p style={{ color: '#059669', fontWeight: 700, fontSize: '0.875rem' }}>✅ Subscription is active. No payment needed right now.</p>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TenantBillingPage = () => {
  const queryClient = useQueryClient();
  const [stripeEl, setStripeEl]       = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 5000); };

  // Fetch active gateway
  const { data: gatewayData } = useQuery({
    queryKey: ['activeGateway'],
    queryFn: () => axios.get('/api/safepay/gateway/public').then(r => r.data.data).catch(() => ({ activeGateway: 'manual' })),
    staleTime: 60_000,
  });
  const gateway = gatewayData?.activeGateway || 'manual';

  // Load Stripe only when Stripe is active gateway
  useEffect(() => {
    if (gateway === 'stripe') getStripePromise().then(setStripeEl);
  }, [gateway]);

  const { data: sub } = useQuery({
    queryKey: ['tenantSubscription'],
    queryFn: () => axios.get('/api/stripe/subscription').then(r => r.data.data),
    retry: 1,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['stripeCards'],
    queryFn: () => axios.get('/api/stripe/payment-methods').then(r => r.data.data),
    enabled: gateway === 'stripe',
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['billingInvoices'],
    queryFn: () => axios.get('/api/stripe/invoices').then(r => r.data.data),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id) => axios.put(`/api/stripe/payment-methods/${id}/default`),
    onSuccess: () => queryClient.invalidateQueries(['stripeCards']),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/stripe/payment-methods/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['stripeCards']); setDeleteTarget(null); },
    onError: (e) => showMsg('error', e.response?.data?.message || 'Failed to remove card'),
  });

  const handleCancel = async () => {
    if (!confirm('Cancel subscription? You keep access until the end of the billing period.')) return;
    setCancelLoading(true);
    try {
      await axios.post('/api/stripe/subscription/cancel');
      queryClient.invalidateQueries(['tenantSubscription']);
      showMsg('success', 'Subscription cancelled. Access continues until period end.');
    } catch (e) {
      showMsg('error', e.response?.data?.message || 'Failed to cancel');
    } finally { setCancelLoading(false); }
  };

  const trialDaysLeft = sub?.status === 'trialing' && sub?.trialEnd
    ? Math.max(0, Math.ceil((new Date(sub.trialEnd) - new Date()) / 86400000))
    : null;

  return (
    <div style={{ padding: '2rem 1.5rem', fontFamily: "'Inter',sans-serif", maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: DARK, marginBottom: '0.375rem' }}>Billing & Subscription</h1>
      <p style={{ color: MID, marginBottom: '2rem' }}>Manage your subscription and payment methods.</p>

      {/* Message */}
      {msg.text && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', background: msg.type === 'error' ? '#FEF2F2' : '#F0FDF4', color: msg.type === 'error' ? '#EF4444' : '#16A34A', border: `1px solid ${msg.type === 'error' ? '#FECACA' : '#BBF7D0'}` }}>
          {msg.text}
        </div>
      )}

      {/* Trial banner */}
      {sub?.status === 'trialing' && trialDaysLeft !== null && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, color: '#1E40AF', margin: 0 }}>🕐 Free trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining</p>
          <p style={{ color: '#3B82F6', fontSize: '0.875rem', margin: '2px 0 0' }}>Trial ends {new Date(sub.trialEnd).toLocaleDateString()}.</p>
        </div>
      )}

      {/* Past due banner */}
      {sub?.status === 'past_due' && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, color: '#92400E', margin: 0 }}>⚠️ Payment failed — grace period active.</p>
          {sub.gracePeriodEnd && <p style={{ color: '#B45309', fontSize: '0.875rem', margin: '2px 0 0' }}>Grace period ends: {new Date(sub.gracePeriodEnd).toLocaleDateString()}</p>}
        </div>
      )}

      {/* Suspended banner */}
      {sub?.status === 'suspended' && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, color: '#991B1B', margin: 0 }}>🔒 Account suspended due to non-payment. Your data is safe.</p>
          <p style={{ color: '#EF4444', fontSize: '0.875rem', margin: '2px 0 0' }}>Complete a payment below to restore access.</p>
        </div>
      )}

      {/* Subscription info card */}
      <div style={CARD_S}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: DARK, margin: 0 }}>Current Subscription</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {sub && <StatusBadge status={sub.status} />}
            <span style={{ fontSize: '0.75rem', color: MID, background: '#F3F4F6', padding: '0.15rem 0.6rem', borderRadius: 9999, fontWeight: 600 }}>
              via {gateway === 'safepay' ? '🇵🇰 SafePay' : gateway === 'stripe' ? '💳 Stripe' : '🔒 Manual'}
            </span>
          </div>
        </div>

        {sub && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Plan',        value: sub.plan?.charAt(0).toUpperCase() + sub.plan?.slice(1) || '—' },
              { label: 'Status',      value: sub.status || '—' },
              { label: sub.status === 'trialing' ? 'Trial Ends' : 'Period Ends', value: (sub.trialEnd || sub.currentPeriodEnd) ? new Date(sub.trialEnd || sub.currentPeriodEnd).toLocaleDateString() : '—' },
              { label: 'Auto-Renew',  value: gateway === 'stripe' ? (sub.cancelAtPeriodEnd ? 'Off' : 'On') : 'Manual' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'linear-gradient(135deg,rgba(233,30,140,0.06),rgba(255,107,53,0.04))', borderRadius: 12, padding: '0.875rem', border: '1px solid rgba(233,30,140,0.1)' }}>
                <p style={{ color: MID, fontSize: '0.7rem', fontWeight: 600, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: DARK, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Gateway-specific actions */}
        {gateway === 'stripe' && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {sub && ['active', 'trialing'].includes(sub.status) && !sub.cancelAtPeriodEnd && (
              <button onClick={handleCancel} disabled={cancelLoading} style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: '0.875rem', cursor: cancelLoading ? 'not-allowed' : 'pointer' }}>
                {cancelLoading ? 'Cancelling…' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        )}

        {gateway === 'safepay' && sub && (
          <div style={{ marginTop: sub ? '0.25rem' : 0 }}>
            <SafePayPanel sub={sub} onSuccess={() => { queryClient.invalidateQueries(['tenantSubscription']); queryClient.invalidateQueries(['billingInvoices']); showMsg('success', 'Payment confirmed! Subscription extended by 30 days.'); }} />
          </div>
        )}

        {gateway === 'manual' && (
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '1rem', border: `1px solid ${BORDER}`, marginTop: '0.5rem' }}>
            <p style={{ color: MID, fontSize: '0.875rem', margin: 0 }}>
              🔒 <strong>Manual billing mode.</strong> Contact support to activate or renew your subscription.
            </p>
          </div>
        )}
      </div>

      {/* Stripe payment methods — only shown when Stripe is active */}
      {gateway === 'stripe' && (
        <div style={CARD_S}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: DARK, margin: '0 0 3px' }}>Payment Methods</h2>
              <p style={{ color: MID, fontSize: '0.8125rem', margin: 0 }}>Cards used for auto-renewal</p>
            </div>
            {!showAddCard && (
              <button onClick={() => setShowAddCard(true)} style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', background: GRAD, color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                + Add Card
              </button>
            )}
          </div>

          {showAddCard && stripeEl && (
            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem', border: `1px solid ${BORDER}` }}>
              <p style={{ fontWeight: 700, color: DARK, marginBottom: '0.75rem', fontSize: '0.9375rem' }}>Add New Card</p>
              <Elements stripe={stripeEl}>
                <AddCardForm
                  onSuccess={() => { setShowAddCard(false); queryClient.invalidateQueries(['stripeCards']); showMsg('success', 'Card saved.'); }}
                  onCancel={() => setShowAddCard(false)}
                />
              </Elements>
            </div>
          )}

          {cards.length === 0 && !showAddCard ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#F9FAFB', borderRadius: 14, border: `1px dashed ${BORDER}` }}>
              <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>💳</p>
              <p style={{ fontWeight: 700, color: DARK, margin: '0 0 0.25rem' }}>No cards saved</p>
              <p style={{ color: MID, fontSize: '0.8125rem', margin: 0 }}>Add a card for automatic monthly billing.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cards.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 14, border: `1.5px solid ${c.isDefault ? 'rgba(233,30,140,0.3)' : BORDER}`, background: c.isDefault ? 'linear-gradient(135deg,rgba(233,30,140,0.05),rgba(255,107,53,0.03))' : '#FAFAFA', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{c.brand === 'visa' ? '💳' : c.brand === 'mastercard' ? '🟠' : '💳'}</span>
                    <div>
                      <p style={{ fontWeight: 700, color: DARK, margin: 0, fontSize: '0.9375rem' }}>
                        {c.brand?.charAt(0).toUpperCase() + c.brand?.slice(1)} •••• {c.last4}
                        {c.isDefault && <span style={{ marginLeft: 8, fontSize: '0.7rem', background: PINK, color: '#fff', padding: '0.1rem 0.5rem', borderRadius: 9999, fontWeight: 700 }}>Default</span>}
                      </p>
                      {c.expMonth && <p style={{ color: MID, fontSize: '0.8125rem', margin: 0 }}>Expires {c.expMonth}/{c.expYear}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!c.isDefault && (
                      <button onClick={() => setDefaultMutation.mutate(c.id)} style={{ padding: '0.35rem 0.875rem', borderRadius: 9999, border: `1.5px solid ${BORDER}`, background: '#fff', color: DARK, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>
                        Set Default
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(c)} style={{ padding: '0.35rem 0.875rem', borderRadius: 9999, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Billing history */}
      <div style={CARD_S}>
        <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: DARK, marginBottom: '1.25rem' }}>Billing History</h2>
        {invoices.length === 0 ? (
          <p style={{ color: MID, textAlign: 'center', padding: '2rem' }}>No invoices yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                  {['Date', 'Plan', 'Amount', 'Status', 'Invoice'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: MID, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '0.75rem', color: DARK }}>{new Date(inv.billingDate).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem', color: DARK, textTransform: 'capitalize' }}>{inv.planName}</td>
                    <td style={{ padding: '0.75rem', color: DARK, fontWeight: 600 }}>{inv.currency?.toUpperCase()} {parseFloat(inv.amount).toFixed(2)}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.15rem 0.6rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: inv.status === 'paid' ? '#D1FAE5' : inv.status === 'failed' ? '#FEE2E2' : '#FEF3C7', color: inv.status === 'paid' ? '#065F46' : inv.status === 'failed' ? '#991B1B' : '#92400E' }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {inv.invoiceUrl
                        ? <a href={inv.invoiceUrl} target="_blank" rel="noreferrer" style={{ color: PINK, fontWeight: 600, textDecoration: 'none', fontSize: '0.8125rem' }}>Download</a>
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remove card confirm modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 800, color: DARK, marginBottom: '0.75rem' }}>Remove Card?</h3>
            <p style={{ color: MID, marginBottom: '1.5rem' }}>Remove <strong>{deleteTarget.brand} •••• {deleteTarget.last4}</strong>? This card will no longer be charged.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: `1.5px solid ${BORDER}`, background: '#fff', color: MID, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => removeMutation.mutate(deleteTarget.id)} disabled={removeMutation.isPending} style={{ padding: '0.5rem 1.5rem', borderRadius: 9999, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: removeMutation.isPending ? 'not-allowed' : 'pointer' }}>
                {removeMutation.isPending ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantBillingPage;
