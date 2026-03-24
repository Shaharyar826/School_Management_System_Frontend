import { useState } from 'react';
import PropTypes from 'prop-types';

const PasswordStrengthInput = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  showConfirm = false,
  confirmValue = '',
  onConfirmChange = null,
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Password strength calculation
  const calculateStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' };
    return { score, label: 'Very Strong', color: 'bg-green-600' };
  };

  const strength = calculateStrength(value);
  const shouldFloat = isFocused || value;
  const passwordsMatch = !showConfirm || value === confirmValue;

  return (
    <div className="space-y-4">
      {/* Main Password Field */}
      <div className="floating-input-container relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          placeholder=" "
          className={`floating-input peer w-full px-4 py-3 pr-12 border rounded-md transition-all duration-200 outline-none ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>

        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none
            ${shouldFloat
              ? 'text-sm text-green-500 -top-2.5 bg-white px-1'
              : 'text-gray-500 top-3'}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>

      {/* Password Strength Indicator */}
      {value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Password Strength:</span>
            <span className={`text-sm font-medium ${
              strength.label === 'Weak' ? 'text-red-500' :
              strength.label === 'Medium' ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {strength.label}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center ${/[a-z]/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-1">✓</span> Lowercase
            </div>
            <div className={`flex items-center ${/[A-Z]/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-1">✓</span> Uppercase
            </div>
            <div className={`flex items-center ${/\d/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-1">✓</span> Numbers
            </div>
            <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(value) ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-1">✓</span> Symbols
            </div>
          </div>
        </div>
      )}

      {/* Confirm Password Field */}
      {showConfirm && (
        <div className="floating-input-container relative">
          <input
            id={`${id}-confirm`}
            name={`${name}Confirm`}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmValue}
            onChange={onConfirmChange}
            required={required}
            placeholder=" "
            className={`floating-input peer w-full px-4 py-3 pr-12 border rounded-md transition-all duration-200 outline-none ${
              confirmValue && !passwordsMatch ? 'border-red-500' : ''
            }`}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>

          <label
            htmlFor={`${id}-confirm`}
            className={`absolute left-4 transition-all duration-200 pointer-events-none
              ${confirmValue
                ? 'text-sm text-green-500 -top-2.5 bg-white px-1'
                : 'text-gray-500 top-3'}`}
          >
            Confirm Password {required && <span className="text-red-500">*</span>}
          </label>

          {confirmValue && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
          )}
        </div>
      )}
    </div>
  );
};

PasswordStrengthInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  showConfirm: PropTypes.bool,
  confirmValue: PropTypes.string,
  onConfirmChange: PropTypes.func,
  className: PropTypes.string
};

export default PasswordStrengthInput;