import { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';

const SuperAdminContext = createContext();

export const SuperAdminProvider = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('superAdminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/super-admin/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuperAdmin(response.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('superAdminToken');
      setSuperAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await axios.post('/api/super-admin/login', {
      email,
      password
    });

    const { token, data: adminData } = response.data;
    localStorage.setItem('superAdminToken', token);
    setSuperAdmin(adminData);
    setIsAuthenticated(true);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('superAdminToken');
    setSuperAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    superAdmin,
    token: localStorage.getItem('superAdminToken'),
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export default SuperAdminContext;