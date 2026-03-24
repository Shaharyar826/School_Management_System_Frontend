import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect } from 'react';
import axios from '../../config/axios';

const SuperAdminPricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get('/api/super-admin/pricing-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(response.data.data || defaultPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  };

  const defaultPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      interval: 'month',
      features: ['students', 'teachers', 'attendance'],
      limits: { students: 100, teachers: 10, storage: '1GB' },
      active: true
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 59,
      interval: 'month',
      features: ['students', 'teachers', 'attendance', 'fees', 'events'],
      limits: { students: 500, teachers: 50, storage: '5GB' },
      active: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99,
      interval: 'month',
      features: ['students', 'teachers', 'attendance', 'fees', 'events', 'salaries', 'bulk_upload'],
      limits: { students: 'unlimited', teachers: 'unlimited', storage: '50GB' },
      active: true
    }
  ];

  const savePlan = async (planData) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (editingPlan) {
        await axios.put(`/api/super-admin/pricing-plans/${editingPlan.id}`, 
          planData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post('/api/super-admin/pricing-plans', 
          planData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchPlans();
      setEditingPlan(null);
      setShowCreateModal(false);
    } catch (error) {
      alert('Failed to save plan');
    }
  };

  const deletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const token = localStorage.getItem('superAdminToken');
      await axios.delete(`/api/super-admin/pricing-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlans();
    } catch (error) {
      alert('Failed to delete plan');
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pricing Plans</h1>
              <p className="text-gray-600">Manage subscription plans and pricing</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Create New Plan
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 ml-1">/{plan.interval}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                  <div className="space-y-1">
                    {plan.features.map(feature => (
                      <div key={feature} className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature.replace('_', ' ').toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limits */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Limits</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Students: {plan.limits.students}</div>
                    <div>Teachers: {plan.limits.teachers}</div>
                    <div>Storage: {plan.limits.storage}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Plan Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">45%</div>
                <div className="text-sm text-gray-500">Basic Plan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">35%</div>
                <div className="text-sm text-gray-500">Standard Plan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">20%</div>
                <div className="text-sm text-gray-500">Premium Plan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">$12,450</div>
                <div className="text-sm text-gray-500">Monthly Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingPlan) && (
          <PlanModal
            plan={editingPlan}
            onSave={savePlan}
            onClose={() => {
              setShowCreateModal(false);
              setEditingPlan(null);
            }}
          />
        )}
      </div>
    </SuperAdminLayout>
  );
};

const PlanModal = ({ plan, onSave, onClose }) => {
  const [formData, setFormData] = useState(plan || {
    name: '',
    price: 0,
    interval: 'month',
    features: [],
    limits: { students: 0, teachers: 0, storage: '1GB' },
    active: true
  });

  const availableFeatures = [
    'students', 'teachers', 'attendance', 'fees', 'salaries', 
    'events', 'meetings', 'bulk_upload', 'contact_messages'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleFeature = (feature) => {
    const features = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    setFormData({ ...formData, features });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {plan ? 'Edit Plan' : 'Create New Plan'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Plan Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                required
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="mr-2"
                    />
                    <span className="text-sm">{feature.replace('_', ' ').toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {plan ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPricing;