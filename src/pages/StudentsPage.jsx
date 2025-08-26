import { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ProfileAvatarImage from '../components/common/ProfileAvatarImage';

const StudentsPage = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  // Extract unique classes and sections from students data
  const { classes, sections, filteredStudents, groupedStudents, paginatedStudents, totalFilteredCount } = useMemo(() => {
    try {
      // Get unique classes with student counts
      const uniqueClasses = [...new Set(students.map(student => student.class))].sort();

      // Filter students based on selected class, section, and search query
      const filtered = students.filter(student => {
        // Check if there's a search query
        const hasSearchQuery = searchQuery.trim().length > 0;

        // Apply search filter - this should work regardless of other filters
        if (hasSearchQuery) {
          const query = searchQuery.toLowerCase().trim();
          const matchesSearch =
            // Search by name
            (student.user?.name?.toLowerCase().includes(query)) ||
            // Search by roll number
            (student.rollNumber?.toLowerCase().includes(query)) ||
            // Search by class
            (`class ${student.class}`.toLowerCase().includes(query)) ||
            // Search by section
            (`section ${student.section}`.toLowerCase().includes(query));

          // If student doesn't match search, exclude it immediately
          if (!matchesSearch) return false;

          // If we have a search query and it matches, include the student regardless of class/section filters
          // This ensures search works even when no class is selected
          if (!showAllClasses && !selectedClass) {
            return true;
          }
        }

        // Apply class and section filters if not in "All Classes" mode and no search query
        if (!showAllClasses) {
          if (!selectedClass && !hasSearchQuery) return false;
          if (selectedClass && !selectedSection) {
            return student.class === selectedClass;
          } else if (selectedClass && selectedSection) {
            return student.class === selectedClass && student.section === selectedSection;
          }
        }

        // If in "All Classes" mode or if student passed all filters, include it
        return true;
      });

      // Create a map of class to student count based on filtered students
      const classCountMap = {};
      uniqueClasses.forEach(classItem => {
        classCountMap[classItem] = filtered.filter(student => student.class === classItem).length;
      });

      // Get sections for the selected class from filtered students
      let sectionsForClass = [];
      if (selectedClass) {
        // Get unique sections from the filtered students (which already have search applied)
        // This ensures sections list is consistent with search results
        const filteredStudentsInClass = filtered.filter(student => student.class === selectedClass);
        sectionsForClass = [...new Set(filteredStudentsInClass.map(student => student.section))].sort();
      }

      // Debug: Log sections for Class 1 if that's the selected class
      if (selectedClass === '1') {
        console.log('Detected sections for Class 1:', sectionsForClass);
        console.log('Students in Class 1:', filtered.filter(student => student.class === '1').length);
      }

      // Calculate total filtered count for pagination
      const totalFilteredCount = filtered.length;

      // Apply pagination to filtered students
      let paginatedStudents;
      const startIndex = (currentPage - 1) * studentsPerPage;
      const endIndex = startIndex + studentsPerPage;

      if (showAllClasses && !selectedClass) {
        // Apply pagination to the "All Classes" view
        paginatedStudents = filtered.slice(startIndex, endIndex);
        console.log(`Pagination: showing students ${startIndex+1}-${Math.min(endIndex, filtered.length)} of ${filtered.length}`);
      } else {
        // When viewing specific class/section, show all students without pagination
        paginatedStudents = filtered;
      }

      // Group students by section when no specific section is selected
      // Only process the current page of students to improve performance
      const grouped = {};
      if (showAllClasses) {
        // For "All Classes" view, we'll group by class and section
        const processedClasses = new Set();

        // First, identify which classes and sections have students
        uniqueClasses.forEach(classItem => {
          const classSections = [...new Set(students
            .filter(student => student.class === classItem)
            .map(student => student.section))].sort();

          // Skip classes with no sections
          if (classSections.length === 0) return;

          classSections.forEach(section => {
            const key = `${classItem}-${section}`;
            // Count students in this section
            const studentsCount = students.filter(
              student => student.class === classItem && student.section === section
            ).length;

            // Only process sections with students
            if (studentsCount > 0) {
              processedClasses.add(key);
            }
          });
        });

        // Process all class-sections instead of paginating them
        // This ensures we show all classes and sections
        let classesToProcess = Array.from(processedClasses);

        // If there's a search query, we need to filter the class-sections to only show those with matching students
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();

          // Create a set of class-section keys that have matching students
          const matchingClassSections = new Set();

          // Use the filtered students (which already have search applied) to determine matching class-sections
          filtered.forEach(student => {
            const key = `${student.class}-${student.section}`;
            matchingClassSections.add(key);
          });

          // Filter classesToProcess to only include class-sections with matching students
          classesToProcess = classesToProcess.filter(key => matchingClassSections.has(key));

          console.log(`Search "${query}" - Found ${matchingClassSections.size} matching class-sections`);
        }

        // Apply pagination to the filtered students
        // We'll only show students from the current page
        const startIndex = (currentPage - 1) * studentsPerPage;
        const endIndex = startIndex + studentsPerPage;
        const paginatedFilteredStudents = filtered.slice(startIndex, endIndex);

        // Get the class-section keys for the paginated students
        const paginatedClassSections = new Set();
        paginatedFilteredStudents.forEach(student => {
          const key = `${student.class}-${student.section}`;
          paginatedClassSections.add(key);
        });

        // Only process class-sections that have students in the current page
        classesToProcess = classesToProcess.filter(key => paginatedClassSections.has(key));

        classesToProcess.forEach(key => {
          const [classItem, section] = key.split('-');
          // Get students for this class-section from the paginated filtered students
          const studentsInSection = paginatedFilteredStudents.filter(
            student => student.class === classItem && student.section === section
          );

          grouped[key] = studentsInSection;
        });

        console.log(`All Classes View - Processed ${classesToProcess.length} class-sections for page ${currentPage}`);
      } else if (selectedClass && !selectedSection) {
        // For a specific class, group by section
        sectionsForClass.forEach(section => {
          // Get students for this section from the already filtered students
          const studentsInSection = filtered
            .filter(student => student.class === selectedClass && student.section === section);

          grouped[section] = studentsInSection;
        });
      }

      return {
        classes: uniqueClasses,
        sections: sectionsForClass,
        filteredStudents: paginatedStudents, // Use paginated students instead of all filtered
        groupedStudents: grouped,
        paginatedStudents,
        totalFilteredCount
      };
    } catch (error) {
      console.error('Error in student data processing:', error);
      return {
        classes: [],
        sections: [],
        filteredStudents: [],
        groupedStudents: {},
        paginatedStudents: [],
        totalFilteredCount: 0
      };
    }
  }, [students, selectedClass, selectedSection, showAllClasses, currentPage, studentsPerPage, searchQuery]);

  // Reset section when class changes or when toggling all classes
  useEffect(() => {
    setSelectedSection('');
    setCurrentPage(1); // Reset to first page when changing class or toggling all classes
  }, [selectedClass, showAllClasses]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Update total pages when filtered students count changes
  useEffect(() => {
    if (totalFilteredCount > 0) {
      setTotalPages(Math.ceil(totalFilteredCount / studentsPerPage));
    } else {
      setTotalPages(1);
    }
  }, [totalFilteredCount, studentsPerPage]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');

        // Add a timeout to abort the request if it takes too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        // Request students with a reasonable limit
        const res = await axios.get('/api/students?limit=100', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.data.success) {
          setStudents(res.data.data);
          console.log(`Loaded ${res.data.data.length} students`);

          // Debug: Log all students in Class 1 with their sections
          const class1Students = res.data.data.filter(student => student.class === '1');
          console.log(`Class 1 students: ${class1Students.length}`);

          // Group by section
          const sectionCounts = {};
          class1Students.forEach(student => {
            const section = student.section;
            sectionCounts[section] = (sectionCounts[section] || 0) + 1;
          });

          console.log('Class 1 sections:', sectionCounts);

          // Check for approval status issues
          const unapprovedStudents = res.data.data.filter(student =>
            !student.user || !student.user.isApproved || student.user.status !== 'active'
          );

          if (unapprovedStudents.length > 0) {
            console.log(`Found ${unapprovedStudents.length} unapproved or inactive students`);
            console.log('First few unapproved students:', unapprovedStudents.slice(0, 3));
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.error('Request timed out');
          setError('Request timed out. Please try again later.');
        } else {
          console.error('Error fetching students:', err);
          setError('Failed to load students. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Student Management</h1>
          {user && (user.role === 'admin' || user.role === 'principal') && (
            <Link
              to="/students/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Student
            </Link>
          )}
        </div>

        {/* Class and Section Filters */}
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter Students</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-md mr-4">
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

            <button
              type="button"
              onClick={() => {
                // Show loading indicator
                setIsLoadingMore(true);

                // Toggle all classes view
                setShowAllClasses(!showAllClasses);
                setSelectedClass('');
                setSelectedSection('');

                // Reset to first page
                setCurrentPage(1);

                // Add a small delay to show loading indicator
                setTimeout(() => {
                  setIsLoadingMore(false);
                }, 500);
              }}
              disabled={isLoadingMore}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                showAllClasses
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingMore ? 'Loading...' : (showAllClasses ? 'Disable All Classes View' : 'Select All Classes')}
            </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700">
                Class
              </label>
              <select
                id="class-filter"
                name="class-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedClass}
                onChange={(e) => {
                  // Show loading indicator
                  setIsLoadingMore(true);

                  // Set the selected class
                  setSelectedClass(e.target.value);

                  // Reset to first page
                  setCurrentPage(1);

                  // Add a small delay to show loading indicator
                  setTimeout(() => {
                    setIsLoadingMore(false);
                  }, 300);
                }}
                disabled={showAllClasses || isLoadingMore}
              >
                <option value="">Select Class</option>
                {classes.map((classItem) => {
                  // Get the count of students in this class that match the current filters
                  const classCount = students.filter(student =>
                    student.class === classItem &&
                    (!searchQuery.trim() ||
                      (student.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       `class ${student.class}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       `section ${student.section}`.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                  ).length;

                  // Only show classes that have matching students when searching
                  if (searchQuery.trim() && classCount === 0) return null;
                  return (
                    <option key={classItem} value={classItem}>
                      Class {classItem} ({classCount} students)
                    </option>
                  );
                }).filter(Boolean)}
              </select>
            </div>

            <div>
              <label htmlFor="section-filter" className="block text-sm font-medium text-gray-700">
                Section
              </label>
              <select
                id="section-filter"
                name="section-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedSection}
                onChange={(e) => {
                  // Show loading indicator
                  setIsLoadingMore(true);

                  // Set the selected section
                  setSelectedSection(e.target.value);

                  // Reset to first page
                  setCurrentPage(1);

                  // Add a small delay to show loading indicator
                  setTimeout(() => {
                    setIsLoadingMore(false);
                  }, 300);
                }}
                disabled={showAllClasses || !selectedClass || sections.length === 0 || isLoadingMore}
              >
                <option value="">All Sections</option>
                {sections.map((section) => {
                  // Get the count of students in this section that match the current filters
                  const sectionCount = students.filter(
                    student => student.class === selectedClass &&
                    student.section === section &&
                    (!searchQuery.trim() ||
                      (student.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       `class ${student.class}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       `section ${student.section}`.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                  ).length;

                  // Only show sections that have matching students when searching
                  if (searchQuery.trim() && sectionCount === 0) return null;

                  return (
                    <option key={section} value={section}>
                      Section {section} ({sectionCount} students)
                    </option>
                  );
                }).filter(Boolean)}
              </select>
            </div>
          </div>
        </div>

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

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No students found
              </div>
            </div>
          ) : !selectedClass && !showAllClasses && !searchQuery.trim() ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                Please select a class to view students, use "Select All Classes", or search for students
              </div>
            </div>
          ) : !selectedClass && !showAllClasses && searchQuery.trim() && filteredStudents.length === 0 ? (
            // No search results found
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No students matching "{searchQuery}" found
              </div>
            </div>
          ) : !selectedClass && !showAllClasses && searchQuery.trim() && filteredStudents.length > 0 ? (
            // Display search results when no class is selected but there's a search query
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Search Results for "{searchQuery}" ({filteredStudents.length} students)
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <li key={student._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            <ProfileAvatarImage
                              profileImage={student.user?.profileImage}
                              name={student.user?.name}
                              fallbackLetter={student.user?.name?.charAt(0) || 'S'}
                              bgColor="bg-blue-500"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.user?.name}</div>
                            <div className="text-sm text-gray-500">Roll Number: {student.rollNumber}</div>
                            <div className="text-sm text-gray-500">Class: {student.class} {student.section}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/students/${student._id}`}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </Link>
                          {user && (user.role === 'admin' || user.role === 'principal') && (
                            <>
                              <Link
                                to={`/students/edit/${student._id}`}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                                    axios.delete(`/api/students/${student._id}`)
                                      .then(() => {
                                        // Refresh the student list
                                        const updatedStudents = students.filter(s => s._id !== student._id);
                                        setStudents(updatedStudents);
                                      })
                                      .catch(err => {
                                        console.error('Error deleting student:', err);
                                        alert('Failed to delete student');
                                      });
                                  }
                                }}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : showAllClasses && (Object.keys(groupedStudents).length === 0 || students.length === 0) ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                {searchQuery ?
                  `No students matching "${searchQuery}" found in any class` :
                  `No students found in any class`}
              </div>
            </div>
          ) : !showAllClasses && filteredStudents.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                {searchQuery ?
                  `No students matching "${searchQuery}" found in ${selectedSection ? `Class ${selectedClass} - Section ${selectedSection}` : `Class ${selectedClass}`}` :
                  `No students found in ${selectedSection ? `Class ${selectedClass} - Section ${selectedSection}` : `Class ${selectedClass}`}`}
              </div>
            </div>
          ) : selectedSection ? (
            // Display students for a specific section
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {/* Class and Section Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Class {selectedClass} - Section {selectedSection} ({filteredStudents.length} students)
                </h3>
              </div>

              <ul className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <li key={student._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            <ProfileAvatarImage
                              profileImage={student.user?.profileImage}
                              name={student.user?.name}
                              fallbackLetter={student.user?.name?.charAt(0) || 'S'}
                              bgColor="bg-blue-500"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.user?.name}</div>
                            <div className="text-sm text-gray-500">Roll Number: {student.rollNumber}</div>
                            <div className="text-sm text-gray-500">Class: {student.class} {student.section}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View Details
                          </button>
                          {user && (user.role === 'admin' || user.role === 'principal') && (
                            <>
                              <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Edit
                              </button>
                              <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : showAllClasses ? (
            // Display all students grouped by class and section
            <div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    All Classes and Sections ({totalFilteredCount} total students)
                  </h3>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                    {searchQuery ?
                      `No students matching "${searchQuery}" found in any class` :
                      `No students found in any class`}
                  </div>
                </div>
              ) : Object.keys(groupedStudents).length === 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center text-gray-500 mb-4">
                    Students found but could not be grouped by class and section. Showing all students:
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {paginatedStudents.map((student) => (
                      <li key={student._id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                <ProfileAvatarImage
                                  profileImage={student.user?.profileImage}
                                  name={student.user?.name}
                                  fallbackLetter={student.user?.name?.charAt(0) || 'S'}
                                  bgColor="bg-blue-500"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.user?.name}</div>
                                <div className="text-sm text-gray-500">Roll Number: {student.rollNumber}</div>
                                <div className="text-sm text-gray-500">Class: {student.class} {student.section}</div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Link
                                to={`/students/${student._id}`}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                View Details
                              </Link>
                              {user && (user.role === 'admin' || user.role === 'principal') && (
                                <>
                                  <Link
                                    to={`/students/edit/${student._id}`}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                                        axios.delete(`/api/students/${student._id}`)
                                          .then(() => {
                                            // Refresh the student list
                                            const updatedStudents = students.filter(s => s._id !== student._id);
                                            setStudents(updatedStudents);
                                          })
                                          .catch(err => {
                                            console.error('Error deleting student:', err);
                                            alert('Failed to delete student');
                                          });
                                      }
                                    }}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                Object.keys(groupedStudents).sort().map(key => {
                const [classItem, section] = key.split('-');
                return (
                  <div key={key} className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                    <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-md font-medium leading-6 text-gray-900">
                        Class {classItem} - Section {section} ({groupedStudents[key].length} students)
                      </h3>
                    </div>

                    {groupedStudents[key].length === 0 ? (
                      <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                        No students found in this section
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {groupedStudents[key].map((student) => (
                          <li key={student._id}>
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                    {student.user?.profileImage?.url ? (
                                      <img
                                        src={student.user.profileImage.url}
                                        alt={student.user?.name || 'Student'}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.user?.name?.charAt(0) || 'S')}&background=0D8ABC&color=fff&size=256`;
                                        }}
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                        {student.user?.name?.charAt(0) || 'S'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{student.user?.name}</div>
                                    <div className="text-sm text-gray-500">Roll Number: {student.rollNumber}</div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Link
                                    to={`/students/${student._id}`}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    View Details
                                  </Link>
                                  {user && (user.role === 'admin' || user.role === 'principal') && (
                                    <>
                                      <Link
                                        to={`/students/edit/${student._id}`}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                      >
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                                            axios.delete(`/api/students/${student._id}`)
                                              .then(() => {
                                                // Refresh the student list
                                                const updatedStudents = students.filter(s => s._id !== student._id);
                                                setStudents(updatedStudents);
                                              })
                                              .catch(err => {
                                                console.error('Error deleting student:', err);
                                                alert('Failed to delete student');
                                              });
                                          }
                                        }}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
              )}
            </div>
          ) : (
            // Display students grouped by section for a specific class
            <div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Class {selectedClass} - All Sections ({filteredStudents.length} students)
                  </h3>
                </div>
              </div>

              {sections.map(section => (
                <div key={section} className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                  <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-md font-medium leading-6 text-gray-900">
                      Section {section} ({groupedStudents[section].length} students)
                    </h3>
                  </div>

                  {groupedStudents[section].length === 0 ? (
                    <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                      No students found in this section
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {groupedStudents[section].map((student) => (
                        <li key={student._id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                  {student.user?.profileImage?.url ? (
                                    <img
                                      src={student.user.profileImage.url}
                                      alt={student.user?.name || 'Student'}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.user?.name?.charAt(0) || 'S')}&background=0D8ABC&color=fff&size=256`;
                                      }}
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                      {student.user?.name?.charAt(0) || 'S'}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{student.user?.name}</div>
                                  <div className="text-sm text-gray-500">Roll Number: {student.rollNumber}</div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Link
                                  to={`/students/${student._id}`}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  View Details
                                </Link>
                                {user && (user.role === 'admin' || user.role === 'principal') && (
                                  <>
                                    <Link
                                      to={`/students/edit/${student._id}`}
                                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      Edit
                                    </Link>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                                          axios.delete(`/api/students/${student._id}`)
                                            .then(() => {
                                              // Refresh the student list
                                              const updatedStudents = students.filter(s => s._id !== student._id);
                                              setStudents(updatedStudents);
                                            })
                                            .catch(err => {
                                              console.error('Error deleting student:', err);
                                              alert('Failed to delete student');
                                            });
                                        }
                                      }}
                                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Loading Indicator for Pagination */}
          {isLoadingMore && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-700">Loading students...</p>
              </div>
            </div>
          )}

          {/* Pagination Controls - Only show when there are multiple pages */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingMore}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === 1 || isLoadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoadingMore}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === totalPages || isLoadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{Math.min((currentPage - 1) * studentsPerPage + 1, totalFilteredCount)}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * studentsPerPage, totalFilteredCount)}</span> of{' '}
                    <span className="font-medium">{totalFilteredCount}</span> students
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoadingMore}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                        currentPage === 1 || isLoadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
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
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          } ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoadingMore}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                        currentPage === totalPages || isLoadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.414l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Students per page selector and pagination controls */}
          {totalFilteredCount > studentsPerPage && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                {/* Students per page selector */}
                <div className="flex items-center">
                  <label htmlFor="students-per-page" className="mr-2 text-sm text-gray-700">
                    Students per page:
                  </label>
                  <select
                    id="students-per-page"
                    name="students-per-page"
                    className="block w-20 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    value={studentsPerPage}
                    onChange={(e) => {
                      // Show loading indicator
                      setIsLoadingMore(true);

                      // Update students per page
                      setStudentsPerPage(Number(e.target.value));

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

                {/* Pagination info */}
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * studentsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * studentsPerPage, totalFilteredCount)}
                  </span>{' '}
                  of <span className="font-medium">{totalFilteredCount}</span> students
                </div>
              </div>

              {/* Pagination controls */}
              <div className="flex justify-center mt-4">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {/* Previous page button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingMore}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 || isLoadingMore
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {[...Array(totalPages).keys()].map((page) => {
                    const pageNumber = page + 1;
                    // Only show a few pages around the current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={isLoadingMore}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }

                    // Show ellipsis for skipped pages
                    if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={`ellipsis-${pageNumber}`}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  {/* Next page button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoadingMore}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages || isLoadingMore
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
