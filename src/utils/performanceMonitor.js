// Performance monitoring — active in development only
class PerformanceMonitor {
  constructor() {
    this.apiCalls = new Map();
    this.errorLog = [];
    if (import.meta.env.DEV) this._startMemoryWatch();
  }

  _startMemoryWatch() {
    setInterval(() => {
      if (!performance.memory) return;
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      if (usedJSHeapSize / jsHeapSizeLimit > 0.9) {
        console.warn('High memory usage detected');
      }
    }, 30000);
  }

  trackApiCall(endpoint, method = 'GET', duration = 0, success = true) {
    if (!import.meta.env.DEV) return;
    const key = `${method} ${endpoint}`;
    const stats = this.apiCalls.get(key) || { count: 0, totalDuration: 0, errors: 0 };
    stats.count++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.count;
    if (!success) stats.errors++;
    this.apiCalls.set(key, stats);
  }

  logError(type, message, details = null) {
    if (!import.meta.env.DEV) return;
    this.errorLog.push({ timestamp: new Date(), type, message, details });
    if (this.errorLog.length > 50) this.errorLog.shift();
  }

  getReport() {
    return { apiCalls: Object.fromEntries(this.apiCalls), errorLog: this.errorLog };
  }

  clear() {
    this.apiCalls.clear();
    this.errorLog = [];
  }
}

const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
