import { useLocation, Link } from 'react-router-dom';
import { FEATURE_CONFIG } from '../config/features';

const FeatureRestrictedPage = () => {
  const location = useLocation();
  const { feature, from } = location.state || {};
  
  const featureConfig = feature ? FEATURE_CONFIG[feature] : null;
  const featureName = featureConfig?.name || 'This feature';
  const featureDescription = featureConfig?.description || 'This functionality';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Feature Not Available
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {featureName} is not included in your current plan.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {featureDescription} requires a subscription upgrade.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            to="/subscription"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upgrade Your Plan
          </Link>
          
          <Link
            to={from || "/dashboard"}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </Link>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? <Link to="/contact" className="text-blue-600 hover:text-blue-500">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureRestrictedPage;