import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './debug.css' // Temporary debug CSS
import './form-fixes.css' // CSS fixes for form inputs
import './input-glow.css' // Glowing input field effect
import './school-theme.css' // School theme based on Community Based High School Tando Jam
import './dark-theme.css' // Dark theme styles
import './dashboard-dark.css' // Enhanced dashboard dark theme
import './auth-dark.css' // Enhanced auth forms dark theme
import './global-dark.css' // Global dark theme for all pages
import './light-theme-animations.css' // Light theme animations to match dark mode
import './floating-label.css' // Floating label effect for input fields
import './modal-fixes.css' // CSS fixes for modal display
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PublicDataProvider } from './context/PublicDataContext'
import './config/axios'  // Import axios configuration

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PublicDataProvider>
          <App />
        </PublicDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
