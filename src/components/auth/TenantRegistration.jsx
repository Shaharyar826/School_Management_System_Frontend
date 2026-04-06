import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import PasswordStrengthInput from '../common/PasswordStrengthInput';
import PhoneInput from '../common/PhoneInput';
import { AuthLayout } from '../public/PublicLayout';

const TenantRegistration = () => {
  const { registerTenant, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subdomain: '',
    schoolName: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    nationality: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'subdomain') {
      setSubdomainAvailable(null);
    }
  };

  const onPhoneChange = (value) => {
    setFormData({ ...formData, phoneNumber: value || '' });
  };

  const onConfirmPasswordChange = (e) => {
    setFormData({ ...formData, confirmPassword: e.target.value });
  };

  const checkSubdomain = async () => {
    if (!formData.subdomain) return;
    
    try {
      const res = await fetch(`/api/onboarding/check-subdomain/${formData.subdomain}`);
      const data = await res.json();
      setSubdomainAvailable(data.available);
    } catch (err) {
      console.error('Subdomain check failed:', err);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (subdomainAvailable === false) {
      setError('Subdomain is not available');
      return;
    }

    const result = await registerTenant(formData);
    
    if (result.success) {
      if (result.requiresVerification || result.nextStep === 'verify-email') {
        navigate('/verify-email', { state: { email: formData.adminEmail } });
      } else if (result.nextStep) {
        navigate(`/${result.nextStep.replace(/^\//, '')}`);
      } else {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }
    } else {
      setError(result.message || 'Registration failed. Please try again.');
      setFieldErrors(result.fieldErrors || {});
    }
  };

  return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5.5rem 1rem 3rem', background: 'linear-gradient(135deg, #FFF0F8 0%, #F5F0FF 60%, #FAFAFA 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 20, boxShadow: '0 4px 30px rgba(233,30,140,0.08)', border: '1px solid #F3E8FF', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 16px rgba(233,30,140,0.3)' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>Create Your School Portal</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Start your 14-day free trial. No credit card required.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <FormInput
                id="subdomain"
                name="subdomain"
                type="text"
                label="School Subdomain"
                required
                value={formData.subdomain}
                onChange={onChange}
                onBlur={checkSubdomain}
              />
              {fieldErrors.subdomain && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.subdomain}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Your portal will be: {formData.subdomain}.eduflow.com
              </p>
              {subdomainAvailable === false && (
                <p className="text-xs text-red-500 mt-1">Subdomain not available</p>
              )}
              {subdomainAvailable === true && (
                <p className="text-xs text-green-500 mt-1">Subdomain available!</p>
              )}
            </div>

            <FormInput
              id="schoolName"
              name="schoolName"
              type="text"
              label="School Name"
              required
              value={formData.schoolName}
              onChange={onChange}
            />
            {fieldErrors.schoolName && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.schoolName}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInput
                  id="adminFirstName"
                  name="adminFirstName"
                  type="text"
                  label="First Name"
                  required
                  value={formData.adminFirstName}
                  onChange={onChange}
                />
                {fieldErrors.adminFirstName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.adminFirstName}</p>
                )}
              </div>
              <div>
                <FormInput
                  id="adminLastName"
                  name="adminLastName"
                  type="text"
                  label="Last Name"
                  required
                  value={formData.adminLastName}
                  onChange={onChange}
                />
                {fieldErrors.adminLastName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.adminLastName}</p>
                )}
              </div>
            </div>

            <FormInput
              id="adminEmail"
              name="adminEmail"
              type="email"
              label="Admin Email"
              required
              value={formData.adminEmail}
              onChange={onChange}
            />
            {fieldErrors.adminEmail && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.adminEmail}</p>
            )}

            <FormInput
              id="nationality"
              name="nationality"
              type="text"
              label="Nationality"
              value={formData.nationality}
              onChange={onChange}
            />
            {fieldErrors.nationality && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.nationality}</p>
            )}

            <PhoneInput
              value={formData.phoneNumber}
              onChange={onPhoneChange}
              error={fieldErrors.phoneNumber}
            />

            <PasswordStrengthInput
              id="adminPassword"
              name="adminPassword"
              label="Password"
              required
              value={formData.adminPassword}
              onChange={onChange}
              showConfirm={true}
              confirmValue={formData.confirmPassword}
              onConfirmChange={onConfirmPasswordChange}
            />
            {fieldErrors.adminPassword && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.adminPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || subdomainAvailable === false}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create School Portal'}
          </button>
        </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default TenantRegistration;