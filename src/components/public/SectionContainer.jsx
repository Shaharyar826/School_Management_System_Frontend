import Reveal from './Reveal';

const SectionContainer = ({ children, className = '', bg = 'bg-white', id }) => (
  <section id={id} className={`py-20 ${bg} ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

export const SectionHeader = ({ eyebrow, title, subtitle, center = true }) => (
  <div className={`mb-14 ${center ? 'text-center' : ''}`}>
    {eyebrow && (
      <Reveal variant="fade" duration={400}>
        <span
          className="inline-block text-sm font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
          style={{ color: '#E91E8C', background: 'rgba(233,30,140,0.08)' }}
        >
          {eyebrow}
        </span>
      </Reveal>
    )}
    <Reveal variant="up" delay={55} duration={520}>
      <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] leading-tight mb-4">
        {title}
      </h2>
    </Reveal>
    {subtitle && (
      <p className={`text-lg text-[#6B7280] leading-relaxed ${center ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionContainer;
