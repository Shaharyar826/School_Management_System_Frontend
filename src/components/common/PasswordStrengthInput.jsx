import { useState } from 'react';
import PropTypes from 'prop-types';
import FloatingPasswordInput from './FloatingPasswordInput';

const calcStrength = (p) => {
  if (!p) return { score: 0, label: '', color: '' };
  const score = [p.length >= 8, /[a-z]/.test(p), /[A-Z]/.test(p), /\d/.test(p), /[^a-zA-Z\d]/.test(p)].filter(Boolean).length;
  if (score <= 2) return { score, label: 'Weak',        color: '#EF4444' };
  if (score <= 3) return { score, label: 'Medium',      color: '#F59E0B' };
  if (score <= 4) return { score, label: 'Strong',      color: '#10B981' };
  return           { score, label: 'Very Strong', color: '#059669' };
};

const PasswordStrengthInput = ({
  id, name, label, value, onChange, required = false,
  showConfirm = false, confirmValue = '', onConfirmChange = null,
  className = '', ...rest
}) => {
  const strength = calcStrength(value);
  const passwordsMatch = !showConfirm || !confirmValue || value === confirmValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      <FloatingPasswordInput
        id={id} name={name} label={label} value={value}
        onChange={onChange} required={required}
        autoComplete="new-password" className={className} {...rest}
      />

      {/* Strength bar */}
      {value && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Password strength</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
          </div>
          <div style={{ height: 4, borderRadius: 9999, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 9999, background: strength.color, width: `${(strength.score / 5) * 100}%`, transition: 'width 0.3s ease, background 0.3s ease' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem', marginTop: '0.5rem' }}>
            {[
              [/[a-z]/.test(value), 'Lowercase'],
              [/[A-Z]/.test(value), 'Uppercase'],
              [/\d/.test(value),    'Number'],
              [value.length >= 8,   '8+ characters'],
            ].map(([ok, txt]) => (
              <span key={txt} style={{ fontSize: '0.75rem', color: ok ? '#059669' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{ok ? '✓' : '○'}</span> {txt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confirm password */}
      {showConfirm && (
        <div>
          <FloatingPasswordInput
            id={`${id}-confirm`} name={`${name}Confirm`}
            label="Confirm Password" value={confirmValue}
            onChange={onConfirmChange} required={required}
            autoComplete="new-password"
          />
          {confirmValue && !passwordsMatch && (
            <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Passwords do not match</p>
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
  className: PropTypes.string,
};

export default PasswordStrengthInput;
