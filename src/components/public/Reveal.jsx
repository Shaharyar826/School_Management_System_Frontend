import useScrollAnimation from '../../hooks/useScrollAnimation';

/**
 * Reveal — selective scroll animation. Use sparingly.
 *
 * Each variant has its own easing curve tuned for that motion type:
 * - 'up'    → gentle lift, ease-out-quart (content entering)
 * - 'hero'  → slight overshoot, spring-like (hero headlines)
 * - 'fade'  → pure opacity, linear-ish (subtle elements)
 * - 'left' / 'right' → directional slides, ease-out-expo
 * - 'scale' → grows from 97%, ease-out-back (cards, badges)
 */
const EASING = {
  up:    'cubic-bezier(0.16, 1, 0.3, 1)',       // ease-out-quart
  hero:  'cubic-bezier(0.34, 1.4, 0.64, 1)',    // slight spring overshoot
  fade:  'cubic-bezier(0.4, 0, 0.2, 1)',        // material standard
  left:  'cubic-bezier(0.19, 1, 0.22, 1)',      // ease-out-expo
  right: 'cubic-bezier(0.19, 1, 0.22, 1)',
  scale: 'cubic-bezier(0.34, 1.56, 0.64, 1)',   // ease-out-back (bouncy)
};

const HIDDEN = {
  up:    { opacity: 0, transform: 'translateY(28px)' },
  hero:  { opacity: 0, transform: 'translateY(22px)' },
  fade:  { opacity: 0 },
  left:  { opacity: 0, transform: 'translateX(32px)' },
  right: { opacity: 0, transform: 'translateX(-32px)' },
  scale: { opacity: 0, transform: 'scale(0.97)' },
};

const VISIBLE = {
  up:    { opacity: 1, transform: 'translateY(0)' },
  hero:  { opacity: 1, transform: 'translateY(0)' },
  fade:  { opacity: 1 },
  left:  { opacity: 1, transform: 'translateX(0)' },
  right: { opacity: 1, transform: 'translateX(0)' },
  scale: { opacity: 1, transform: 'scale(1)' },
};

const Reveal = ({
  children,
  variant = 'up',
  delay = 0,
  duration = 580,
  threshold = 0.1,
  className = '',
  as: Tag = 'div',
  style: externalStyle = {},
}) => {
  const [ref, visible] = useScrollAnimation(threshold);
  const ease = EASING[variant] ?? EASING.up;
  const from = HIDDEN[variant] ?? HIDDEN.up;
  const to   = VISIBLE[variant] ?? VISIBLE.up;

  const currentStyle = visible ? to : from;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...currentStyle,
        transition: `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}`,
        transitionDelay: delay ? `${delay}ms` : undefined,
        ...externalStyle,
      }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
