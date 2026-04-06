import { useContext, memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useSetup } from '../../context/SetupContext';

const GRAD = 'linear-gradient(135deg, #E91E8C, #FF6B35)';

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

// PrivateRoute — only checks authentication + setup completion.
// If not authenticated → /login
// If authenticated but setup not done → /setup (UNLESS already on /setup)
// If authenticated and setup done → render children
const PrivateRoute = memo(({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useContext(AuthContext);
  const { setupComplete, loading: setupLoading } = useSetup();
  const location = useLocation();

  const isSetupAdmin = ['admin', 'principal', 'tenant_system_admin'].includes(user?.role);
  const requiresSetup = setupComplete === false && isSetupAdmin;

  if (authLoading || setupLoading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only tenant admins should be routed into setup when organization onboarding is incomplete
  if (requiresSetup && !location.pathname.startsWith('/setup') && !location.pathname.startsWith('/reset-temp-password')) {
    return <Navigate to="/setup" replace />;
  }

  // If a non-admin user lands on /setup while the tenant is not yet onboarded, bounce back to dashboard
  if (location.pathname.startsWith('/setup') && setupComplete === false && !isSetupAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
});

PrivateRoute.displayName = 'PrivateRoute';

export default PrivateRoute;
