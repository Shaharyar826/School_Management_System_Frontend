import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

/** Standard layout for marketing pages (Home, About, Contact, Pricing) */
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
    <PublicNavbar />
    <main className="flex-1 pt-16">
      {children}
    </main>
    <PublicFooter />
  </div>
);

/**
 * Auth layout — same Navbar + Footer but the main area has NO automatic
 * top padding. Auth pages (Login, Register, ForgotPassword) are full-height
 * centred layouts that position themselves.
 */
export const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <PublicNavbar />
    <main className="flex-1 flex flex-col">
      {children}
    </main>
    <PublicFooter />
  </div>
);

export default PublicLayout;
