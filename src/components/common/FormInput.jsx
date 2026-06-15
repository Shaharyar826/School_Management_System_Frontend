import { useState } from 'react';

const FormInput = ({
  id, name, type = 'text', label, value, onChange,
  required = false, placeholder = '', className = '',
  floating = true, error = '', onBlur: externalOnBlur, onFocus: externalOnFocus, ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  if (!floating) {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}{required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <input
          id={id} name={name} type={type} value={value} onChange={onChange}
          required={required} placeholder={placeholder}
          className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${error ? 'border-red-500' : ''} ${className}`}
          onBlur={externalOnBlur}
          onFocus={externalOnFocus}
          {...rest}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // isFloating: true when focused OR when input has a real value
  const hasValue = value !== undefined && value !== null && String(value) !== '';
  const isFloating = isFocused || hasValue;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (typeof externalOnFocus === 'function') externalOnFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (typeof externalOnBlur === 'function') externalOnBlur(e);
  };

  return (
    <div
      className={`floating-input-container floating-notch${isFloating ? ' is-floating' : ''}${isFocused ? ' is-focused' : ''}${error ? ' has-error' : ''}`}
    >
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder || ' '}
        className={`floating-input w-full outline-none ${className}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      <fieldset className="floating-input-outline" aria-hidden="true">
        <legend>
          <span>{label}{required ? ' *' : ''}</span>
        </legend>
      </fieldset>
      {/* Floating label — shown at rest, floats up on focus or when field has a value */}
      <label htmlFor={id} className="pointer-events-none">
        {label}{required && <span style={{ color: '#E91E8C' }}> *</span>}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;
