import { useState } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const CATEGORIES = ['general', 'billing', 'technical', 'feature'];
const PRIORITIES  = ['low', 'medium', 'high', 'urgent'];

const ComplaintModal = ({ onClose }) => {
  const [form, setForm] = useState({ subject: '', description: '', category: 'general', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/complaints', form);
      setDone(true);
      toast.success('Complaint submitted successfully');
    } catch {
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = { width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#111827', outline: 'none', fontFamily: 'inherit', background: '#fff' };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(233,30,140,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" fill="none" stroke="#E91E8C" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>File a Complaint</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Sent directly to EduFlow support</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {done ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="26" height="26" fill="none" stroke="#10B981" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Complaint Submitted</p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 1.5rem' }}>Our team will review and respond within 24–48 hours.</p>
            <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Subject *</label>
              <input style={inp} placeholder="Brief description of the issue" value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#E91E8C'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lbl}>Category</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Priority</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={lbl}>Description *</label>
              <textarea rows={4} style={{ ...inp, resize: 'none' }} placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#E91E8C'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>

            <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: '9px', borderRadius: 9999, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                style={{ flex: 2, padding: '9px', borderRadius: 9999, border: 'none', background: submitting ? '#D1D5DB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Submitting…' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ComplaintModal;
