import { useContext, memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useSetup } from '../../context/SetupContext';

const Spinner = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#fdf2f8',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      border: '3px solid rgba(233,30,140,0.15)',
      borderTopColor: '#E91E8C',
      animation: 'spin 0.75s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// AuthenticatedRoute — the primary guard for all post-login dashboard routes.
//
// Decision tree (in order):
//   1. Still loading → spinner
//   2. Not authenticated → /login
//   3. Tenant setup incomplete for admin/principal → /setup  (silent redirect)
//   4. Trial expired + no active subscription for admin/principal → /billing
//   5. Already on /setup but setup IS complete → /dashboard  (skip landing on stale /setup)
//   6. Non-admin users on /setup while pending → /dashboard
//   7. All checks pass → render children
const AuthenticatedRoute = memo(({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useContext(AuthContext);
  const {
    setupComplete,
    trialActive,
    hasActiveSubscription,
    loading: setupLoading,
  } = useSetup();
  const location = useLocation();

  const isAdminRole = ['admin', 'principal', 'tenant_system_admin'].includes(user?.role);
  const requiresSetup = setupComplete === false && isAdminRole;

  if (authLoading || setupLoading) return <Spinner />;

  // 1. Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Setup is required only for tenant admins/principals
  if (requiresSetup && !location.pathname.startsWith('/setup')) {
    return <Navigate to="/setup" replace />;
  }

  // 3. Non-admin users should not remain on /setup when the tenant is still pending
  if (location.pathname.startsWith('/setup') && setupComplete === false && !isAdminRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Trial expired + no active subscription — only enforce for admin roles
  if (
    isAdminRole &&
    setupComplete &&
    !trialActive &&
    !hasActiveSubscription &&
    !location.pathname.startsWith('/billing') &&
    !location.pathname.startsWith('/setup')
  ) {
    return <Navigate to="/billing" replace />;
  }

  // 4. User is already on /setup but setup is complete → bounce to dashboard
  if (location.pathname.startsWith('/setup') && setupComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
});

AuthenticatedRoute.displayName = 'AuthenticatedRoute';

export default AuthenticatedRoute;