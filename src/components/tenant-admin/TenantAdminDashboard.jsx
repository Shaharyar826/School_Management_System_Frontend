import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TenantAdminDashboard = () => {
  const { data: config } = useQuery({
    queryKey: ['tenantConfig'],
    queryFn: async () => {
      const res = await axios.get('/api/tenant-admin/config');
      return res.data.data;
    }
  });

  const { data: billing } = useQuery({
    queryKey: ['tenantBilling'],
    queryFn: async () => {
      const res = await axios.get('/api/tenant-admin/billing');
      return res.data.data;
    }
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tenant System Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/tenant-admin/config" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">School Configuration</h3>
            <p className="text-sm text-gray-600">Manage school profile and settings</p>
          </Link>

          <Link to="/tenant-admin/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-600">Create and manage users</p>
          </Link>

          <Link to="/tenant-admin/billing" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing & Subscription</h3>
            <p className="text-sm text-gray-600">Manage subscription and payments</p>
          </Link>

          <Link to="/tenant-admin/features" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Management</h3>
            <p className="text-sm text-gray-600">Enable/disable modules</p>
          </Link>

          <Link to="/tenant-admin/data" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Control</h3>
            <p className="text-sm text-gray-600">Export and manage data</p>
          </Link>
        </div>

        {config && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">School Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">School Name</p>
                <p className="font-medium">{config.schoolName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subdomain</p>
                <p className="font-medium">{config.subdomain}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  config.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {config.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {billing && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Subscription Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="font-medium">{billing.currentPlan || 'Trial'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Amount</p>
                <p className="font-medium">${billing.monthlyAmount?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Subscription</p>
                <p className="font-medium">{billing.hasActiveSubscription ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantAdminDashboard;
