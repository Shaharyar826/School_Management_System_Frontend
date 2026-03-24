const VARIANTS = {
  primary:   'bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-[#7C3AED] hover:bg-purple-700 text-white shadow-sm hover:shadow-md',
  cta:       'bg-[#F59E0B] hover:bg-amber-500 text-white shadow-sm hover:shadow-md',
  outline:   'border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50',
  ghost:     'text-[#2563EB] hover:bg-blue-50',
  white:     'bg-white text-[#2563EB] hover:bg-gray-50 shadow-sm hover:shadow-md',
};

const SIZES = {
  sm:  'px-4 py-2 text-sm',
  md:  'px-6 py-2.5 text-sm',
  lg:  'px-8 py-3.5 text-base',
  xl:  'px-10 py-4 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}) => (
  <button
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center gap-2 font-semibold rounded-xl
      transition-all duration-200 ease-in-out
      hover:-translate-y-0.5 active:translate-y-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB]
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

export default Button;
