import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import axios from '../../config/axios';

const SuperAdminPortal = () => {
  const [stats, setStats] = useState({});
  const [tenants, setTenants] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tenantsRes, revenueRes, settingsRes] = await Promise.all([
        axios.get('/api/super-admin/stats'),
        axios.get('/api/super-admin/tenants'),
        axios.get('/api/super-admin/revenue'),
        axios.get('/api/super-admin/settings')
      ]);
      
      setStats(statsRes.data);
      setTenants(tenantsRes.data);
      setRevenue(revenueRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await axios.put('/api/super-admin/settings', newSettings);
      setSettings(newSettings);
      alert('Settings updated successfully');
    } catch (error) {
      alert('Failed to update settings');
    }
  };

  const suspendTenant = async (tenantId) => {
    try {
      await axios.put(`/api/super-admin/tenants/${tenantId}/suspend`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to suspend tenant');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">EduFlow Pro - Super Admin</h1>
          <p className="text-gray-600">Complete SaaS Management Portal</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            {['dashboard', 'tenants', 'revenue', 'settings', 'branding'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue?.toLocaleString()}</p>
                <p className="text-sm text-gray-500">+{stats.revenueGrowth}% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Active Tenants</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.activeTenants}</p>
                <p className="text-sm text-gray-500">+{stats.tenantGrowth} new this month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Monthly Churn</h3>
                <p className="text-3xl font-bold text-red-600">{stats.churnRate}%</p>
                <p className="text-sm text-gray-500">-0.5% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Avg Revenue Per User</h3>
                <p className="text-3xl font-bold text-purple-600">${stats.arpu}</p>
                <p className="text-sm text-gray-500">+$5 from last month</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <LineChart width={400} height={300} data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
                <PieChart width={400} height={300}>
                  <Pie
                    data={stats.planDistribution}
                    cx={200}
                    cy={150}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {stats.planDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Tenant Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tenant.institutionName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.subdomain}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                          tenant.plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                          tenant.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${tenant.monthlyRevenue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => suspendTenant(tenant._id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Suspend
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">SaaS Configuration</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName || 'EduFlow Pro'}
                  onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Trial Days</label>
                <input
                  type="number"
                  value={settings.trialDays || 14}
                  onChange={(e) => setSettings({...settings, trialDays: parseInt(e.target.value)})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail || 'support@eduflowpro.com'}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Mode</label>
                <select
                  value={settings.maintenanceMode || 'false'}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
              </div>

              <button
                onClick={() => updateSettings(settings)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Brand Management</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
                <input
                  type="color"
                  value={settings.primaryColor || '#3B82F6'}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-20 h-12 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={settings.logoUrl || ''}
                  onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                <input
                  type="url"
                  value={settings.faviconUrl || ''}
                  onChange={(e) => setSettings({...settings, faviconUrl: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>

              <button
                onClick={() => updateSettings(settings)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Update Branding
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPortal;