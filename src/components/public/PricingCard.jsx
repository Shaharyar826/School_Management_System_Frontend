import Button from './Button';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const PricingCard = ({ planKey, plan, interval, isPopular, isCurrent, onSelect, loading }) => {
  const price = interval === 'year' ? plan.yearly : plan.monthly;
  const monthlyEquiv = interval === 'year' ? Math.round(plan.yearly / 12) : plan.monthly;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 transition-all duration-300 ${
        isPopular
          ? 'border-[#7C3AED] shadow-xl shadow-purple-100 scale-105'
          : 'border-gray-200 hover:border-[#2563EB] hover:shadow-lg'
      } bg-white`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
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
            <p className="text-sm text-[#10B981] font-medium mt-1">
              ${price}/yr — save ${(plan.monthly * 12) - plan.yearly}/year
            </p>
          )}
        </div>

        <div className="space-y-1 mb-2 text-sm text-[#6B7280]">
          <p>👤 {plan.limits.students === -1 ? 'Unlimited' : `Up to ${plan.limits.students.toLocaleString()}`} students</p>
          <p>🧑‍🏫 {plan.limits.teachers === -1 ? 'Unlimited' : `Up to ${plan.limits.teachers}`} teachers</p>
          <p>💾 {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage} MB`} storage</p>
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
          <div className="w-full text-center py-3 rounded-xl bg-blue-50 text-[#2563EB] font-semibold text-sm">
            ✓ Current Plan
          </div>
        ) : (
          <Button
            variant={isPopular ? 'secondary' : 'outline'}
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
