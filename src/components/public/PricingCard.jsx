import Button from './Button';

const BRAND_GRADIENT = 'linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)';
const BRAND_PRIMARY  = '#E91E8C';

const CheckIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#10B981' }}>
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const PricingCard = ({ planKey, plan, interval, isPopular, isCurrent, onSelect, loading }) => {
  const price        = interval === 'year' ? plan.yearly  : plan.monthly;
  const monthlyEquiv = interval === 'year' ? Math.round(plan.yearly / 12) : plan.monthly;

  return (
    <div
      className="relative flex flex-col rounded-2xl border-2 transition-all duration-300 bg-white"
      style={{
        borderColor: isPopular ? BRAND_PRIMARY : '#E5E7EB',
        boxShadow:   isPopular ? '0 16px 40px rgba(233,30,140,0.15)' : 'none',
        transform:   isPopular ? 'scale(1.04)' : 'none',
      }}
      onMouseEnter={e => { if (!isPopular) { e.currentTarget.style.borderColor = BRAND_PRIMARY; e.currentTarget.style.boxShadow = '0 8px 24px rgba(233,30,140,0.12)'; }}}
      onMouseLeave={e => { if (!isPopular) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md"
            style={{ background: BRAND_GRADIENT }}
          >
            ✦ Most Popular
          </span>
        </div>
      )}

      <div className={`p-8 ${isPopular ? 'pt-10' : ''}`}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#111827] mb-1">{plan.name}</h3>
          <p className="text-sm text-[#6B7280]">{plan.tagline}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold text-[#111827]">${monthlyEquiv}</span>
            <span className="text-[#6B7280] mb-1">/mo</span>
          </div>
          {interval === 'year' && (
            <p className="text-sm font-medium mt-1" style={{ color: '#10B981' }}>
              ${price}/yr — save ${(plan.monthly * 12) - plan.yearly}/year
            </p>
          )}
        </div>

        <div className="space-y-1 mb-2 text-sm text-[#6B7280]">
          <p>👤 {plan.limits.students === -1 ? 'Unlimited' : `Up to ${plan.limits.students.toLocaleString()}`} students</p>
          <p>🧑‍🏫 {plan.limits.teachers === -1 ? 'Unlimited' : `Up to ${plan.limits.teachers}`} teachers</p>
          <p>💾 {plan.limits.storage  === -1 ? 'Unlimited' : `${plan.limits.storage} MB`} storage</p>
        </div>
      </div>

      <div className="px-8 pb-2">
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">What's included</p>
          <ul className="space-y-2.5">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-8 pt-6 mt-auto">
        {isCurrent ? (
          <div
            className="w-full text-center py-3 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(233,30,140,0.08)', color: BRAND_PRIMARY }}
          >
            ✓ Current Plan
          </div>
        ) : (
          <Button
            variant={isPopular ? 'primary' : 'outline'}
            fullWidth
            loading={loading}
            onClick={() => onSelect(planKey)}
          >
            {plan.cta}
          </Button>
        )}
        <p className="text-xs text-center text-[#6B7280] mt-3">{plan.note}</p>
      </div>
    </div>
  );
};

export default PricingCard;
