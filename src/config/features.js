// Feature configuration for the SaaS platform
export const FEATURES = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  ADMIN_STAFF: 'admin_staff',
  ATTENDANCE: 'attendance',
  FEES: 'fees',
  SALARIES: 'salaries',
  EVENTS: 'events',
  MEETINGS: 'meetings',
  BULK_UPLOAD: 'bulk_upload',
  CONTACT_MESSAGES: 'contact_messages',
  HISTORY: 'history',
  SCHOOL_SETTINGS: 'school_settings',
  CONTENT_MANAGEMENT: 'content_management'
};

// Feature metadata for UI rendering and validation
export const FEATURE_CONFIG = {
  [FEATURES.STUDENTS]: {
    name: 'Student Management',
    description: 'Manage student records, enrollment, and profiles',
    routes: ['/students', '/students/add', '/students/edit', '/students/:id'],
    requiredRoles: ['admin', 'principal', 'vice-principal', 'teacher']
  },
  [FEATURES.TEACHERS]: {
    name: 'Teacher Management',
    description: 'Manage teacher profiles and assignments',
    routes: ['/teachers', '/teachers/add', '/teachers/edit', '/teachers/:id'],
    requiredRoles: ['admin', 'principal', 'vice-principal']
  },
  [FEATURES.ADMIN_STAFF]: {
    name: 'Administrative Staff',
    description: 'Manage administrative staff members',
    routes: ['/admin-staff', '/admin-staff/add'],
    requiredRoles: ['admin', 'principal']
  },
  [FEATURES.ATTENDANCE]: {
    name: 'Attendance Tracking',
    description: 'Track and manage student attendance',
    routes: ['/attendance', '/student-attendance'],
    requiredRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student']
  },
  [FEATURES.FEES]: {
    name: 'Fee Management',
    description: 'Manage student fees and payments',
    routes: ['/fees', '/student-fees', '/fees/add', '/fees/process-payment'],
    requiredRoles: ['admin', 'principal', 'accountant', 'student']
  },
  [FEATURES.SALARIES]: {
    name: 'Salary Management',
    description: 'Manage staff salaries and payroll',
    routes: ['/salaries', '/salaries/add', '/salaries/edit'],
    requiredRoles: ['admin', 'principal', 'accountant']
  },
  [FEATURES.EVENTS]: {
    name: 'Events & Notices',
    description: 'Manage school events and announcements',
    routes: ['/events-notices', '/notices'],
    requiredRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
  },
  [FEATURES.MEETINGS]: {
    name: 'Meeting Management',
    description: 'Schedule and manage meetings',
    routes: ['/meetings', '/meetings/new', '/meetings/edit'],
    requiredRoles: ['admin', 'principal', 'vice-principal', 'teacher']
  },
  [FEATURES.BULK_UPLOAD]: {
    name: 'Bulk Upload',
    description: 'Upload multiple records via spreadsheet',
    routes: ['/upload', '/upload/student', '/upload/teacher', '/upload/admin-staff'],
    requiredRoles: ['admin']
  },
  [FEATURES.CONTACT_MESSAGES]: {
    name: 'Contact Messages',
    description: 'Manage incoming contact messages',
    routes: ['/contact-messages'],
    requiredRoles: ['admin', 'principal']
  },
  [FEATURES.HISTORY]: {
    name: 'Activity History',
    description: 'View system activity logs',
    routes: ['/history'],
    requiredRoles: ['admin', 'principal']
  },
  [FEATURES.SCHOOL_SETTINGS]: {
    name: 'School Settings',
    description: 'Configure school-wide settings',
    routes: ['/school-settings'],
    requiredRoles: ['admin', 'principal']
  },
  [FEATURES.CONTENT_MANAGEMENT]: {
    name: 'Content Management',
    description: 'Manage website content and pages',
    routes: ['/content-management'],
    requiredRoles: ['admin', 'principal']
  }
};

// Default features for new tenants
export const DEFAULT_FEATURES = [FEATURES.STUDENTS, FEATURES.TEACHERS];

// Helper function to check if a route requires a specific feature
export const getFeatureForRoute = (pathname) => {
  for (const [feature, config] of Object.entries(FEATURE_CONFIG)) {
    if (config.routes.some(route => {
      // Handle dynamic routes with parameters
      const routePattern = route.replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(pathname);
    })) {
      return feature;
    }
  }
  return null;
};

// Helper function to check if user role can access a feature
export const canRoleAccessFeature = (userRole, feature) => {
  const config = FEATURE_CONFIG[feature];
  return config ? config.requiredRoles.includes(userRole) : false;
};