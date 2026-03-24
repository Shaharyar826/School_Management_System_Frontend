import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const SchoolSetupDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(50);
  const [setupData, setSetupData] = useState({
    selectedModules: [],
    portals: {
      student: true,
      teacher: true,
      parent: false
    },
    schoolStructure: {
      classes: [],
      sections: [],
      subjects: []
    },
    preferences: {
      academicYear: '',
      currency: 'USD',
      timezone: 'UTC'
    }
  });
  const [pricing, setPricing] = useState({ total: 0, breakdown: [] });
  const [pricingData, setPricingData] = useState(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await axios.get('/api/billing/pricing');
      setPricingData(response.data.data);
      
      // Auto-select required modules
      const requiredModules = ['STUDENTS', 'TEACHERS'];
      setSetupData(prev => ({
        ...prev,
        selectedModules: requiredModules
      }));
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    }
  };

  useEffect(() => {
    if (pricingData && studentCount > 0) {
      calculatePricing();
    }
  }, [setupData.selectedModules, studentCount, pricingData]);

  const calculatePricing = async () => {
    try {
      const response = await axios.post('/api/billing/estimate', {
        studentCount,
        features: setupData.selectedModules
      });
      const estimate = response.data.data;
      setPricing({
        total: estimate.finalCost,
        breakdown: estimate.breakdown
      });
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
    }
  };

  const handleModuleToggle = (moduleId) => {
    const requiredModules = ['STUDENTS', 'TEACHERS'];
    if (requiredModules.includes(moduleId)) return;

    setSetupData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      const hostname = window.location.hostname;
      let tenantIdentifier = null;
      
      if (hostname.includes('.') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        const parts = hostname.split('.');
        if (parts.length >= 3) {
          tenantIdentifier = parts[0];
        } else if (parts.length === 2) {
          tenantIdentifier = hostname;
        }
      } else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost:') || hostname.startsWith('127.0.0.1:')) {
        tenantIdentifier = new URLSearchParams(window.location.search).get('tenant') || 'cbhstj';
      }
      
      const headers = {};
      if (tenantIdentifier && tenantIdentifier !== 'www') {
        headers['X-Tenant'] = tenantIdentifier;
      }
      
      const result = await axios.post('/api/onboarding/complete-setup', {
        modules: setupData.selectedModules,
        structure: setupData.schoolStructure,
        preferences: setupData.preferences,
        studentCount,
        portals: setupData.portals
      }, { headers });
      
      // Redirect to pricing page with selected features
      const featuresParam = setupData.selectedModules.join(',');
      navigate(`/pricing?features=${featuresParam}&students=${studentCount}`);
    } catch (error) {
      console.error('Setup completion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    navigate('/dashboard?setup=incomplete');
  };

  if (!pricingData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Your School Management System
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Pay only for features you use - charged per student per month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Student Count */}
          <div className="px-6 py-4 bg-blue-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              How many students do you have?
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Students: {studentCount}
              </label>
              <input
                type="range"
                min="1"
                max="1000"
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>1000</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-green-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Your Features
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose features you need. You can add or remove features anytime.
            </p>
          </div>

          {/* Portal Selection */}
          <div className="px-6 py-4 bg-purple-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Enable User Portals
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select which portals you want to enable for your school
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                <input
                  type="checkbox"
                  checked={setupData.portals.student}
                  onChange={(e) => setSetupData(prev => ({
                    ...prev,
                    portals: { ...prev.portals, student: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-900">Student Portal</label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                <input
                  type="checkbox"
                  checked={setupData.portals.teacher}
                  onChange={(e) => setSetupData(prev => ({
                    ...prev,
                    portals: { ...prev.portals, teacher: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-900">Teacher Portal</label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                <input
                  type="checkbox"
                  checked={setupData.portals.parent}
                  onChange={(e) => setSetupData(prev => ({
                    ...prev,
                    portals: { ...prev.portals, parent: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-900">Parent Portal</label>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {Object.entries(pricingData.features).map(([key, feature]) => {
                const isRequired = ['STUDENTS', 'TEACHERS'].includes(key);
                const isSelected = setupData.selectedModules.includes(key);
                
                return (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isRequired ? 'opacity-75' : ''}`}
                    onClick={() => handleModuleToggle(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isRequired}
                          className="h-4 w-4 text-blue-600 rounded"
                          readOnly
                        />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {feature.name}
                            {isRequired && (
                              <span className="ml-2 text-xs text-blue-600 font-semibold">
                                Required
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ${feature.price}/student/month
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Cost Estimate ({studentCount} students)
              </h3>
              <div className="space-y-2">
                {pricing.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="text-gray-900">${item.totalCost.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Monthly Cost</span>
                    <span className="text-blue-600">${pricing.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum charge: $10.00/month • 14-day free trial
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCompleteSetup}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Setting up...' : 'Complete Setup & Start Trial'}
              </button>
              <button
                onClick={handleSkipForNow}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Skip for Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Pay only for what you use • Scale up or down anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSetupDashboard;