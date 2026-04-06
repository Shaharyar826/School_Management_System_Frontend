import Card from './Card';

const ACCENTS = {
  blue:   { bg: 'rgba(233,30,140,0.08)',  color: '#E91E8C' },
  purple: { bg: 'rgba(147,51,234,0.08)', color: '#9333EA' },
  green:  { bg: 'rgba(16,185,129,0.08)', color: '#10B981' },
  orange: { bg: 'rgba(245,158,11,0.08)', color: '#F59E0B' },
};

const FeatureCard = ({ icon, title, description, accent = 'blue' }) => {
  const { bg, color } = ACCENTS[accent] || ACCENTS.blue;
  return (
    <Card className="group">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <h3
        className="text-lg font-bold text-[#111827] mb-2 transition-colors duration-150"
        style={{ ['--tw-text-opacity']: 1 }}
        onMouseEnter={e => e.currentTarget.style.color = '#E91E8C'}
        onMouseLeave={e => e.currentTarget.style.color = '#111827'}
      >
        {title}
      </h3>
      <p className="text-[#6B7280] text-sm leading-relaxed">{description}</p>
    </Card>
  );
};

export default FeatureCard;
