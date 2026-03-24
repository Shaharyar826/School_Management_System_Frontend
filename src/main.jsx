import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './form-fixes.css'
import './input-glow.css'
import './school-theme.css'
import './dark-theme.css'
import './dashboard-dark.css'
import './auth-dark.css'
import './global-dark.css'
import './light-theme-animations.css'
import './floating-label.css'
import './modal-fixes.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PublicDataProvider } from './context/PublicDataContext'
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <PublicDataProvider>
              <BrowserRouter>
                <AppWithInterceptors />
                {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
              </BrowserRouter>
            </PublicDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
