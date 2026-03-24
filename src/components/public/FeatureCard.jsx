import Card from './Card';

const FeatureCard = ({ icon, title, description, accent = 'blue' }) => {
  const accents = {
    blue:   'bg-blue-50 text-[#2563EB]',
    purple: 'bg-purple-50 text-[#7C3AED]',
    green:  'bg-green-50 text-[#10B981]',
    orange: 'bg-orange-50 text-[#F59E0B]',
  };

  return (
    <Card className="group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl ${accents[accent]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#111827] mb-2 group-hover:text-[#2563EB] transition-colors duration-150">
        {title}
      </h3>
      <p className="text-[#6B7280] text-sm leading-relaxed">{description}</p>
    </Card>
  );
};

export default FeatureCard;
