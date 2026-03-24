import axios from 'axios';

// Create axios interceptor for handling feature access errors
const setupFeatureAccessInterceptor = (navigate) => {
  // Response interceptor to handle feature access errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;
        
        // Handle feature access restrictions
        if (status === 403 && data.featureRequired) {
          // Store error details for the restricted page
          sessionStorage.setItem('featureError', JSON.stringify({
            feature: data.featureRequired,
            message: data.message,
            redirectTo: data.redirectTo
          }));
          
          // Navigate to feature restricted page
          navigate('/feature-restricted');
          return Promise.reject(error);
        }
        
        // Handle onboarding incomplete
        if (status === 403 && data.redirectTo === '/setup') {
          navigate('/setup');
          return Promise.reject(error);
        }
        
        // Handle subscription issues
        if (status === 403 && data.redirectTo === '/subscription') {
          navigate('/subscription');
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

export default setupFeatureAccessInterceptor;