import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StudentFeesPage = () => {
  const { user } = useContext(AuthContext);
  const [feeRecords, setFeeRecords] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    status: '',
    feeType: ''
  });
  const [stats, setStats] = useState({
    totalFees: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (studentData) {
      fetchFeeRecords();
    }
  }, [studentData, filters]);

  const fetchStudentData = async () => {
    try {
      // For students, the backend automatically filters by the logged-in user's ID
      // No need to pass any query parameters
      const res = await axios.get('/api/students');

      if (res.data.success && res.data.data.length > 0) {
        setStudentData(res.data.data[0]);
      } else {
        setError('Student profile not found. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Please make sure you are logged in as a student.');
      } else if (error.response?.status === 404) {
        setError('Student profile not found. Please contact your administrator.');
      } else {
        setError('Failed to load student data. Please try again later.');
      }
    }
  };

  const fetchFeeRecords = async () => {
    try {
      setLoading(true);

      const params = {
        student: studentData._id,
        sort: '-dueDate'
      };

      // Add year filter
      if (filters.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31);
        params['dueDate[gte]'] = startDate.toISOString();
        params['dueDate[lte]'] = endDate.toISOString();
      }

      // Add status filter
      if (filters.status) {
        params.status = filters.status;
      }

      // Add fee type filter
      if (filters.feeType) {
        params.feeType = filters.feeType;
      }

      const res = await axios.get('/api/fees', { params });

      if (res.data.success) {
        const records = res.data.data;
        setFeeRecords(records);
        calculateStats(records);
      }
    } catch (error) {
      console.error('Error fetching fee records:', error);
      setError('Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const totalFees = records.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = records.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const pendingAmount = records
      .filter(fee => fee.status !== 'paid')
      .reduce((sum, fee) => sum + fee.remainingAmount, 0);
    const overdueAmount = records
      .filter(fee => fee.status === 'overdue')
      .reduce((sum, fee) => sum + fee.remainingAmount, 0);

    setStats({
      totalFees,
      paidAmount,
      pendingAmount,
      overdueAmount
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years.map(year => (
      <option key={year} value={year}>{year}</option>
    ));
  };

  const downloadReceipt = async (feeId) => {
    try {
      const response = await axios.get(`/api/fee-receipts/generate/${feeId}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-receipt-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt');
    }
  };

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="My Fees"
          subtitle="View your fee records and payment history"
        />

        {/* Student Info */}
        {studentData && (
          <div className="mt-4 bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Roll Number:</h3>
                <p className="text-lg font-semibold text-school-navy">{studentData.rollNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Class:</h3>
                <p className="text-lg font-semibold text-school-navy">{studentData.class} - {studentData.section}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Name:</h3>
                <p className="text-lg font-semibold text-school-navy">{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Monthly Fee:</h3>
                <p className="text-lg font-semibold text-school-navy">₹{studentData.monthlyFee}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fee Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Fees</dt>
                    <dd className="text-lg font-medium text-gray-900">₹{stats.totalFees}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Paid Amount</dt>
                    <dd className="text-lg font-medium text-gray-900">₹{stats.paidAmount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">₹{stats.pendingAmount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                    <dd className="text-lg font-medium text-gray-900">₹{stats.overdueAmount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
              <select
                id="year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
              >
                {generateYearOptions()}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label htmlFor="feeType" className="block text-sm font-medium text-gray-700">Fee Type</label>
              <select
                id="feeType"
                name="feeType"
                value={filters.feeType}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
              >
                <option value="">All Types</option>
                <option value="tuition">Tuition</option>
                <option value="exam">Exam</option>
                <option value="transport">Transport</option>
                <option value="library">Library</option>
                <option value="laboratory">Laboratory</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fee Records Table */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Fee Records</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your fee payment history for the selected period.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : feeRecords.length === 0 ? (
            <div className="px-4 py-5 sm:px-6">
              <p className="text-gray-500">No fee records found for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.feeType.charAt(0).toUpperCase() + record.feeType.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{record.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{record.paidAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {record.status === 'paid' && (
                          <button
                            onClick={() => downloadReceipt(record._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Download Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeesPage;
