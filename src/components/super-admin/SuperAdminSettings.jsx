import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect } from 'react';
import axios from '../../config/axios';

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get('/api/super-admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data.data || defaultSettings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const defaultSettings = {
    general: {
      platformName: 'EduFlow',
      supportEmail: 'support@eduflow.com',
      maintenanceMode: false,
      allowNewRegistrations: true,
      defaultTrialDays: 14
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromEmail: 'noreply@eduflow.com',
      fromName: 'EduFlow'
    },
    oauth: {
      googleEnabled: false,
      googleClientId: '',
      googleClientSecret: '',
      microsoftEnabled: false,
      microsoftClientId: '',
      microsoftClientSecret: ''
    },
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      logoUrl: '',
      faviconUrl: '',
      customCss: ''
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      twoFactorRequired: false
    },
    limits: {
      maxTenantsPerPlan: {
        basic: 1000,
        standard: 5000,
        premium: 10000
      },
      maxUsersPerTenant: {
        basic: 100,
        standard: 500,
        premium: 'unlimited'
      },
      storagePerTenant: {
        basic: '1GB',
        standard: '5GB',
        premium: '50GB'
      }
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      await axios.put('/api/super-admin/settings', 
        { settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
              <p className="text-gray-600">Configure global platform settings</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['general', 'smtp', 'oauth', 'branding', 'security', 'limits'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.general?.platformName || ''}
                  onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Support Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.general?.supportEmail || ''}
                  onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Trial Days</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.general?.defaultTrialDays || 14}
                  onChange={(e) => updateSetting('general', 'defaultTrialDays', parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  className="mr-2"
                  checked={settings.general?.maintenanceMode || false}
                  onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRegistrations"
                  className="mr-2"
                  checked={settings.general?.allowNewRegistrations || true}
                  onChange={(e) => updateSetting('general', 'allowNewRegistrations', e.target.checked)}
                />
                <label htmlFor="allowRegistrations" className="text-sm font-medium text-gray-700">
                  Allow New Registrations
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SMTP Settings */}
        {activeTab === 'smtp' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.smtp?.host || ''}
                  onChange={(e) => updateSetting('smtp', 'host', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.smtp?.port || 587}
                  onChange={(e) => updateSetting('smtp', 'port', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.smtp?.username || ''}
                  onChange={(e) => updateSetting('smtp', 'username', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.smtp?.password || ''}
                  onChange={(e) => updateSetting('smtp', 'password', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">From Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.smtp?.fromEmail || ''}
                  onChange={(e) => updateSetting('smtp', 'fromEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">From Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.smtp?.fromName || ''}
                  onChange={(e) => updateSetting('smtp', 'fromName', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="smtpSecure"
                className="mr-2"
                checked={settings.smtp?.secure || false}
                onChange={(e) => updateSetting('smtp', 'secure', e.target.checked)}
              />
              <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
                Use SSL/TLS
              </label>
            </div>
          </div>
        )}

        {/* OAuth Settings */}
        {activeTab === 'oauth' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">OAuth Configuration</h3>
            
            {/* Google OAuth */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="googleEnabled"
                  className="mr-2"
                  checked={settings.oauth?.googleEnabled || false}
                  onChange={(e) => updateSetting('oauth', 'googleEnabled', e.target.checked)}
                />
                <label htmlFor="googleEnabled" className="text-sm font-medium text-gray-700">
                  Enable Google OAuth
                </label>
              </div>
              {settings.oauth?.googleEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Google Client ID</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.oauth?.googleClientId || ''}
                      onChange={(e) => updateSetting('oauth', 'googleClientId', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Google Client Secret</label>
                    <input
                      type="password"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.oauth?.googleClientSecret || ''}
                      onChange={(e) => updateSetting('oauth', 'googleClientSecret', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Microsoft OAuth */}
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="microsoftEnabled"
                  className="mr-2"
                  checked={settings.oauth?.microsoftEnabled || false}
                  onChange={(e) => updateSetting('oauth', 'microsoftEnabled', e.target.checked)}
                />
                <label htmlFor="microsoftEnabled" className="text-sm font-medium text-gray-700">
                  Enable Microsoft OAuth
                </label>
              </div>
              {settings.oauth?.microsoftEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Microsoft Client ID</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.oauth?.microsoftClientId || ''}
                      onChange={(e) => updateSetting('oauth', 'microsoftClientId', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Microsoft Client Secret</label>
                    <input
                      type="password"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.oauth?.microsoftClientSecret || ''}
                      onChange={(e) => updateSetting('oauth', 'microsoftClientSecret', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Branding Settings */}
        {activeTab === 'branding' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding & Appearance</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                  <input
                    type="color"
                    className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                    value={settings.branding?.primaryColor || '#4F46E5'}
                    onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                  <input
                    type="color"
                    className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                    value={settings.branding?.secondaryColor || '#10B981'}
                    onChange={(e) => updateSetting('branding', 'secondaryColor', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  type="url"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.branding?.logoUrl || ''}
                  onChange={(e) => updateSetting('branding', 'logoUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Favicon URL</label>
                <input
                  type="url"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.branding?.faviconUrl || ''}
                  onChange={(e) => updateSetting('branding', 'faviconUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom CSS</label>
                <textarea
                  rows={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.branding?.customCss || ''}
                  onChange={(e) => updateSetting('branding', 'customCss', e.target.value)}
                  placeholder="/* Custom CSS rules */"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password Min Length</label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={settings.security?.passwordMinLength || 8}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session Timeout (hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={settings.security?.sessionTimeout || 24}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={settings.security?.maxLoginAttempts || 5}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    className="mr-2"
                    checked={settings.security?.requireSpecialChars || false}
                    onChange={(e) => updateSetting('security', 'requireSpecialChars', e.target.checked)}
                  />
                  <label htmlFor="requireSpecialChars" className="text-sm font-medium text-gray-700">
                    Require Special Characters in Passwords
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorRequired"
                    className="mr-2"
                    checked={settings.security?.twoFactorRequired || false}
                    onChange={(e) => updateSetting('security', 'twoFactorRequired', e.target.checked)}
                  />
                  <label htmlFor="twoFactorRequired" className="text-sm font-medium text-gray-700">
                    Require Two-Factor Authentication
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Limits Settings */}
        {activeTab === 'limits' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Limits</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Max Tenants Per Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Basic</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.limits?.maxTenantsPerPlan?.basic || 1000}
                      onChange={(e) => updateSetting('limits', 'maxTenantsPerPlan', {
                        ...settings.limits?.maxTenantsPerPlan,
                        basic: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Standard</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.limits?.maxTenantsPerPlan?.standard || 5000}
                      onChange={(e) => updateSetting('limits', 'maxTenantsPerPlan', {
                        ...settings.limits?.maxTenantsPerPlan,
                        standard: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Premium</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.limits?.maxTenantsPerPlan?.premium || 10000}
                      onChange={(e) => updateSetting('limits', 'maxTenantsPerPlan', {
                        ...settings.limits?.maxTenantsPerPlan,
                        premium: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSettings;