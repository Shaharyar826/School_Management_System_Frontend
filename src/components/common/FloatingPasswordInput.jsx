import { useState } from 'react';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
) : (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const FloatingPasswordInput = ({
  id, name, label, value, onChange,
  required = false, autoComplete = 'current-password',
  className = '', error = '', ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const hasValue = value !== undefined && value !== null && String(value) !== '';
  const isFloating = isFocused || hasValue;

  return (
    <div className={`floating-input-container floating-notch${isFloating ? ' is-floating' : ''}${isFocused ? ' is-focused' : ''}${error ? ' has-error' : ''}`}>
      <input
        id={id} name={name}
        type={showPass ? 'text' : 'password'}
        value={value} onChange={onChange}
        required={required}
        placeholder=""
        autoComplete={autoComplete}
        className={`floating-input w-full pr-12 outline-none ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      <fieldset className="floating-input-outline" aria-hidden="true">
        <legend><span>{label}{required ? ' *' : ''}</span></legend>
      </fieldset>
      {/* Label element — floats up on focus/filled state via CSS */}
      <label htmlFor={id} className="pointer-events-none">
        {label}{required && <span style={{ color: '#E91E8C' }}> *</span>}
      </label>
      <button
        type="button" tabIndex={-1}
        onClick={() => setShowPass(p => !p)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', zIndex: 4, padding: 0, display: 'flex' }}
        aria-label={showPass ? 'Hide password' : 'Show password'}
      >
        <EyeIcon open={showPass} />
      </button>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingPasswordInput;
