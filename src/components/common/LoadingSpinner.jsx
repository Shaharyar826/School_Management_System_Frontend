const SIZE = { sm: 'h-6 w-6', md: 'h-12 w-12', lg: 'h-16 w-16', xl: 'h-20 w-20' };
const COLOR = {
  blue: 'border-blue-500', yellow: 'border-school-yellow',
  orange: 'border-school-orange', navy: 'border-school-navy-dark',
  green: 'border-green-500', red: 'border-red-500', white: 'border-white'
};

const LoadingSpinner = ({ fullScreen = true, size = 'md', color = 'blue', text = null, className = '' }) => {
  const spinner = (
    <div className={`animate-spin rounded-full ${SIZE[size]} border-t-2 border-b-2 ${COLOR[color]}`} />
  );

  return (
    <div className={`flex flex-col justify-center items-center ${fullScreen ? 'min-h-screen' : 'py-10'} ${className}`}>
      {spinner}
      {text && <p className="mt-4 text-gray-600 dark:text-gray-300 text-center">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
