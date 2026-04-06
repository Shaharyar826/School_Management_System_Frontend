import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect, useContext } from 'react';
import axios from '../../config/axios';
import SuperAdminContext from '../../context/SuperAdminContext';
import { toast } from 'react-toastify';

const ALL_FEATURES = [
  'student_management','bulk_student_upload','student_profile','siblings_connection','student_portal',
  'teacher_management','admin_staff_management','support_staff_management','bulk_teacher_upload','teacher_portal',
  'parent_portal','parent_dashboard',
  'fee_management','fee_collection','fee_receipts','fee_arrears','partial_payments',
  'salary_management','salary_payment',
  'attendance_marking','attendance_reports','attendance_summary',
  'admin_dashboard','teacher_dashboard','student_dashboard',
  'notices','meetings','notifications','contact_messages',
  'exam_management','result_management','auto_grading',
  'school_settings','logo_upload','profile_images','gallery',
  'landing_page_events','testimonials','page_content','public_school_page','public_gallery',
  'upload_history','results_export','history_audit_log',
  'stripe_billing','billing_portal',
];

const SuperAdminPricing = () => {
  const { token } = useContext(SuperAdminContext);
  const headers = { Authorization: `Bearer ${token}` };

  const [plans, setPlans] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('plans'); // plans | currencies
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await axios.get('/api/super-admin/platform/settings', { headers });
      setPlans(res.data.data.pricing_plans || []);
      setRates(res.data.data.currency_rates || {});
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const savePlans = async (updated) => {
    setSaving(true);
    try {
      await axios.put('/api/super-admin/platform/settings/pricing_plans', { value: updated }, { headers });
      setPlans(updated);
      toast.success('Pricing plans saved');
    } catch { toast.error('Failed to save plans'); }
    finally { setSaving(false); }
  };

  const saveRates = async (updated) => {
    setSaving(true);
    try {
      await axios.put('/api/super-admin/platform/settings/currency_rates', { value: updated }, { headers });
      setRates(updated);
      toast.success('Currency rates saved');
    } catch { toast.error('Failed to save rates'); }
    finally { setSaving(false); }
  };

  const handlePlanSave = (plan) => {
    const updated = editingPlan?.id && plans.find(p => p.id === editingPlan.id)
      ? plans.map(p => p.id === plan.id ? plan : p)
      : [...plans, { ...plan, id: plan.name.toLowerCase().replace(/\s+/g, '_') }];
    savePlans(updated);
    setEditingPlan(null);
  };

  const togglePlanActive = (id) => savePlans(plans.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const deletePlan = (id) => { if (confirm('Delete this plan?')) savePlans(plans.filter(p => p.id !== id)); };

  if (loading) return (
    <SuperAdminLayout>
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </SuperAdminLayout>
  );

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pricing & Currency</h1>
            <p className="text-sm text-slate-500 mt-0.5">Changes reflect immediately on all public pages</p>
          </div>
          {saving && <span className="text-sm text-indigo-600 font-medium">Saving...</span>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {['plans', 'currencies'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'plans' ? 'Pricing Plans' : 'Currency Rates'}
            </button>
          ))}
        </div>

        {/* Plans tab */}
        {tab === 'plans' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setEditingPlan({})}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className={`bg-white rounded-xl border p-5 space-y-4 ${plan.popular ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                        {plan.popular && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Popular</span>}
                      </div>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ${plan.pricePerStudentUSD}
                        <span className="text-sm font-normal text-slate-400"> /student/mo</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Up to {plan.maxStudents ?? '∞'} students</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${plan.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {plan.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 max-h-40 overflow-y-auto">
                    {(plan.features || []).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="12" height="12" fill="none" stroke="#10B981" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 13l4 4L19 7" /></svg>
                        <span style={{ color: '#374151', fontSize: 11 }}>{f.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditingPlan(plan)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => togglePlanActive(plan.id)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      {plan.active ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => deletePlan(plan.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currencies tab */}
        {tab === 'currencies' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm text-slate-500">Rates are relative to USD (1 USD = X currency). Users see prices in their local currency based on their country.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(rates).map(([code, info]) => (
                <div key={code} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-10 text-center">
                    <span className="text-lg font-bold text-slate-700">{info.symbol}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{info.name}</p>
                    <p className="text-xs text-slate-400">{code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">1 USD =</span>
                    <input type="number" step="0.01" min="0"
                      className="w-24 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={info.rate}
                      onChange={e => setRates(prev => ({ ...prev, [code]: { ...prev[code], rate: parseFloat(e.target.value) || 0 } }))}
                    />
                    <span className="text-xs text-slate-400">{code}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => saveRates(rates)} disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                Save Rates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Plan edit modal */}
      {editingPlan !== null && (
        <PlanModal plan={editingPlan} onSave={handlePlanSave} onClose={() => setEditingPlan(null)} />
      )}
    </SuperAdminLayout>
  );
};

const PlanModal = ({ plan, onSave, onClose }) => {
  const isNew = !plan.id;
  const [form, setForm] = useState({
    id: plan.id || '',
    name: plan.name || '',
    pricePerStudentUSD: plan.pricePerStudentUSD ?? 0.5,
    maxStudents: plan.maxStudents ?? 500,
    features: plan.features || [],
    popular: plan.popular ?? false,
    active: plan.active ?? true,
    description: plan.description || '',
  });

  const toggle = (f) => setForm(p => ({
    ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{isNew ? 'New Plan' : `Edit — ${plan.name}`}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Plan Name</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Price per Student (USD/mo)</label>
              <input type="number" step="0.01" min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.pricePerStudentUSD} onChange={e => setForm(p => ({ ...p, pricePerStudentUSD: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Max Students</label>
              <input type="number" min="1"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.maxStudents} onChange={e => setForm(p => ({ ...p, maxStudents: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.popular} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="rounded" />
              Mark as Popular
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
              Active (visible on site)
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Features ({form.features.length} selected)</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {ALL_FEATURES.map(f => (
                <label key={f} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                  <input type="checkbox" checked={form.features.includes(f)} onChange={() => toggle(f)} className="rounded" />
                  {f.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            {isNew ? 'Create Plan' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPricing;
