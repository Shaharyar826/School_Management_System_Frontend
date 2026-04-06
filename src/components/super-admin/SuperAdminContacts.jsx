import SuperAdminLayout from './SuperAdminLayout';
import { useState, useEffect, useContext } from 'react';
import axios from '../../config/axios';
import SuperAdminContext from '../../context/SuperAdminContext';
import { toast } from 'react-toastify';

const SuperAdminContacts = () => {
  const { token } = useContext(SuperAdminContext);
  const headers = { Authorization: `Bearer ${token}` };

  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchMessages(); }, [filter, page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (filter === 'unread') params.set('unread', 'true');
      const res = await axios.get(`/api/super-admin/contacts?${params}`, { headers });
      setMessages(res.data.data || []);
      setTotal(res.data.totalCount || 0);
      setUnreadCount(res.data.unreadCount || 0);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`/api/super-admin/contacts/${id}/read`, {}, { headers });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Contact Messages</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} total · <span className="text-indigo-600 font-medium">{unreadCount} unread</span>
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {['all', 'unread'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {f === 'unread' ? `Unread (${unreadCount})` : 'All Messages'}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">No messages found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {messages.map(msg => (
                  <button key={msg.id} onClick={() => openMessage(msg)}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors ${selected?.id === msg.id ? 'bg-indigo-50' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {!msg.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
                        {msg.isRead && <span className="w-2 h-2 flex-shrink-0 mt-1.5" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!msg.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {msg.subject || '(No subject)'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{msg.name} · {msg.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 ml-5 line-clamp-1">{msg.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          {selected && (
            <div className="w-96 bg-white rounded-xl border border-slate-200 flex flex-col flex-shrink-0">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Message</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Subject</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">{selected.subject || '(No subject)'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-400">From</span><p className="text-slate-700 font-medium mt-0.5">{selected.name}</p></div>
                  <div><span className="text-slate-400">Email</span><p className="text-slate-700 font-medium mt-0.5 break-all">{selected.email}</p></div>
                  <div><span className="text-slate-400">Date</span><p className="text-slate-700 font-medium mt-0.5">{new Date(selected.createdAt).toLocaleString()}</p></div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Message</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || '')}`}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-indigo-200 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminContacts;
