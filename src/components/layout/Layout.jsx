import { useContext, useState, memo } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AuthContext from '../../context/AuthContext';
import PasswordResetChecker from '../routing/PasswordResetChecker';

const Layout = memo(({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col relative overflow-x-clip">
      {isAuthenticated && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 min-h-0 min-w-0 relative">
        {isAuthenticated && (
          <>
            {/* Desktop sidebar column */}
            <div className="hidden md:block shrink-0">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Mobile sidebar drawer */}
            <div className={`fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden relative z-10">
            <PasswordResetChecker>
              {children}
            </PasswordResetChecker>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
});

export default Layout;
