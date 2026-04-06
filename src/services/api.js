import axios from '../config/axios';

// ── Students ──────────────────────────────────────────────────────────────────
export const studentsApi = {
  getAll: (params = {}) => axios.get('/api/students', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/students/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/students', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/students/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/students/${id}`).then(r => r.data),
};

// ── Teachers ──────────────────────────────────────────────────────────────────
export const teachersApi = {
  getAll: (params = {}) => axios.get('/api/teachers', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/teachers/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/teachers', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/teachers/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/teachers/${id}`).then(r => r.data),
};

// ── Fees ──────────────────────────────────────────────────────────────────────
export const feesApi = {
  getAll: (params = {}) => axios.get('/api/fees', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/fees/${id}`).then(r => r.data),
  getStudentFees: (studentId, params = {}) => axios.get(`/api/fees/student/${studentId}`, { params }).then(r => r.data),
  getStudentArrears: (studentId) => axios.get(`/api/fees/arrears/${studentId}`).then(r => r.data),
  create: (data) => axios.post('/api/fees', data).then(r => r.data),
  collectPayment: (id, data) => axios.put(`/api/fees/${id}/collect`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/fees/${id}`).then(r => r.data),
  getReceipt: (feeId, format = 'json') => axios.get(`/api/fee-receipts/${feeId}?format=${format}`).then(r => r.data),
  getStudentReceipts: (studentId) => axios.get(`/api/fee-receipts/student/${studentId}`).then(r => r.data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  getAll: (params = {}) => axios.get('/api/attendance', { params }).then(r => r.data),
  getSummary: (userId, params = {}) => axios.get(`/api/attendance/summary/${userId}`, { params }).then(r => r.data),
  getReport: (params = {}) => axios.get('/api/attendance/report', { params }).then(r => r.data),
  mark: (data) => axios.post('/api/attendance', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/attendance/${id}`, data).then(r => r.data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: (role) => {
    const endpoint =
      ['admin', 'principal', 'tenant_system_admin'].includes(role) ? '/api/dashboard/admin' :
      role === 'teacher' ? '/api/dashboard/teacher' :
      role === 'student' ? '/api/dashboard/student' :
      '/api/dashboard/admin';
    return axios.get(endpoint).then(r => r.data);
  },
};

// ── Salaries ──────────────────────────────────────────────────────────────────
export const salariesApi = {
  getAll: (params = {}) => axios.get('/api/salaries', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/salaries/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/salaries', data).then(r => r.data),
  pay: (id, data) => axios.put(`/api/salaries/${id}/pay`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/salaries/${id}`).then(r => r.data),
};

// ── Admin Staff ───────────────────────────────────────────────────────────────
export const adminStaffApi = {
  getAll: (params = {}) => axios.get('/api/admin-staff', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/admin-staff/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/admin-staff', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/admin-staff/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/admin-staff/${id}`).then(r => r.data),
};

// ── Support Staff ─────────────────────────────────────────────────────────────
export const supportStaffApi = {
  getAll: (params = {}) => axios.get('/api/support-staff', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/support-staff/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/support-staff', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/support-staff/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/support-staff/${id}`).then(r => r.data),
};

// ── Meetings ──────────────────────────────────────────────────────────────────
export const meetingsApi = {
  getAll: (params = {}) => axios.get('/api/meetings', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/meetings/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/meetings', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/meetings/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/meetings/${id}`).then(r => r.data),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (params = {}) => axios.get('/api/notifications', { params }).then(r => r.data),
  markAsRead: (id) => axios.put(`/api/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: () => axios.put('/api/notifications/read-all').then(r => r.data),
  create: (data) => axios.post('/api/notifications', data).then(r => r.data),
  delete: (id) => axios.delete(`/api/notifications/${id}`).then(r => r.data),
};

// ── Notices (was events-notices) ──────────────────────────────────────────────
export const eventsNoticesApi = {
  getAll: (params = {}) => axios.get('/api/notices', { params }).then(r => r.data),
  getById: (id) => axios.get(`/api/notices/${id}`).then(r => r.data),
  create: (data) => axios.post('/api/notices', data).then(r => r.data),
  update: (id, data) => axios.put(`/api/notices/${id}`, data).then(r => r.data),
  delete: (id) => axios.delete(`/api/notices/${id}`).then(r => r.data),
};

// ── School Settings ───────────────────────────────────────────────────────────
export const schoolSettingsApi = {
  get: () => axios.get('/api/school-settings').then(r => r.data),
  update: (data) => axios.put('/api/school-settings', data).then(r => r.data),
};

// ── Gallery ───────────────────────────────────────────────────────────────────
export const galleryApi = {
  getAll: (params = {}) => axios.get('/api/gallery', { params }).then(r => r.data),
  add: (data) => axios.post('/api/gallery', data).then(r => r.data),
  delete: (id) => axios.delete(`/api/gallery/${id}`).then(r => r.data),
};

// ── Landing Page ──────────────────────────────────────────────────────────────
export const landingPageApi = {
  getEvents: () => axios.get('/api/landing/events').then(r => r.data),
  createEvent: (data) => axios.post('/api/landing/events', data).then(r => r.data),
  updateEvent: (id, data) => axios.put(`/api/landing/events/${id}`, data).then(r => r.data),
  deleteEvent: (id) => axios.delete(`/api/landing/events/${id}`).then(r => r.data),
  getTestimonials: () => axios.get('/api/landing/testimonials').then(r => r.data),
  createTestimonial: (data) => axios.post('/api/landing/testimonials', data).then(r => r.data),
  deleteTestimonial: (id) => axios.delete(`/api/landing/testimonials/${id}`).then(r => r.data),
  getPageContent: (page) => axios.get(`/api/landing/page/${page}`).then(r => r.data),
  updatePageContent: (page, data) => axios.put(`/api/landing/page/${page}`, data).then(r => r.data),
};

// ── Results / Exams ───────────────────────────────────────────────────────────
export const academicsApi = {
  getExams: (params = {}) => axios.get('/api/academics/exams', { params }).then(r => r.data),
  createExam: (data) => axios.post('/api/academics/exams', data).then(r => r.data),
  updateExam: (id, data) => axios.put(`/api/academics/exams/${id}`, data).then(r => r.data),
  deleteExam: (id) => axios.delete(`/api/academics/exams/${id}`).then(r => r.data),
  getResults: (params = {}) => axios.get('/api/academics/results', { params }).then(r => r.data),
  addResult: (data) => axios.post('/api/academics/results', data).then(r => r.data),
  deleteResult: (id) => axios.delete(`/api/academics/results/${id}`).then(r => r.data),
};

// ── Parents ───────────────────────────────────────────────────────────────────
export const parentsApi = {
  getAll: (params = {}) => axios.get('/api/parents', { params }).then(r => r.data),
  create: (data) => axios.post('/api/parents', data).then(r => r.data),
  linkStudent: (id, data) => axios.put(`/api/parents/${id}/link-student`, data).then(r => r.data),
  getDashboard: () => axios.get('/api/parents/dashboard').then(r => r.data),
  delete: (id) => axios.delete(`/api/parents/${id}`).then(r => r.data),
};

// ── Siblings ──────────────────────────────────────────────────────────────────
export const siblingsApi = {
  getSiblings: (studentId) => axios.get(`/api/siblings/${studentId}`).then(r => r.data),
  link: (data) => axios.post('/api/siblings/link', data).then(r => r.data),
  unlink: (data) => axios.post('/api/siblings/unlink', data).then(r => r.data),
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactApi = {
  getAll: (params = {}) => axios.get('/api/contact', { params }).then(r => r.data),
  send: (data) => axios.post('/api/contact', data).then(r => r.data),
  markRead: (id) => axios.put(`/api/contact/${id}/read`).then(r => r.data),
  delete: (id) => axios.delete(`/api/contact/${id}`).then(r => r.data),
};

// ── History ───────────────────────────────────────────────────────────────────
export const historyApi = {
  getAll: (params = {}) => axios.get('/api/history', { params }).then(r => r.data),
  create: (data) => axios.post('/api/history', data).then(r => r.data),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadApi = {
  uploadStudents: (formData) => axios.post('/api/upload/students', formData).then(r => r.data),
  uploadTeachers: (formData) => axios.post('/api/upload/teachers', formData).then(r => r.data),
  getHistory: () => axios.get('/api/upload/history').then(r => r.data),
};

// ── Images ────────────────────────────────────────────────────────────────────
export const imagesApi = {
  uploadProfile: (formData) => axios.post('/api/images/profile', formData).then(r => r.data),
  uploadLogo: (formData) => axios.post('/api/images/logo', formData).then(r => r.data),
  delete: (data) => axios.delete('/api/images', { data }).then(r => r.data),
};

// ── Stripe ────────────────────────────────────────────────────────────────────
export const stripeApi = {
  getConfig: () => axios.get('/api/stripe/config').then(r => r.data),
  getPlans: () => axios.get('/api/stripe/plans').then(r => r.data),
  getSubscription: () => axios.get('/api/stripe/subscription').then(r => r.data),
  createCheckout: (data) => axios.post('/api/stripe/create-checkout-session', data).then(r => r.data),
  createPortal: (data) => axios.post('/api/stripe/create-portal-session', data).then(r => r.data),
};

// ── Public ────────────────────────────────────────────────────────────────────
export const publicApi = {
  getSchoolInfo: (subdomain) => axios.get(`/api/public/school/${subdomain}`).then(r => r.data),
  getAllContent: (subdomain) => axios.get(`/api/public/school/${subdomain}/content`).then(r => r.data),
  getPageContent: (subdomain, page) => axios.get(`/api/public/school/${subdomain}/page/${page}`).then(r => r.data),
};

// ── Super Admin ───────────────────────────────────────────────────────────────
export const superAdminApi = {
  login: (data) => axios.post('/api/super-admin/login', data).then(r => r.data),
  getStats: () => axios.get('/api/super-admin/stats').then(r => r.data),
  getTenants: (params = {}) => axios.get('/api/super-admin/tenants', { params }).then(r => r.data),
  getTenant: (id) => axios.get(`/api/super-admin/tenants/${id}`).then(r => r.data),
  updateStatus: (id, data) => axios.put(`/api/super-admin/tenants/${id}/status`, data).then(r => r.data),
  deleteTenant: (id) => axios.delete(`/api/super-admin/tenants/${id}`).then(r => r.data),
};

// ── Filters (kept for backward compat) ───────────────────────────────────────
export const filtersApi = {
  getClasses: () => axios.get('/api/students?limit=1000').then(r => {
    const classes = [...new Set((r.data.data || []).map(s => s.class))].filter(Boolean).sort();
    return { success: true, data: classes };
  }),
};
