import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const EmailVerification = () => {
  const { verifyEmail, resendVerification, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    const token = searchParams.get('token');
    const tenant = searchParams.get('tenant');
    
    if (token && tenant) {
      handleVerification(token, tenant);
    }
  }, [searchParams]);

  const handleVerification = async (token, tenantIdentifier) => {
    try {
      const result = await verifyEmail(token, tenantIdentifier);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        
        // Backend controls redirect
        setTimeout(() => {
          navigate(result.redirectTo || '/dashboard');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    const tenantIdentifier = window.location.hostname.split('.')[0] || 'demo';
    const result = await resendVerification(email, tenantIdentifier);
    
    if (result.success) {
      setMessage('Verification email sent! Please check your inbox.');
      setCanResend(false);
      setResendCountdown(60);
      
      const countdown = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          
          {status === 'pending' && (
            <p className="mt-2 text-sm text-gray-600">
              Please check your email and click the verification link
            </p>
          )}
          
          {status === 'success' && (
            <div className="mt-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{message}</p>
                    <p className="text-xs text-green-600 mt-1">Redirecting to setup...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{message}</p>
              </div>
            </div>
          )}
        </div>

        {status === 'pending' && (
          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email to resend verification"
              />
            </div>
            
            <button
              onClick={handleResendVerification}
              disabled={loading || !canResend}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : canResend ? 'Resend Verification Email' : `Resend in ${resendCountdown}s`}
            </button>
          </div>
        )}

        {message && status === 'pending' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;