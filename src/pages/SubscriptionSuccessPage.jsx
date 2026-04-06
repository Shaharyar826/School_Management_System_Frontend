import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripe } from '../context/StripeContext';
import { useSetup } from '../context/SetupContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription } = useStripe();
  const { refresh: refreshSetup } = useSetup();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        if (sessionId) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        await refreshSubscription();
        await refreshSetup();
        toast.success('Subscription activated successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Subscription refresh error:', error);
        toast.error('There was an issue processing your subscription');
      } finally {
        setLoading(false);
      }
    };

    handleSuccess();
  }, [sessionId, refreshSubscription, refreshSetup, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner fullScreen={false} />
          <p className="mt-4 text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your subscription has been activated. You now have access to all features of your selected plan.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => navigate('/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Continue to Dashboard
          </Button>
          <p className="text-sm text-gray-500">
            You will receive a confirmation email shortly with your subscription details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
