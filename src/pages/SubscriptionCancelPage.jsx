import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const SubscriptionCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">Your payment was cancelled. No charges have been made to your account.</p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => navigate('/subscription')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
            Return to Dashboard
          </Button>
          <p className="text-sm text-gray-500">
            If you're experiencing issues, please contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;
