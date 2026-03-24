import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
    <PublicNavbar />
    <main className="flex-1 pt-16">
      {children}
    </main>
    <PublicFooter />
  </div>
);

export default PublicLayout;
