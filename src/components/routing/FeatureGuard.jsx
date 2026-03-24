import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import TenantFeaturesContext from '../../context/TenantFeaturesContext';
import AuthContext from '../../context/AuthContext';
import { getFeatureForRoute, canRoleAccessFeature } from '../../config/features';

const FeatureGuard = ({ children }) => {
  const { hasFeature, loading } = useContext(TenantFeaturesContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setChecking(false);
    }
  }, [loading]);

  if (checking || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const requiredFeature = getFeatureForRoute(location.pathname);
  
  if (!requiredFeature) {
    return children;
  }

  if (!canRoleAccessFeature(user?.role, requiredFeature)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasFeature(requiredFeature)) {
    return <Navigate to="/feature-restricted" replace state={{ 
      feature: requiredFeature,
      from: location.pathname 
    }} />;
  }

  return children;
};

export default FeatureGuard;