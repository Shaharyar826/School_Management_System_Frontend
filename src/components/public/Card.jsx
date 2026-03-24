const Card = ({ children, className = '', hover = true, padding = true }) => (
  <div
    className={`
      bg-white rounded-2xl border border-gray-100 shadow-sm
      ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

export default Card;
