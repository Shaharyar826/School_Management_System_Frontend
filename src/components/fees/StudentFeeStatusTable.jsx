import { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FeeModal from './FeeModal';
import ReceiptGenerationModal from './ReceiptGenerationModal';

const StudentFeeStatusTable = ({
  selectedClass,
  selectedSection,
  selectedMonth,
  selectedFeeType,
  onAddFeeClick,
  refreshTrigger
}) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [searchQuery, setSearchQuery] = useState(''); // Add search query state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get current month and year for default filter
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.getMonth() + 1, // JavaScript months are 0-indexed
      year: now.getFullYear()
    };
  };

  // Fetch students based on class and section
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (selectedClass && selectedClass !== 'all') {
          params.append('class', selectedClass);
        }
        if (selectedSection) {
          params.append('section', selectedSection);
        }

        // Add limit parameter to fetch all students (100 should be enough)
        params.append('limit', '100');

        const res = await axios.get(`/api/students?${params.toString()}`);

        if (res.data.success) {
          setStudents(res.data.data);
          // Reset selected students when filters change
          setSelectedStudents([]);
          setSelectAll(false);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSection]);

  // Function to fetch fee records - improved version with better handling of student IDs
  const fetchFeeRecords = async (skipLoading = false) => {
    if (students.length === 0) {
      setFeeRecords([]);
      if (!skipLoading) setLoading(false);
      return;
    }

    try {
      if (!skipLoading) setLoading(true);
      setError(''); // Clear any previous errors

      // Get current month/year if not specified
      const { month, year } = selectedMonth || getCurrentMonthYear();

      console.log('Fetching fee records for:', { month, year, selectedFeeType });

      if (!month || !year) {
        setError('Invalid date selection');
        setLoading(false);
        return;
      }

      // Calculate start and end dates for the selected month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setError('Invalid date calculation');
        setLoading(false);
        return;
      }

      // Format dates for API query
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Build query parameters
      const params = new URLSearchParams();
      params.append('dueDate[gte]', formattedStartDate);
      params.append('dueDate[lte]', formattedEndDate);

      // Add fee type filter if specified
      if (selectedFeeType && selectedFeeType !== '') {
        params.append('feeType', selectedFeeType);
      }

      // Add student IDs to the query to ensure we get only relevant records
      const studentIds = students.map(student => student._id);

      // Add a timestamp to prevent caching
      params.append('_t', Date.now());

      // Optimize by using Promise.all for parallel requests
      if (studentIds.length > 20) {
        // For larger number of students, use Promise.all for parallel requests
        const batchSize = 20;
        const batchPromises = [];

        for (let i = 0; i < studentIds.length; i += batchSize) {
          const batchIds = studentIds.slice(i, i + batchSize);
          const batchParams = new URLSearchParams();

          // Copy all existing params
          batchParams.append('dueDate[gte]', formattedStartDate);
          batchParams.append('dueDate[lte]', formattedEndDate);
          if (selectedFeeType && selectedFeeType !== '') {
            batchParams.append('feeType', selectedFeeType);
          }
          batchParams.append('_t', Date.now());

          batchIds.forEach(id => {
            batchParams.append('studentId', id);
          });

          batchPromises.push(axios.get(`/api/fees?${batchParams.toString()}`));
        }

        // Execute all batches in parallel
        const results = await Promise.all(batchPromises);

        // Combine all results
        const allFeeRecords = results.reduce((acc, res) => {
          if (res.data.success) {
            return [...acc, ...res.data.data];
          }
          return acc;
        }, []);

        setFeeRecords(allFeeRecords);
      } else {
        // For smaller number of students, fetch all at once
        studentIds.forEach(id => {
          params.append('studentId', id);
        });

        const res = await axios.get(`/api/fees?${params.toString()}`);

        if (res.data.success) {
          setFeeRecords(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching fee records:', err);
      // Provide more detailed error message
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server response error:', err.response.data);
        setError(`Failed to load fee records: ${err.response.data.message || err.message}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('Failed to load fee records: No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to load fee records: ${err.message}`);
      }
    } finally {
      // Only set loading to false if we set it to true
      if (!skipLoading) setLoading(false);
    }
  };

  // Fetch fee records when students, selectedMonth, or selectedFeeType changes
  useEffect(() => {
    // Only fetch if we have students
    if (students.length > 0) {
      // Skip setting loading state to avoid multiple loaders
      fetchFeeRecords(true);
    }
  }, [students, selectedMonth, selectedFeeType]);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      // Refresh triggered

      // Reset status filter to 'all' to ensure all records are visible after refresh
      setStatusFilter('all');

      // Reset search query
      setSearchQuery('');

      // Reset any error state
      setError('');

      // Reset selected students
      setSelectedStudents([]);
      setSelectAll(false);

      // Reset pagination to first page
      setCurrentPage(1);

      // Optimized refresh function with a single loading state
      const refreshData = async () => {
        try {
          // Set loading state once at the beginning
          setLoading(true);
          setError('');

          // Build query parameters for students
          const studentsParams = new URLSearchParams();
          if (selectedClass && selectedClass !== 'all') {
            studentsParams.append('class', selectedClass);
          }
          if (selectedSection) {
            studentsParams.append('section', selectedSection);
          }

          // Add limit parameter to fetch all students
          studentsParams.append('limit', '100');
          studentsParams.append('_t', Date.now());

          // Get current month/year
          const { month, year } = selectedMonth || getCurrentMonthYear();

          // Calculate start and end dates for the selected month
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);

          // Format dates for API query
          const formattedStartDate = startDate.toISOString().split('T')[0];
          const formattedEndDate = endDate.toISOString().split('T')[0];

          // Fetch students and prepare for fee records in parallel
          const studentsRes = await axios.get(`/api/students?${studentsParams.toString()}`);

          if (studentsRes.data.success) {
            // Update students state
            setStudents(studentsRes.data.data);

            // Immediately fetch fee records instead of waiting for the useEffect
            const studentIds = studentsRes.data.data.map(student => student._id);

            if (studentIds.length > 0) {
              // Build query parameters for fee records
              const feeParams = new URLSearchParams();
              feeParams.append('dueDate[gte]', formattedStartDate);
              feeParams.append('dueDate[lte]', formattedEndDate);
              if (selectedFeeType && selectedFeeType !== '') {
                feeParams.append('feeType', selectedFeeType);
              }
              feeParams.append('_t', Date.now());

              // Add student IDs to the query
              studentIds.forEach(id => {
                feeParams.append('studentId', id);
              });

              // Fetch fee records directly
              const feeRes = await axios.get(`/api/fees?${feeParams.toString()}`);

              if (feeRes.data.success) {
                setFeeRecords(feeRes.data.data);
              }
            }
          } else {
            setError('Failed to load students. Please try again.');
          }
        } catch (err) {
          setError('Failed to refresh data. Please try again.');
        } finally {
          // Turn off loading state only once at the end
          setLoading(false);
        }
      };

      // Execute the refresh
      refreshData();
    }
  }, [refreshTrigger]); // Only depend on refreshTrigger, not on selectedClass or selectedSection

  // Get fee due date status
  const getFeeDueDateStatus = (dueDate) => {
    if (!dueDate) return { message: '', className: '' };

    const now = new Date();
    const due = new Date(dueDate);

    // Calculate days difference
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Overdue
      return {
        message: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        className: 'text-red-600 font-semibold'
      };
    } else if (diffDays === 0) {
      // Due today
      return {
        message: 'Due today',
        className: 'text-yellow-600 font-semibold'
      };
    } else if (diffDays <= 3) {
      // Due soon
      return {
        message: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
        className: 'text-orange-600 font-semibold'
      };
    } else if (diffDays <= 7) {
      // Due this week
      return {
        message: `Due in ${diffDays} days`,
        className: 'text-blue-600'
      };
    } else {
      // Due later
      return {
        message: `Due in ${diffDays} days`,
        className: 'text-gray-600'
      };
    }
  };

  // Group fee records by student and determine overall fee status
  const groupedFeeRecords = useMemo(() => {
    return students.map(student => {
      // Get fee records from both sources: the feeRecords state and the student.feeRecords virtual
      let studentFees = [];

      // First, check if the student has feeRecords from the virtual field
      if (student.feeRecords && student.feeRecords.length > 0) {
        studentFees = [...student.feeRecords];
      }

      // Then, add any matching fee records from the feeRecords state
      const additionalFees = feeRecords.filter(fee => {
        // Check both ways of referencing the student ID
        return (fee.student && fee.student._id === student._id) ||
               (fee.student === student._id);
      });

      // Log the fee records for debugging
      console.log(`Student ${student.user?.name} has ${additionalFees.length} fee records with arrears:`,
        additionalFees.map(fee => ({ id: fee._id, arrears: fee.arrears })));

      // Combine both sources, avoiding duplicates by checking IDs
      const existingIds = new Set(studentFees.map(fee => fee._id));
      additionalFees.forEach(fee => {
        if (!existingIds.has(fee._id)) {
          studentFees.push(fee);
          existingIds.add(fee._id);
        } else {
          // If the fee already exists, update it with the latest data
          const index = studentFees.findIndex(f => f._id === fee._id);
          if (index !== -1) {
            studentFees[index] = fee;
          }
        }
      });

      // Determine overall fee status
      let overallStatus = 'not paid';

      if (studentFees.length > 0) {
        const statuses = studentFees.map(fee => fee.status);

        // If all fees are paid, the overall status is paid
        if (statuses.every(status => status === 'paid')) {
          overallStatus = 'paid';
        }
        // If some fees are paid or partial, the overall status is partial
        else if (statuses.some(status => status === 'paid' || status === 'partial')) {
          overallStatus = 'partial';
        }
        // If any fee is overdue, the overall status is overdue
        else if (statuses.some(status => status === 'overdue')) {
          overallStatus = 'overdue';
        }
        // Otherwise, the overall status is unpaid
        else {
          overallStatus = 'unpaid';
        }
      }

      return {
        student: {
          ...student,
          fees: studentFees // Add the fees to the student object for easy access in the UI
        },
        fees: studentFees,
        overallStatus
      };
    });
  }, [students, feeRecords]);

  // Apply status and search filters
  const filteredRecords = groupedFeeRecords.filter(record => {
    // First apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid' && record.overallStatus !== 'paid') {
        return false;
      } else if (statusFilter === 'unpaid' &&
                !(record.overallStatus === 'unpaid' ||
                  record.overallStatus === 'overdue' ||
                  record.overallStatus === 'not paid' ||
                  record.overallStatus === 'partial')) {
        return false;
      }
    }

    // Then apply search filter if there is a search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      // Search by student name
      const nameMatch = record.student.user?.name?.toLowerCase().includes(query);

      // Search by roll number
      const rollNumberMatch = record.student.rollNumber?.toLowerCase().includes(query);

      // Search by class
      const classMatch = `class ${record.student.class}`.toLowerCase().includes(query);

      // Search by section
      const sectionMatch = `section ${record.student.section}`.toLowerCase().includes(query);

      // Search by father's name
      const fatherNameMatch = record.student.parentInfo?.fatherName?.toLowerCase().includes(query);

      // Return true if any of the fields match the search query
      return nameMatch || rollNumberMatch || classMatch || sectionMatch || fatherNameMatch;
    }

    // If no search query, include the record
    return true;
  });

  // Removed excessive logging for better performance

  // Function to handle page changes with loading indicator
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    setIsLoadingMore(true);
    setCurrentPage(newPage);

    // Add a small delay to show loading indicator
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 300);
  };

  // Apply pagination to filtered records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage, recordsPerPage]);

  // Update total pages when filtered records count changes
  useEffect(() => {
    if (filteredRecords.length > 0) {
      setTotalPages(Math.ceil(filteredRecords.length / recordsPerPage));
    } else {
      setTotalPages(1);
    }
  }, [filteredRecords.length, recordsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, selectedClass, selectedSection, selectedMonth, selectedFeeType, searchQuery]);

  // Handle checkbox selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle opening the fee modal for a specific student
  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  // Handle opening the receipt generation modal for a specific student
  const handleOpenReceiptModal = (student) => {
    setSelectedStudent(student);
    setReceiptModalOpen(true);
  };

  // Handle closing the fee modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  // Direct approach to update fee status immediately
  const handleFeeSuccess = (message) => {
    // Set success message first
    setSuccessMessage(message);

    // Reset selected students
    setSelectedStudents([]);
    setSelectAll(false);

    // Show loading indicator in the table body only
    setIsLoadingMore(true);

    // Force a window reload after a short delay
    // This is a direct approach that ensures all data is refreshed
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    // Auto-hide the success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6">
      {/* Fee Modal */}
      <FeeModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
        onSuccess={handleFeeSuccess}
      />

      {/* Receipt Generation Modal */}
      <ReceiptGenerationModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={handleFeeSuccess}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
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

      {loading && !isLoadingMore ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {/* Action Bar */}
          <div className="px-4 py-3 bg-gray-50 flex flex-wrap items-center justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
              {/* Search Bar */}
              <div className="relative flex-grow max-w-md mb-2 sm:mb-0" style={{ zIndex: 1 }}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md text-sm"
                  placeholder="Search students by name, roll number, class..."
                  value={searchQuery}
                  style={{ zIndex: 1 }}
                  onChange={(e) => {
                    // Show loading indicator
                    setIsLoadingMore(true);

                    // Update search query
                    setSearchQuery(e.target.value);

                    // Add a small delay to show loading indicator
                    setTimeout(() => {
                      setIsLoadingMore(false);
                    }, 300);
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    style={{ zIndex: 1 }}
                    onClick={() => {
                      setSearchQuery('');
                      setIsLoadingMore(true);
                      setTimeout(() => {
                        setIsLoadingMore(false);
                      }, 300);
                    }}
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === 'paid'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setStatusFilter('unpaid')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === 'unpaid'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Unpaid
                </button>
              </div>
            </div>

            {/* Selection and Add Fee Button */}
            {user && ['admin', 'principal', 'accountant'].includes(user.role) && (
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <input
                    id="select-all"
                    name="select-all"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                    Select All
                  </label>
                  <span className="ml-2 text-xs text-gray-500">
                    ({selectedStudents.length} selected)
                  </span>
                </div>
                {/* Add Fee Button  */}
                <button
                  onClick={() => {
                    // Get the selected students with their class and section information
                    const selectedStudentsData = students
                      .filter(student => selectedStudents.includes(student._id))
                      .map(student => ({
                        id: student._id,
                        name: student.user?.name,
                        class: student.class,
                        section: student.section
                      }));

                    // Call the onAddFeeClick with the enhanced data
                    onAddFeeClick(selectedStudents, selectedStudentsData);
                  }}
                  disabled={selectedStudents.length === 0}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
                    ${selectedStudents.length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Fee
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {user && ['admin', 'principal', 'accountant'].includes(user.role) && (
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Father's Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Status
                </th>
                {/* Hide arrears column for May 2023 (starting month) */}
                {selectedMonth && (selectedMonth.month !== 5 || selectedMonth.year !== 2023) && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrears
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingMore ? (
                <tr>
                  <td colSpan={user && ['admin', 'principal', 'accountant'].includes(user.role) ? 8 : 7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={user && ['admin', 'principal', 'accountant'].includes(user.role) ? 8 : 7} className="px-6 py-4 text-center">
                    <div className="text-gray-500">
                      {searchQuery.trim()
                        ? `No students matching "${searchQuery}" found`
                        : "No students found for the selected filters"}
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.map(({ student, overallStatus }) => (
                <tr key={student._id}>
                  {user && ['admin', 'principal', 'accountant'].includes(user.role) && (
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        id={`select-${student._id}`}
                        name={`select-${student._id}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleSelectStudent(student._id)}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold">
                        {student.user?.profileImage?.url ? (
                          <img
                            src={student.user.profileImage.url}
                            alt={student.user?.name || 'Student'}
                            className="h-full w-full object-cover"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.user?.name?.charAt(0) || 'S')}&background=0D8ABC&color=fff&size=256`;
                            }}
                          />
                        ) : (
                          student.user?.name?.charAt(0) || 'S'
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.user?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Class {student.class} {student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.parentInfo?.fatherName || 'Not available'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(overallStatus)}`}>
                        {overallStatus === 'not paid' ? 'Not Paid' :
                         overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                      </span>

                      {/* Due date status message */}
                      {student.fees && student.fees.length > 0 && student.fees[0].dueDate && overallStatus !== 'paid' && (
                        <span className={`text-xs ${getFeeDueDateStatus(student.fees[0].dueDate).className}`}>
                          {getFeeDueDateStatus(student.fees[0].dueDate).message}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* Check if current month is May 2025 (starting month) */}
                    {selectedMonth && selectedMonth.month === 5 && selectedMonth.year === 2025 ? (
                      <span className="text-green-600">None</span>
                    ) : (
                      student.fees && student.fees.length > 0 ? (
                        student.fees.some(fee => fee.arrears > 0) ? (
                          <span className="text-red-600 font-semibold">
                            ₹{student.fees.reduce((total, fee) => total + (fee.arrears || 0), 0).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-green-600">None</span>
                        )
                      ) : (
                        <span className="text-green-600">None</span>
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2 min-w-[200px]">
                      <Link to={`/students/${student._id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                      {user && ['admin', 'principal', 'accountant'].includes(user.role) && (
                        <>
                          {student.monthlyFee ? (
                            <button
                              onClick={() => handleOpenReceiptModal(student)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Generate Receipt
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(student)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Add Fee
                            </button>
                          )}
                          {/* View Fee button - show if student has any fees */}
                          {student.fees && student.fees.length > 0 && (
                            <Link
                              to={`/fees/${student.fees[0]._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Fee
                            </Link>
                          )}

                          {/* Process Payment button - only show if student has unpaid fees */}
                          {overallStatus !== 'paid' && student.fees && student.fees.length > 0 && student.fees.some(fee => fee.status !== 'paid') && (
                            <Link
                              to={`/fees/process-payment/${student.fees.find(fee => fee.status !== 'paid')._id}`}
                              className="text-indigo-600 hover:text-indigo-900 whitespace-nowrap"
                            >
                              Process Payment
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls - Only show when there are multiple pages or when searching */}
          {(totalPages > 1 || searchQuery.trim()) && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingMore || filteredRecords.length === 0}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === 1 || isLoadingMore || filteredRecords.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoadingMore || filteredRecords.length === 0}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === totalPages || isLoadingMore || filteredRecords.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {filteredRecords.length > 0 ? (
                      <>
                        Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * recordsPerPage, filteredRecords.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredRecords.length}</span> students
                      </>
                    ) : searchQuery.trim() ? (
                      <>
                        No students matching "<span className="font-medium">{searchQuery}</span>"
                      </>
                    ) : (
                      <>
                        Showing <span className="font-medium">0</span> students
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoadingMore || filteredRecords.length === 0}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                        currentPage === 1 || isLoadingMore || filteredRecords.length === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        // If 5 or fewer pages, show all
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        // If near start, show first 5 pages
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        // If near end, show last 5 pages
                        pageNum = totalPages - 4 + i;
                      } else {
                        // Otherwise show current page and 2 pages on each side
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoadingMore}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoadingMore || filteredRecords.length === 0}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                        currentPage === totalPages || isLoadingMore || filteredRecords.length === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Records per page selector - Show when there are records or when searching */}
          {(filteredRecords.length > recordsPerPage || searchQuery.trim()) && (
            <div className="mt-4 px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex items-center">
                <label htmlFor="records-per-page" className="mr-2 text-sm text-gray-700">
                  Records per page:
                </label>
                <select
                  id="records-per-page"
                  name="records-per-page"
                  className="block w-20 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={recordsPerPage}
                  onChange={(e) => {
                    // Show loading indicator
                    setIsLoadingMore(true);

                    // Update records per page
                    setRecordsPerPage(Number(e.target.value));

                    // Reset to first page
                    setCurrentPage(1);

                    // Add a small delay to show loading indicator
                    setTimeout(() => {
                      setIsLoadingMore(false);
                    }, 300);
                  }}
                  disabled={isLoadingMore}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentFeeStatusTable;
