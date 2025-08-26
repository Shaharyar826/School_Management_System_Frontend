import axios from 'axios';

/**
 * Get the number of absences for a student in the current month
 * @param {string} studentId - The ID of the student
 * @param {Date} date - Optional date to check (defaults to current month)
 * @returns {Promise<{absenceCount: number, suggestedFine: number}>} - The number of absences and suggested fine
 */
export const getStudentAbsences = async (studentId, date = new Date()) => {
  try {
    // Calculate start and end dates for the month
    const year = date.getFullYear();
    const month = date.getMonth(); // JavaScript months are 0-indexed
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    // Format dates for API query
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Query for attendance records for this student in the current month
    const res = await axios.get(`/api/attendance?userType=student&userId=${studentId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
    
    if (res.data.success) {
      // Count absences
      const absences = res.data.data.filter(record => record.status === 'absent');
      const absenceCount = absences.length;
      
      // Calculate suggested fine (if absences > 3, charge 100 per additional absence)
      const allowedAbsences = 3;
      const finePerAbsence = 100;
      
      let suggestedFine = 0;
      if (absenceCount > allowedAbsences) {
        suggestedFine = (absenceCount - allowedAbsences) * finePerAbsence;
      }
      
      return {
        absenceCount,
        suggestedFine
      };
    }
    
    return {
      absenceCount: 0,
      suggestedFine: 0
    };
  } catch (err) {
    console.error('Error checking attendance records:', err);
    return {
      absenceCount: 0,
      suggestedFine: 0
    };
  }
};

/**
 * Check if a fee record already exists for a student in the current month
 * @param {string} studentId - The ID of the student
 * @param {Date} date - Optional date to check (defaults to current month)
 * @returns {Promise<{exists: boolean, records: Array}>} - Whether a fee record exists and the records
 */
export const checkExistingFeeRecords = async (studentId, date = new Date()) => {
  try {
    // Get the current month and year
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed, API expects 1-indexed

    // Query for existing fee records for this student in the current month
    // FIX: Use studentId as the query parameter name instead of student
    const res = await axios.get(`/api/fees?studentId=${studentId}&month=${month}&year=${year}`);

    if (res.data.success) {
      return {
        exists: res.data.data.length > 0,
        records: res.data.data
      };
    }
    
    return {
      exists: false,
      records: []
    };
  } catch (err) {
    console.error('Error checking existing fee records:', err);
    return {
      exists: false,
      records: []
    };
  }
};
