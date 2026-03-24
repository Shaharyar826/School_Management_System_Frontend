import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import SuperAdminContext from '../../context/SuperAdminContext';

const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(SuperAdminContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/super-admin/login" replace />;
};

export default SuperAdminRoute;