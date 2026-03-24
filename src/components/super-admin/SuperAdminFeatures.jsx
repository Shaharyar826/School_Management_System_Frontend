import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect } from 'react';
import { FEATURES, FEATURE_CONFIG } from '../../config/features';
import axios from '../../config/axios';

const SuperAdminFeatures = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFeature, setEditingFeature] = useState(null);

  useEffect(() => {
    initializeFeatures();
  }, []);

  const initializeFeatures = () => {
    // Initialize features with config data
    const featureList = Object.entries(FEATURE_CONFIG).map(([key, config]) => ({
      id: key,
      name: config.name,
      description: config.description,
      enabled: true,
      pricing: {
        basic: 0,
        standard: 5,
        premium: 10
      },
      requiredRoles: config.requiredRoles,
      routes: config.routes
    }));
    setFeatures(featureList);
    setLoading(false);
  };

  const updateFeaturePricing = (featureId, plan, price) => {
    setFeatures(features.map(feature => 
      feature.id === featureId 
        ? { ...feature, pricing: { ...feature.pricing, [plan]: parseFloat(price) || 0 } }
        : feature
    ));
  };

  const toggleFeature = (featureId) => {
    setFeatures(features.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const saveFeatureChanges = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      await axios.put('/api/super-admin/features', 
        { features },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Features updated successfully');
      setEditingFeature(null);
    } catch (error) {
      alert('Failed to update features');
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Management</h1>
          <p className="text-gray-600">Manage global features and their pricing across all plans</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Platform Features</h2>
              <button
                onClick={saveFeatureChanges}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Plan ($)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standard Plan ($)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium Plan ($)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required Roles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                        <div className="text-sm text-gray-500">{feature.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFeature(feature.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          feature.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={feature.pricing.basic}
                        onChange={(e) => updateFeaturePricing(feature.id, 'basic', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={feature.pricing.standard}
                        onChange={(e) => updateFeaturePricing(feature.id, 'standard', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={feature.pricing.premium}
                        onChange={(e) => updateFeaturePricing(feature.id, 'premium', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {feature.requiredRoles.map(role => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Usage Analytics */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Usage Analytics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">85%</div>
                <div className="text-sm text-gray-500">Features Enabled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-gray-500">Tenant Adoption</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">$2,450</div>
                <div className="text-sm text-gray-500">Monthly Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminFeatures;