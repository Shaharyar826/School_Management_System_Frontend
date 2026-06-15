/**
 * BillingStatusBanner
 *
 * Shown at the top of AdminDashboard.
 * Gateway-aware: shows different CTAs based on active gateway.
 * Hidden when subscription is active with no issues.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { useSetup } from '../../context/SetupContext';

const BillingStatusBanner = () => {
  const navigate = useNavigate();
  const { trialActive, trialDaysLeft, hasActiveSubscription, subscriptionPlan } = useSetup();

  const [subStatus, setSubStatus]   = useState(null);
  const [gateway, setGateway]       = useState('manual');
  const [payLoading, setPayLoading] = useState(false);
  const [gracePeriodEnd, setGracePeriodEnd] = useState(null);

  useEffect(() => {
    // Load subscription status + active gateway in parallel
    Promise.all([
      axios.get('/api/stripe/subscription').then(r => r.data.data).catch(() => null),
      axios.get('/api/safepay/gateway/public').then(r => r.data.data?.activeGateway).catch(() => 'manual'),
    ]).then(([sub, gw]) => {
      setSubStatus(sub?.status || null);
      setGateway(gw);
      if (sub?.gracePeriodEnd) setGracePeriodEnd(new Date(sub.gracePeriodEnd));
    });
  }, []);

  // Don't show anything when subscription is active and healthy
  if (hasActiveSubscription && subStatus === 'active') return null;
  if (!trialActive && !subStatus) return null;

  // ── Trial banner ──────────────────────────────────────────────────────────
  if (trialActive && trialDaysLeft !== null) {
    const urgent = trialDaysLeft <= 3;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.25rem', borderRadius: 12, marginBottom: '1.25rem',
        flexWrap: 'wrap', gap: '0.75rem',
        background: urgent ? '#FEF3C7' : '#EFF6FF',
        border: `1px solid ${urgent ? '#FDE68A' : '#BFDBFE'}`,
      }}>
        <div>
          <p style={{ fontWeight: 700, color: urgent ? '#92400E' : '#1E40AF', margin: 0, fontSize: '0.9375rem' }}>
            {urgent ? '⚠️' : '🕐'} Free trial — <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong> remaining
          </p>
          <p style={{ color: urgent ? '#B45309' : '#3B82F6', fontSize: '0.8125rem', margin: '2px 0 0' }}>
            Trial ends soon. Subscribe to keep access to your school data.
          </p>
        </div>
        <Link
          to="/tenant-admin/billing"
          style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', background: urgent ? '#F59E0B' : '#3B82F6', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          {gateway === 'safepay' ? '🇵🇰 Pay Now' : 'Manage Billing →'}
        </Link>
      </div>
    );
  }

  // ── Past due / grace period ───────────────────────────────────────────────
  if (subStatus === 'past_due') {
    const handleSafePayCheckout = async () => {
      setPayLoading(true);
      try {
        const { data } = await axios.post('/api/safepay/checkout', {
          plan: subscriptionPlan || 'basic',
          studentCount: 50,
        });
        if (data.redirectUrl) window.location.href = data.redirectUrl;
      } catch { /* handled by billing page */ } finally { setPayLoading(false); }
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderRadius: 12, marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', background: '#FEF3C7', border: '1px solid #FDE68A' }}>
        <div>
          <p style={{ fontWeight: 700, color: '#92400E', margin: 0 }}>⚠️ Payment failed — grace period active</p>
          <p style={{ color: '#B45309', fontSize: '0.8125rem', margin: '2px 0 0' }}>
            {gracePeriodEnd ? `Account suspends on ${gracePeriodEnd.toLocaleDateString()}. ` : ''}
            Complete payment to restore auto-renewal.
          </p>
        </div>
        {gateway === 'safepay' ? (
          <button onClick={handleSafePayCheckout} disabled={payLoading}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', background: payLoading ? '#E5E7EB' : 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: payLoading ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: payLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {payLoading ? 'Redirecting…' : '🇵🇰 Pay Now (PKR)'}
          </button>
        ) : (
          <Link to="/tenant-admin/billing" style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', background: '#F59E0B', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Update Payment →
          </Link>
        )}
      </div>
    );
  }

  // ── Suspended ─────────────────────────────────────────────────────────────
  if (subStatus === 'suspended') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderRadius: 12, marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA' }}>
        <div>
          <p style={{ fontWeight: 700, color: '#991B1B', margin: 0 }}>🔒 Account suspended</p>
          <p style={{ color: '#EF4444', fontSize: '0.8125rem', margin: '2px 0 0' }}>Your data is safe. Complete payment to restore access.</p>
        </div>
        <Link to="/billing" style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Restore Access →
        </Link>
      </div>
    );
  }

  // ── Inactive / cancelled ──────────────────────────────────────────────────
  if (subStatus === 'inactive' || subStatus === 'cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderRadius: 12, marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <div>
          <p style={{ fontWeight: 700, color: '#374151', margin: 0 }}>📋 Subscription inactive</p>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem', margin: '2px 0 0' }}>Subscribe to continue using all features.</p>
        </div>
        <Link to="/tenant-admin/billing" style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg,#E91E8C,#FF6B35)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Subscribe Now →
        </Link>
      </div>
    );
  }

  return null;
};

export default BillingStatusBanner;
