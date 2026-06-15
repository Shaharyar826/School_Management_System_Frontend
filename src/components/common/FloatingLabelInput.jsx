import { useState } from 'react';

/** Alias of FormInput — same notch floating label pattern. */
const FloatingLabelInput = ({ id, name, type = 'text', label, value, onChange, required = false, className = '', error = '', ...rest }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || Boolean(value);

  return (
    <div className={`floating-input-container floating-notch ${isFloating ? 'is-floating' : ''} ${isFocused ? 'is-focused' : ''} ${error ? 'has-error' : ''}`}>
      <input
        id={id} name={name} type={type} value={value} onChange={onChange}
        required={required} placeholder=" "
        className={`floating-input w-full px-4 py-3 outline-none ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      <fieldset className="floating-input-outline" aria-hidden="true">
        <legend><span>{label}{required ? ' *' : ''}</span></legend>
      </fieldset>
      <label htmlFor={id} className="transition-all duration-200 pointer-events-none">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingLabelInput;
