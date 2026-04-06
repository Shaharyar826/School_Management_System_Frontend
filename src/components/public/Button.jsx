/* Public landing-page button variants — brand pink palette */

const VARIANTS = {
  primary:   'text-white shadow-sm hover:shadow-md hover:opacity-90',
  secondary: 'text-white shadow-sm hover:shadow-md hover:opacity-90',
  cta:       'text-white shadow-sm hover:shadow-md',
  outline:   'border-2 text-[#E91E8C] hover:opacity-80',
  ghost:     'hover:opacity-80',
  white:     'bg-white shadow-sm hover:bg-gray-50 hover:shadow-md',
};

const SIZES = {
  sm:  'px-4 py-2 text-sm',
  md:  'px-6 py-2.5 text-sm',
  lg:  'px-8 py-3.5 text-base',
  xl:  'px-10 py-4 text-lg',
};

const GRADIENT = 'linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)';
const BORDER_COLOR = '#E91E8C';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}) => {
  /* Inline gradient for primary / secondary / cta */
  const needsGradient = ['primary', 'secondary', 'cta'].includes(variant);
  const needsBorder   = variant === 'outline';
  const isGhost       = variant === 'ghost';
  const isWhite       = variant === 'white';

  const inlineStyle = needsGradient
    ? { background: GRADIENT }
    : needsBorder
    ? { borderColor: BORDER_COLOR, color: BORDER_COLOR }
    : isGhost
    ? { color: '#E91E8C', background: 'transparent', border: 'none' }
    : isWhite
    ? { color: '#E91E8C' }
    : {};

  return (
    <button
      disabled={disabled || loading}
      style={inlineStyle}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-full
        transition-all duration-200 ease-in-out
        hover:-translate-y-0.5 active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${VARIANTS[variant]} ${SIZES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
