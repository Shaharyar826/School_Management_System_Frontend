import { useContext, memo, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const AuthenticatedRoute = memo(({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const [redirectInfo, setRedirectInfo] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user) {
        setCheckingStatus(false);
        return;
      }

      // Only check status for admin/principal users
      if (user.role !== 'admin' && user.role !== 'principal') {
        setRedirectInfo({ shouldRedirect: false });
        setCheckingStatus(false);
        return;
      }

      try {
        // Get tenant identifier
        const hostname = window.location.hostname;
        let tenantIdentifier = 'demo';
        
        if (hostname.includes('.') && !hostname.includes('localhost')) {
          const parts = hostname.split('.');
          tenantIdentifier = parts.length >= 3 ? parts[0] : hostname;
        } else {
          tenantIdentifier = new URLSearchParams(window.location.search).get('tenant') || 'demo';
        }
        
        const response = await axios.get('/api/onboarding/status', {
          headers: { 'X-Tenant': tenantIdentifier }
        });
        
        const data = response.data.data;
        const onboardingComplete = data.tenant?.onboarding?.onboardingComplete;
        const hasActiveSubscription = data.tenant?.billing?.hasActiveSubscription;
        const isTrialActive = data.tenant?.billing?.trialEndsAt && 
          new Date(data.tenant.billing.trialEndsAt) > new Date();
        
        // Determine redirect
        let redirectTo = null;
        
        if (!onboardingComplete && !location.pathname.startsWith('/setup')) {
          redirectTo = '/setup';
        } else if (
          onboardingComplete && 
          !hasActiveSubscription && 
          !isTrialActive && 
          !location.pathname.startsWith('/billing')
        ) {
          redirectTo = '/billing';
        } else if (
          location.pathname.startsWith('/setup') && 
          onboardingComplete
        ) {
          redirectTo = '/dashboard';
        }
        
        setRedirectInfo({
          shouldRedirect: !!redirectTo,
          redirectTo
        });
        
      } catch (error) {
        console.error('Status check failed:', error);
        setRedirectInfo({ shouldRedirect: false });
      } finally {
        setCheckingStatus(false);
      }
    };

    if (isAuthenticated && user) {
      checkUserStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [isAuthenticated, user, location.pathname]);

  if (loading || checkingStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (redirectInfo?.shouldRedirect) {
    return <Navigate to={redirectInfo.redirectTo} replace />;
  }

  return children;
});

AuthenticatedRoute.displayName = 'AuthenticatedRoute';

export default AuthenticatedRoute;