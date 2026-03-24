import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import PasswordStrengthInput from '../common/PasswordStrengthInput';
import PhoneInput from '../common/PhoneInput';
import { Header, Footer } from '../saas/EduFlowLanding';

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
      navigate(result.redirectTo);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
      setFieldErrors(result.fieldErrors || {});
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create Your School Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your 14-day free trial
          </p>
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
      <Footer />
    </div>
  );
};

export default TenantRegistration;