import { useState, useEffect } from 'react';
import axios from '../config/axios';

export const useStudentLimit = () => {
  const [limitInfo, setLimitInfo] = useState({
    currentCount: 0,
    limit: 50,
    remaining: 50,
    canAdd: true
  });
  const [loading, setLoading] = useState(true);

  const fetchLimitInfo = async () => {
    try {
      const response = await axios.get('/api/students/limit-info');
      setLimitInfo(response.data.data);
    } catch (error) {
      console.error('Failed to fetch student limit info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('ba_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetchLimitInfo();
  }, []);

  const checkCanAdd = (countToAdd = 1) => {
    return (limitInfo.currentCount + countToAdd) <= limitInfo.limit;
  };

  const refreshLimitInfo = () => {
    fetchLimitInfo();
  };

  return {
    limitInfo,
    loading,
    checkCanAdd,
    refreshLimitInfo
  };
};