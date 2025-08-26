import { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StudentFeeStatusTable from '../components/fees/StudentFeeStatusTable';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

const FeesPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showCleanupConfirmation, setShowCleanupConfirmation] = useState(false);

  // Filter state
  const [filter, setFilter] = useState({
    class: '',
    section: '',
    month: '',
    status: '',
    feeType: '',
    _refresh: null // Used to trigger a refresh of the fee data
  });

  // Get current month and year for default filter
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.getMonth() + 1, // JavaScript months are 0-indexed
      year: now.getFullYear()
    };
  };

  // Format the current month for display in the filter
  const currentMonthYear = useMemo(() => {
    const { month, year } = getCurrentMonthYear();
    return `${year}-${month.toString().padStart(2, '0')}`;
  }, []);

  // Initialize month filter with current month without triggering refresh
  useEffect(() => {
    setFilter(prev => ({
      ...prev,
      month: currentMonthYear
      // Don't set _refresh here to avoid unnecessary initial refreshes
    }));
  }, [currentMonthYear]);

  // Check for success message from location state (when redirected from AddFee or ProcessFeePayment)
  useEffect(() => {
    if (location.state?.message) {
      console.log('Received location state with message:', location.state);

      // Set the success message
      setSuccessMessage(location.state.message);

      // Clear the message from location state after displaying it
      window.history.replaceState({}, document.title);

      // Force a refresh of the StudentFeeStatusTable component
      // This is done by updating a state variable that's passed to the component
      const refreshTimestamp = location.state._timestamp || Date.now();
      console.log('Setting refresh trigger with timestamp:', refreshTimestamp);

      // Add a small delay before triggering the refresh to ensure the database has updated
      setTimeout(() => {
        setFilter(prev => ({
          ...prev,
          _refresh: refreshTimestamp
        }));
        console.log('Refresh trigger set with timestamp:', refreshTimestamp);
      }, 500);

      // Reset any error state
      setError('');

      // Auto-hide the success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await axios.get('/api/filters/classes?userType=student');

        if (res.data.success) {
          setClasses(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please try again.');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch sections when class changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!filter.class || filter.class === 'all') {
        setSections([]);
        return;
      }

      try {
        const res = await axios.get(`/api/filters/sections?class=${filter.class}&userType=student`);

        if (res.data.success) {
          setSections(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching sections:', err);
      }
    };

    fetchSections();
    // Reset section when class changes
    setFilter(prev => ({ ...prev, section: '' }));
  }, [filter.class]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Parse month filter into month and year
  const selectedMonthYear = useMemo(() => {
    if (!filter.month) return null;

    const [year, month] = filter.month.split('-').map(Number);
    return { month, year };
  }, [filter.month]);

  // Handle add fee button click for multiple students
  const handleAddFeeClick = (selectedStudentIds, selectedStudentsData) => {
    // If only one student is selected, we'll use the modal in StudentFeeStatusTable
    // If multiple students are selected, navigate to the add fee page
    if (selectedStudentIds.length > 1) {
      // Determine the common class and section if possible
      let commonClass = null;
      let commonSection = null;

      if (selectedStudentsData && selectedStudentsData.length > 0) {
        console.log('Selected students data in FeesPage:', selectedStudentsData);

        // Check if all students have the same class
        const firstClass = selectedStudentsData[0].class;
        const allSameClass = selectedStudentsData.every(student => student.class === firstClass);

        if (allSameClass) {
          commonClass = firstClass;

          // If they have the same class, check for same section
          const firstSection = selectedStudentsData[0].section;
          const allSameSection = selectedStudentsData.every(student => student.section === firstSection);

          if (allSameSection) {
            commonSection = firstSection;
          }
        }
      }

      // If we couldn't determine common class/section from students, use the first student's values
      if (!commonClass && selectedStudentsData && selectedStudentsData.length > 0) {
        commonClass = selectedStudentsData[0].class;
      }

      if (!commonSection && selectedStudentsData && selectedStudentsData.length > 0) {
        commonSection = selectedStudentsData[0].section;
      }

      // Log what we're sending to the AddFee page
      console.log('Navigating to AddFee with:', {
        selectedStudentIds,
        selectedStudentsData,
        selectedClass: commonClass || filter.class,
        selectedSection: commonSection || filter.section
      });

      navigate('/fees/add', {
        state: {
          selectedStudentIds,
          selectedStudentsData,
          selectedClass: commonClass || filter.class,
          selectedSection: commonSection || filter.section
        }
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Handle cleanup of orphaned fee records
  const handleCleanupOrphanedFees = () => {
    setShowCleanupConfirmation(true);
  };

  // Confirm cleanup of orphaned fee records
  const confirmCleanupOrphanedFees = async () => {
    setShowCleanupConfirmation(false);

    try {
      setCleanupLoading(true);
      const res = await axios.delete('/api/fees/cleanup-orphaned');

      if (res.data.success) {
        setSuccessMessage(res.data.message);
        // Trigger a refresh of the fee data
        setFilter(prev => ({
          ...prev,
          _refresh: Date.now()
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cleanup orphaned fee records');
    } finally {
      setCleanupLoading(false);
    }
  };

  // Cancel cleanup confirmation
  const cancelCleanupConfirmation = () => {
    setShowCleanupConfirmation(false);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Fee Management</h1>
          {user && ['admin', 'principal', 'accountant'].includes(user.role) && (
            <div className="flex space-x-3">
              {/* Cleanup Orphaned Fees Button - Only for admin and principal */}
              {['admin', 'principal'].includes(user.role) && (
                <button
                  onClick={handleCleanupOrphanedFees}
                  disabled={cleanupLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {cleanupLoading ? 'Cleaning...' : 'Cleanup Orphaned Fees'}
                </button>
              )}

              <Link
                to="/fees/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Fee Record
              </Link>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Class Filter */}
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class</label>
              <select
                id="class"
                name="class"
                value={filter.class}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loadingClasses}
              >
                <option value="">All Classes</option>
                {classes.map((classItem) => (
                  <option key={classItem.value} value={classItem.value}>
                    {classItem.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
              <select
                id="section"
                name="section"
                value={filter.section}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={!filter.class || filter.class === 'all' || sections.length === 0}
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section.value} value={section.value}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
              <input
                type="month"
                id="month"
                name="month"
                value={filter.month}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Fee Type Filter */}
            <div>
              <label htmlFor="feeType" className="block text-sm font-medium text-gray-700">Fee Type</label>
              <select
                id="feeType"
                name="feeType"
                value={filter.feeType}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

        {successMessage && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Student Fee Status Table */}
        <StudentFeeStatusTable
          selectedClass={filter.class}
          selectedSection={filter.section}
          selectedMonth={selectedMonthYear}
          selectedFeeType={filter.feeType}
          onAddFeeClick={handleAddFeeClick}
          refreshTrigger={filter._refresh} // Pass the refresh trigger
        />

        {/* Cleanup Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showCleanupConfirmation}
          onClose={cancelCleanupConfirmation}
          onConfirm={confirmCleanupOrphanedFees}
          title="Cleanup Orphaned Fee Records"
          message="This will permanently remove fee records for deleted or inactive students. This action cannot be undone. Are you sure you want to continue?"
          confirmText="Yes, Cleanup"
          cancelText="Cancel"
          confirmButtonColor="red"
          icon="warning"
        />
      </div>
    </div>
  );
};

export default FeesPage;
