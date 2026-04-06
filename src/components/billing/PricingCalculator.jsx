import { useState, useEffect } from 'react';
import axios from '../../config/axios';

const PricingCalculator = () => {
  const [studentCount, setStudentCount] = useState(50);
  const [selectedFeatures, setSelectedFeatures] = useState(['STUDENTS', 'TEACHERS']);
  const [pricing, setPricing] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    if (pricing && studentCount > 0) {
      calculateEstimate();
    }
  }, [studentCount, selectedFeatures, pricing]);

  const fetchPricing = async () => {
    // Mock pricing features corresponding to the backend custom plan features structure
    setPricing({
      features: {
        'core': { name: 'Core Platform', price: 0.5 },
        'attendance': { name: 'Attendance Module', price: 0.1 },
        'exams': { name: 'Exam & Grading', price: 0.2 },
        'finance': { name: 'Finance & Fee', price: 0.2 },
        'transport': { name: 'Transport Management', price: 0.1 }
      }
    });
    setSelectedFeatures(['core']);
    setLoading(false);
  };

  const calculateEstimate = async () => {
    try {
      const response = await axios.post('/api/stripe/custom-price', {
        students: studentCount,
        features: selectedFeatures
      });
      // Mocking the estimate response format expected by the frontend based on the stripe estimate data
      setEstimate({
        breakdown: [
          { name: 'Core Platform', totalCost: response.data.data.monthlyUSD }
        ],
        subtotal: response.data.data.monthlyUSD,
        minimumCharge: 0,
        finalCost: response.data.data.monthlyUSD
      });
    } catch (error) {
      console.error('Failed to calculate estimate:', error);
    }
  };

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Calculator</h2>
      
      {/* Student Count */}
      <div className="mb-6">
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

      {/* Features */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pricing && Object.entries(pricing.features).map(([key, feature]) => (
            <label key={key} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedFeatures.includes(key)}
                onChange={() => toggleFeature(key)}
                className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{feature.name}</div>
                <div className="text-sm text-gray-500">${feature.price}/student/month</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Estimate */}
      {estimate && (
        <div className="bg-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">Monthly Cost Estimate</h3>
          
          <div className="space-y-2 mb-4">
            {estimate.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>${item.totalCost.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-indigo-200 pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>${estimate.subtotal.toFixed(2)}</span>
            </div>
            {estimate.subtotal < estimate.minimumCharge && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Minimum charge:</span>
                <span>${estimate.minimumCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-indigo-900 mt-2">
              <span>Total Monthly Cost:</span>
              <span>${estimate.finalCost.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            * Pay only for features you use, charged per student per month
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCalculator;