import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useContext, lazy, Suspense, useState, useEffect } from 'react'
import Layout from './components/layout/Layout'
import AuthLogin from './components/auth/AuthLogin'
import TenantLogin from './components/auth/TenantLogin'
import ForgotPassword from './components/auth/ForgotPassword'
import TempPasswordReset from './components/auth/TempPasswordReset'
import ResetPassword from './components/auth/ResetPassword'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './components/routing/PrivateRoute'
import AuthenticatedRoute from './components/routing/AuthenticatedRoute'
import FeatureGuard from './components/routing/FeatureGuard'
import SuperAdminRoute from './components/routing/SuperAdminRoute'
import ProfileEditRouter from './components/routing/ProfileEditRouter'
import ProfileRouter from './components/routing/ProfileRouter'
import AuthContext from './context/AuthContext'
import { SuperAdminProvider } from './context/SuperAdminContext'
import { NavigationProvider } from './context/NavigationContext'
import { ContactMessageProvider } from './context/ContactMessageContext'
import { TenantFeaturesProvider } from './context/TenantFeaturesContext'
import { TenantConfigProvider } from './context/TenantConfigContext'
import { StripeProvider } from './context/StripeContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import EduFlowLanding from './components/saas/EduFlowLanding'
import PublicLayout from './components/public/PublicLayout'
import TenantRegistration from './components/auth/TenantRegistration'
import EmailVerification from './components/auth/EmailVerification'
import PricingPage from './components/saas/PricingPage'

// New public website pages
import HomePage from './pages/public/HomePage'
import PublicPricingPage from './pages/public/PricingPage'
import PublicAboutPage from './pages/public/AboutPage'
import PublicContactPage from './pages/public/ContactPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'
import PricingCalculator from './components/billing/PricingCalculator'
import SchoolSetupDashboard from './components/onboarding/SchoolSetupDashboard'
import TrialExpiredPage from './pages/auth/TrialExpiredPage'
import SuperAdminLogin from './components/super-admin/SuperAdminLogin'
import SuperAdminDashboard from './components/super-admin/SuperAdminDashboard'
import SuperAdminTenants from './components/super-admin/SuperAdminTenants'
import SuperAdminFeatures from './components/super-admin/SuperAdminFeatures'
import SuperAdminPricing from './components/super-admin/SuperAdminPricing'
import SuperAdminBilling from './components/super-admin/SuperAdminBilling'
import SuperAdminAnalytics from './components/super-admin/SuperAdminAnalytics'
import SuperAdminSettings from './components/super-admin/SuperAdminSettings'
import SuperAdminUsers from './components/super-admin/SuperAdminUsers'
import SuperAdminComplaints from './components/super-admin/SuperAdminComplaints'
import SuperAdminContacts from './components/super-admin/SuperAdminContacts'

// Lazy load subscription pages
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const SubscriptionSuccessPage = lazy(() => import('./pages/SubscriptionSuccessPage'))
const SubscriptionCancelPage = lazy(() => import('./pages/SubscriptionCancelPage'))

// Import landing page components
import LandingPage from './pages/LandingPage'

// Lazy load all page components to improve performance
const EventsNoticesPage = lazy(() => import('./pages/EventsNoticesPage'))
const ChildFeesPage = lazy(() => import('./pages/parent/ChildFeesPage'))
const ChildAttendancePage = lazy(() => import('./pages/parent/ChildAttendancePage'))
const TenantAdminDashboard = lazy(() => import('./components/tenant-admin/TenantAdminDashboard'))
const TenantUsersPage = lazy(() => import('./pages/tenant-admin/TenantUsersPage'))
const TenantBillingPage = lazy(() => import('./pages/tenant-admin/TenantBillingPage'))
const ExamsPage = lazy(() => import('./pages/results/ExamsPage'))
const StudentResultsPage = lazy(() => import('./pages/results/StudentResultsPage'))
const EnterMarksPage = lazy(() => import('./pages/results/EnterMarksPage'))
const StudentsPage = lazy(() => import('./pages/StudentsPage'))
const TeachersPage = lazy(() => import('./pages/TeachersPage'))
const SupportStaffPage = lazy(() => import('./pages/SupportStaffPage'))
const AdminStaffPage = lazy(() => import('./pages/AdminStaffPage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const FeesPage = lazy(() => import('./pages/FeesPage'))
const SalariesPage = lazy(() => import('./pages/SalariesPage'))
const StudentAttendancePage = lazy(() => import('./pages/StudentAttendancePage'))
const StudentFeesPage = lazy(() => import('./pages/StudentFeesPage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ContactMessagesPage = lazy(() => import('./pages/ContactMessagesPage'))
const MeetingsPage = lazy(() => import('./pages/MeetingsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
// Import the main school settings page
const SchoolSettingsPage = lazy(() => import('./pages/SchoolSettingsPage'))
const ContentManagementPage = lazy(() => import('./pages/ContentManagementPage'))

const TeacherDetailsPage = lazy(() => import('./pages/TeacherDetailsPage'))

// Lazy load public pages
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AdmissionsPage = lazy(() => import('./pages/AdmissionsPage'))
const AcademicsPage = lazy(() => import('./pages/AcademicsPage'))
const FacultyPage = lazy(() => import('./pages/FacultyPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const FeatureRestrictedPage = lazy(() => import('./pages/FeatureRestrictedPage'))

// Lazy load upload pages
const UploadDashboardPage = lazy(() => import('./pages/upload/UploadDashboardPage'))
const StudentUploadPage = lazy(() => import('./pages/upload/StudentUploadPage'))
const TeacherUploadPage = lazy(() => import('./pages/upload/TeacherUploadPage'))
const AdminStaffUploadPage = lazy(() => import('./pages/upload/AdminStaffUploadPage'))
const SupportStaffUploadPage = lazy(() => import('./pages/upload/SupportStaffUploadPage'))
const UploadHistoryPage = lazy(() => import('./pages/upload/UploadHistoryPage'))

// Lazy load form components
const AddTeacher = lazy(() => import('./components/teachers/AddTeacher'))
const EditTeacher = lazy(() => import('./components/teachers/EditTeacher'))
const ViewTeacher = lazy(() => import('./components/teachers/ViewTeacher'))
const TeacherProfile = lazy(() => import('./components/teachers/TeacherProfile'))
const TeacherProfileEdit = lazy(() => import('./components/teachers/TeacherProfileEdit'))
const AdminProfileEdit = lazy(() => import('./components/admin/AdminProfileEdit'))
const MeetingForm = lazy(() => import('./components/meetings/MeetingForm'))
const AddStudent = lazy(() => import('./components/students/AddStudent'))
const EditStudent = lazy(() => import('./components/students/EditStudent'))
const ViewStudent = lazy(() => import('./components/students/ViewStudent'))
const AddFee = lazy(() => import('./components/fees/AddFee'))
const ProcessFeePayment = lazy(() => import('./components/fees/ProcessFeePayment'))
const ViewFee = lazy(() => import('./components/fees/ViewFee'))
const FeeReceipt = lazy(() => import('./components/fees/FeeReceipt'))
const FeeStatement = lazy(() => import('./components/fees/FeeStatement'))
const StudentFeeReceipts = lazy(() => import('./components/fees/StudentFeeReceipts'))
const AddSalary = lazy(() => import('./components/salaries/AddSalary'))
const ViewSalary = lazy(() => import('./components/salaries/ViewSalary'))
const EditSalary = lazy(() => import('./components/salaries/EditSalary'))
const ProcessSalaryPayment = lazy(() => import('./components/salaries/ProcessSalaryPayment'))
const AddAdminStaff = lazy(() => import('./components/admin-staff/AddAdminStaff'))
const AddSupportStaff = lazy(() => import('./components/support-staff/AddSupportStaff'))

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

function App() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setInitialLoad(false);
    }
  }, [loading]);

  if (initialLoad && loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <SuperAdminProvider>
      <NavigationProvider>
        <ContactMessageProvider>
          <TenantConfigProvider>
            <TenantFeaturesProvider>
              <StripeProvider>
              <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public Routes */}
          {/* Public website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PublicPricingPage />} />
          <Route path="/about" element={<PublicAboutPage />} />
          <Route path="/contact" element={<PublicContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Legacy routes */}
          <Route path="/old" element={<EduFlowLanding />} />
          <Route path="/signup" element={<TenantRegistration />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/pricing-calculator" element={<PublicLayout><PricingPage /></PublicLayout>} />
          <Route path="/calculator" element={<PublicLayout><PricingCalculator /></PublicLayout>} />
          <Route path="/home" element={<PublicLayout><LandingPage /></PublicLayout>} />
          
          {/* Super Admin Portal */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin/dashboard" element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/tenants" element={
            <SuperAdminRoute>
              <SuperAdminTenants />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/features" element={
            <SuperAdminRoute>
              <SuperAdminFeatures />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/pricing" element={
            <SuperAdminRoute>
              <SuperAdminPricing />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/billing" element={
            <SuperAdminRoute>
              <SuperAdminBilling />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/analytics" element={
            <SuperAdminRoute>
              <SuperAdminAnalytics />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/settings" element={
            <SuperAdminRoute>
              <SuperAdminSettings />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/users" element={
            <SuperAdminRoute>
              <SuperAdminUsers />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/complaints" element={
            <SuperAdminRoute>
              <SuperAdminComplaints />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin/contacts" element={
            <SuperAdminRoute>
              <SuperAdminContacts />
            </SuperAdminRoute>
          } />
          <Route path="/super-admin" element={<SuperAdminLogin />} />
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/tenant-login" element={<TenantLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-temp-password" element={
          <PrivateRoute>
            <TempPasswordReset />
          </PrivateRoute>
        } />
        <Route path="/admissions" element={
          <PublicLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <AdmissionsPage />
          </Suspense>
          </PublicLayout>
        } />
        <Route path="/academics" element={
          <PublicLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <AcademicsPage />
          </Suspense>
          </PublicLayout>
        } />
        <Route path="/faculty" element={
          <PublicLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <FacultyPage />
          </Suspense>
          </PublicLayout>
        } />
        <Route path="/events" element={
          <PublicLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <EventsPage />
          </Suspense>
          </PublicLayout>
        } />
        <Route path="/gallery" element={
          <PublicLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <GalleryPage />
          </Suspense>
          </PublicLayout>
        } />
        {/* <Route path="/public-button-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PublicButtonTestPage />
          </Suspense>
        } /> */}

        {/* Feature Restricted Route */}
        <Route path="/feature-restricted" element={
          <Suspense fallback={<LoadingSpinner />}>
            <FeatureRestrictedPage />
          </Suspense>
        } />

        {/* Protected Routes */}
        <Route path="/setup" element={
          <PrivateRoute>
            <PublicLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SchoolSetupDashboard />
            </Suspense>
            </PublicLayout>
          </PrivateRoute>
        } />

        {/* Trial expired — only shown when trial is over and no payment method */}
        <Route path="/billing" element={
          <PrivateRoute>
            <TrialExpiredPage />
          </PrivateRoute>
        } />

        <Route path="/dashboard" element={
          <AuthenticatedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </AuthenticatedRoute>
        } />

        {/* Pending approvals route removed as it's no longer needed */}

        {/* Lazy-loaded routes */}
        <Route path="/teachers" element={
          <AuthenticatedRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <TeachersPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </AuthenticatedRoute>
        } />

        <Route path="/students" element={
          <AuthenticatedRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <StudentsPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </AuthenticatedRoute>
        } />

        <Route path="/attendance" element={
          <AuthenticatedRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <AttendancePage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </AuthenticatedRoute>
        } />

        <Route path="/student-attendance" element={
          <AuthenticatedRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <StudentAttendancePage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </AuthenticatedRoute>
        } />

        <Route path="/fees" element={
          <AuthenticatedRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <FeesPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </AuthenticatedRoute>
        } />

        <Route path="/student-fees" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <StudentFeesPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        {/* Parent Routes */}
        <Route path="/parent/children/:childId/fees" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ChildFeesPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/parent/children/:childId/attendance" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ChildAttendancePage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Result Routes */}
        <Route path="/results/exams" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ExamsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/results/exams/:examId/marks" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EnterMarksPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/my-results" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentResultsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Tenant Admin Routes */}
        <Route path="/tenant-admin" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <TenantAdminDashboard />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/tenant-admin/users" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <TenantUsersPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/tenant-admin/billing" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <TenantBillingPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <SalariesPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/support-staff" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SupportStaffPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/admin-staff" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminStaffPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/events-notices" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <EventsNoticesPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        {/* Redirect from old notices path to new events-notices path */}
        <Route path="/notices" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <EventsNoticesPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/notifications" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <NotificationsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/contact-messages" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <ContactMessagesPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/meetings" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <MeetingsPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/meetings/new" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <MeetingForm />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/meetings/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <MeetingForm />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* History routes */}
        <Route path="/history" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <HistoryPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/history/:entityType/:entityId" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <HistoryPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Subscription Management */}
        <Route path="/subscription" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SubscriptionPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Subscription Success/Cancel Pages */}
        <Route path="/subscription/success" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionSuccessPage />
          </Suspense>
        } />

        <Route path="/subscription/cancel" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionCancelPage />
          </Suspense>
        } />

        {/* School Settings */}
        <Route path="/school-settings" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SchoolSettingsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Content Management */}
        <Route path="/content-management" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ContentManagementPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />



        {/* Add form routes */}
        <Route path="/teachers/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddTeacher />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/students/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddStudent />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddFee />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/process-payment/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProcessFeePayment />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/receipt/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <FeeReceipt />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/statement/:studentId" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <FeeStatement />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ViewFee />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddSalary />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EditSalary />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/process-payment/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProcessSalaryPayment />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ViewSalary />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/admin-staff/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddAdminStaff />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/support-staff/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddSupportStaff />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />



        {/* Teacher detail routes - more specific routes first */}
        <Route path="/teachers/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EditTeacher />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/teachers/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <TeacherDetailsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Student detail routes - more specific routes first */}
        <Route path="/students/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EditStudent />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/students/:id/fee-receipts" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentFeeReceipts />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/students/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ViewStudent />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Profile Routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProfileRouter />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/profile/edit" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProfileEditRouter />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/user-profile" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <UserProfilePage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Upload Routes */}
        <Route path="/upload" element={
          <PrivateRoute>
            <Layout>
              <FeatureGuard>
                <Suspense fallback={<LoadingSpinner />}>
                  <UploadDashboardPage />
                </Suspense>
              </FeatureGuard>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/student" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/teacher" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <TeacherUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/admin-staff" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminStaffUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/support-staff" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SupportStaffUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/history" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <UploadHistoryPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Test route for button functionality - commenting out for now */}
        {/* <Route path="/button-test" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ButtonTestPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } /> */}


        </Routes>
            </StripeProvider>
        </TenantFeaturesProvider>
        </TenantConfigProvider>
      </ContactMessageProvider>
    </NavigationProvider>
    </SuperAdminProvider>
  )
}

export default App
