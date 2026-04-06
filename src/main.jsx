import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'

import './index.css'
/* ── Legacy theme files (all rewritten to v2 – no conflicts) ── */
import './school-theme.css'
import './dark-theme.css'
import './dashboard-dark.css'
import './auth-dark.css'
import './global-dark.css'
import './light-theme-animations.css'
import './floating-label.css'
/* ── SaaS Design System (base layer) ── */
import './saas-design-system.css'
import './form-fixes.css'
import './input-glow.css'
import './modal-fixes.css'
/* ── NEW SaaS Design System — WINS ALL CASCADES (loaded last) ── */
import './saas-design-system-new.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PublicDataProvider } from './context/PublicDataContext'
import { SetupProvider } from './context/SetupContext'
import { queryClient } from './config/queryClient'
import './config/axios'
import setupFeatureAccessInterceptor from './utils/featureAccessInterceptor'
import { useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

const AppWithInterceptors = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    setupFeatureAccessInterceptor(navigate);
  }, [navigate]);

  return <App />;
};

/* Scroll to top on every route change — React Router v6 pattern */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <PublicDataProvider>
              <BrowserRouter>
                <ScrollToTop />
                <SetupProvider>
                  <AppWithInterceptors />
                </SetupProvider>
                {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
              </BrowserRouter>
            </PublicDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
