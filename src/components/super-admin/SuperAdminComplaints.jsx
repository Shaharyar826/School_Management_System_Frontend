import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect, useContext } from 'react';
import axios from '../../config/axios';
import SuperAdminContext from '../../context/SuperAdminContext';
import { toast } from 'react-toastify';

const STATUSES = ['all', 'open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_COLORS = {
  low:    'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high:   'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_COLORS = {
  open:        'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed:      'bg-slate-100 text-slate-500 border-slate-200',
};

const SuperAdminComplaints = () => {
  const { token } = useContext(SuperAdminContext);
  const headers = { Authorization: `Bearer ${token}` };

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchComplaints(); }, [statusFilter, page]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await axios.get(`/api/super-admin/complaints?${params}`, { headers });
      setComplaints(res.data.data || []);
      setTotal(res.data.totalCount || 0);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  const updateComplaint = async (id, updates) => {
    setUpdating(true);
    try {
      await axios.put(`/api/super-admin/complaints/${id}`, updates, { headers });
      toast.success('Updated');
      fetchComplaints();
      if (selected?.id === id) setSelected(prev => ({ ...prev, ...updates }));
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(false); }
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    updateComplaint(selected.id, { adminReply: reply, status: 'in_progress' });
    setReply('');
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Complaints</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total complaints</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-48">
            <input placeholder="Search by subject..."
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchComplaints()} />
          </div>
        </div>

        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">No complaints found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.map(c => (
                  <button key={c.id} onClick={() => setSelected(c)}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors ${selected?.id === c.id ? 'bg-indigo-50' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{c.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.schoolName || 'Unknown school'} · {c.userName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${STATUS_COLORS[c.status]}`}>{c.status.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-96 bg-white rounded-xl border border-slate-200 flex flex-col flex-shrink-0">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Complaint Detail</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Subject</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">{selected.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Description</p>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{selected.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-400">School</span><p className="text-slate-700 font-medium mt-0.5">{selected.schoolName || '—'}</p></div>
                  <div><span className="text-slate-400">Filed by</span><p className="text-slate-700 font-medium mt-0.5">{selected.userName || '—'}</p></div>
                  <div><span className="text-slate-400">Category</span><p className="text-slate-700 font-medium mt-0.5 capitalize">{selected.category}</p></div>
                  <div><span className="text-slate-400">Priority</span><p className={`font-medium mt-0.5 capitalize ${selected.priority === 'urgent' ? 'text-red-600' : selected.priority === 'high' ? 'text-orange-600' : 'text-slate-700'}`}>{selected.priority}</p></div>
                </div>
                {selected.adminReply && (
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-xs text-indigo-600 font-medium mb-1">Your Reply</p>
                    <p className="text-sm text-slate-700">{selected.adminReply}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Reply / Update</label>
                  <textarea rows={3} value={reply} onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Update Status</label>
                  <select value={selected.status}
                    onChange={e => updateComplaint(selected.id, { status: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {['open','in_progress','resolved','closed'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100">
                <button onClick={sendReply} disabled={!reply.trim() || updating}
                  className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminComplaints;
