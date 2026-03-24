// Date formatting and parsing utilities

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      ...options
    });
  } catch {
    return dateString || 'Invalid date';
  }
};

export const formatDateOnly = (dateString) =>
  formatDate(dateString, { hour: undefined, minute: undefined });

export const formatDateForDisplay = (date) => {
  if (!date) return 'Not specified';
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return timeString;
  }
};

export const parseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const isValidDate = (date) => {
  if (!date) return false;
  return !isNaN(new Date(date).getTime());
};
