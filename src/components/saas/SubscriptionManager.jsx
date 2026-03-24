import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from '../../config/axios';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatLimit = (value, unit = '') =>
  value === -1 ? 'Unlimited' : `${value.toLocaleString()}${unit}`;

const formatPrice = (cents, interval) => {
  const dollars = (cents / 100).toFixed(0);
  return `$${dollars}/${interval === 'year' ? 'yr' : 'mo'}`;
};

const STATUS_STYLES = {
  active:    'bg-green-100 text-green-700',
  trialing:  'bg-blue-100 text-blue-700',
  past_due:  'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  unpaid:    'bg-orange-100 text-orange-700'
};

const PLAN_ACCENT = {
  starter:      'border-blue-300',
  professional: 'border-purple-400',
  enterprise:   'border-emerald-400'
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function UsageBar({ label, used, max, color = 'bg-blue-500' }) {
  const pct = max === -1 ? 0 : Math.min((used / max) * 100, 100);
  const isWarning = pct >= 80 && max !== -1;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={isWarning ? 'text-red-600 font-semibold' : 'text-gray-500'}>
          {used.toLocaleString()} / {formatLimit(max)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${isWarning ? 'bg-red-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isWarning && (
        <p className="text-xs text-red-500 mt-1">Approaching limit — consider upgrading</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.cancelled}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

function BillingToggle({ interval, onChange }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <span className={`text-sm font-medium ${interval === 'month' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
      <button
        onClick={() => onChange(interval === 'month' ? 'year' : 'month')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${interval === 'year' ? 'bg-purple-600' : 'bg-gray-300'}`}
        aria-label="Toggle billing interval"
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${interval === 'year' ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className={`text-sm font-medium ${interval === 'year' ? 'text-gray-900' : 'text-gray-400'}`}>
        Yearly <span className="text-green-600 font-semibold">(Save ~17%)</span>
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState({});
  const [plans, setPlans] = useState({});
  const [trialDays, setTrialDays] = useState(7);
  const [interval, setInterval] = useState('month');
  const [loadingPlan, setLoadingPlan] = useState(null); // per-plan loading key
  const [portalLoading, setPortalLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSubscription(), fetchPlans()]).finally(() => setPageLoading(false));

    // Handle redirect back from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('🎉 Subscription activated successfully!');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('canceled') === 'true') {
      toast.info('Checkout was canceled. No charges were made.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data } = await axios.get('/api/subscription');
      setSubscription(data.subscription);
      setUsage(data.usage || {});
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load subscription data');
      }
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/api/subscription/plans');
      setPlans(data.plans || {});
      setTrialDays(data.trialDays || 7);
    } catch {
      toast.error('Failed to load pricing plans');
    }
  };

  const handleSelectPlan = useCallback(async (planKey) => {
    setLoadingPlan(planKey);
    try {
      const { data } = await axios.post('/api/subscription/create-checkout-session', {
        plan: planKey,
        interval
      });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }, [interval]);

  const handleManageBilling = useCallback(async () => {
    setPortalLoading(true);
    try {
      const { data } = await axios.post('/api/subscription/create-portal-session');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  }, []);

  // Memoize plan entries to avoid re-rendering on unrelated state changes
  const planEntries = useMemo(() => Object.entries(plans), [plans]);

  const trialDaysLeft = useMemo(() => {
    if (!subscription?.trialEnd) return null;
    const diff = new Date(subscription.trialEnd) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your plan, usage, and billing details</p>
      </div>

      {/* Trial Banner */}
      {subscription?.status === 'trialing' && trialDaysLeft !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-800">
              🕐 Free trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining
            </p>
            <p className="text-sm text-blue-600 mt-0.5">
              Trial ends {new Date(subscription.trialEnd).toLocaleDateString()}. Add a payment method to continue.
            </p>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {portalLoading ? 'Loading…' : 'Add Payment Method'}
          </button>
        </div>
      )}

      {/* Past Due Warning */}
      {subscription?.status === 'past_due' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="font-semibold text-red-800">⚠️ Payment failed — please update your billing details to avoid service interruption.</p>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
          >
            {portalLoading ? 'Loading…' : 'Fix Payment'}
          </button>
        </div>
      )}

      {/* Current Plan Card */}
      {subscription && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Current Plan</h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold capitalize text-gray-900">{subscription.plan}</span>
                <StatusBadge status={subscription.status} />
                {subscription.cancelAtPeriodEnd && (
                  <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                    Cancels at period end
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {subscription.status === 'trialing'
                  ? `Trial ends ${new Date(subscription.trialEnd).toLocaleDateString()}`
                  : `Next billing: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {portalLoading ? 'Loading…' : 'Manage Billing →'}
            </button>
          </div>

          {/* Usage Progress Bars */}
          <div className="mt-6 grid sm:grid-cols-2 gap-5">
            <UsageBar label="Students" used={usage.students || 0} max={subscription.limits?.maxStudents} color="bg-blue-500" />
            <UsageBar label="Teachers" used={usage.teachers || 0} max={subscription.limits?.maxTeachers} color="bg-green-500" />
            <UsageBar label="Storage" used={usage.storage || 0} max={subscription.limits?.maxStorage} color="bg-purple-500" />
            <UsageBar label="API Calls" used={usage.apiCalls || 0} max={subscription.limits?.maxApiCalls} color="bg-orange-500" />
          </div>
        </div>
      )}

      {/* Plans Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {subscription ? 'Change Plan' : 'Choose a Plan'}
          </h2>
          <BillingToggle interval={interval} onChange={setInterval} />
        </div>

        {!subscription && (
          <p className="text-sm text-center text-gray-500 mb-4">
            All plans include a <span className="font-semibold text-blue-600">{trialDays}-day free trial</span>. No credit card required to start.
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {planEntries.map(([planKey, plan]) => {
            const priceConfig = interval === 'year' ? plan.yearly : plan.monthly;
            const isCurrent = subscription?.plan === planKey;
            const isLoading = loadingPlan === planKey;

            return (
              <div
                key={planKey}
                className={`relative border-2 rounded-xl p-5 flex flex-col transition-shadow hover:shadow-md ${
                  isCurrent ? 'border-blue-500 bg-blue-50' : PLAN_ACCENT[planKey] || 'border-gray-200'
                }`}
              >
                {plan.popular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-900 capitalize">{planKey}</h3>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {formatPrice(priceConfig.amount, interval)}
                  </p>
                  {interval === 'year' && (
                    <p className="text-xs text-green-600 font-medium">
                      ~{formatPrice(Math.round(priceConfig.amount / 12), 'month')} billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-1.5 text-sm text-gray-600 flex-1 mb-5">
                  <li>👤 {formatLimit(plan.limits.maxStudents)} students</li>
                  <li>🧑‍🏫 {formatLimit(plan.limits.maxTeachers)} teachers</li>
                  <li>💾 {formatLimit(plan.limits.maxStorage, ' MB')} storage</li>
                  {plan.features.slice(0, 3).map(f => (
                    <li key={f} className="flex items-center gap-1.5">
                      <span className="text-green-500">✓</span>
                      {f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-gray-400 text-xs">+{plan.features.length - 3} more features</li>
                  )}
                </ul>

                {isCurrent ? (
                  <span className="block text-center text-sm font-semibold text-blue-700 bg-blue-100 rounded-lg py-2">
                    Current Plan
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(planKey)}
                    disabled={!!loadingPlan}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Redirecting…
                      </span>
                    ) : (
                      subscription ? 'Switch to this plan' : `Start ${trialDays}-day trial`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
