import { useState, useEffect } from 'react';
import performanceMonitor from '../../utils/performanceMonitor';
import pollingService from '../../services/pollingService';

// Dev-only tool — renders nothing in production
const PerformanceDebugger = () => {
  const [visible, setVisible] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setVisible(v => !v);
        setReport(performanceMonitor.getReport());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!import.meta.env.DEV || !visible) return null;

  const polling = pollingService.getStatus();

  return (
    <div style={{
      position: 'fixed', top: 10, right: 10, width: 380, maxHeight: '80vh',
      background: 'rgba(0,0,0,0.9)', color: '#fff', padding: 15,
      borderRadius: 8, fontSize: 12, zIndex: 10000, overflow: 'auto', fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <strong style={{ color: '#4CAF50' }}>Performance Debugger</strong>
        <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => { performanceMonitor.clear(); setReport(performanceMonitor.getReport()); }}
          style={{ marginRight: 5, padding: '4px 8px', background: '#FF9800', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Clear
        </button>
        <button onClick={() => setReport(performanceMonitor.getReport())}
          style={{ padding: '4px 8px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {performance.memory && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#FF9800', marginBottom: 4 }}>Memory</div>
          <div>Used: {(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB</div>
          <div>Limit: {(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB</div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#9C27B0', marginBottom: 4 }}>Polling ({Object.keys(polling).length} active)</div>
        {Object.entries(polling).map(([ep, s]) => (
          <div key={ep} style={{ color: s.active ? '#4CAF50' : '#F44336', fontSize: 11 }}>
            {ep} — {s.subscribers} subscribers
          </div>
        ))}
      </div>

      {report && Object.keys(report.apiCalls).length > 0 && (
        <div>
          <div style={{ color: '#2196F3', marginBottom: 4 }}>API Calls</div>
          {Object.entries(report.apiCalls).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([ep, s]) => (
            <div key={ep} style={{ marginBottom: 3 }}>
              <div style={{ color: s.errors > 0 ? '#F44336' : '#4CAF50', fontSize: 11 }}>{ep}</div>
              <div style={{ color: '#888', fontSize: 10, marginLeft: 8 }}>
                {s.count}x · avg {s.avgDuration?.toFixed(0)}ms{s.errors > 0 ? ` · ${s.errors} errors` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ color: '#555', fontSize: 10, textAlign: 'center', marginTop: 10 }}>Ctrl+Shift+D to toggle</div>
    </div>
  );
};

export default PerformanceDebugger;
