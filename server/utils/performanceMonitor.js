import { pool } from "../config/config.js";

// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  // Start timing an operation
  startTimer(operationName) {
    const startTime = process.hrtime.bigint();
    return {
      operationName,
      startTime,
      end: () => this.endTimer(operationName, startTime),
    };
  }

  // End timing and record metrics
  endTimer(operationName, startTime) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        avgTime: 0,
      });
    }

    const metric = this.metrics.get(operationName);
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.avgTime = metric.totalTime / metric.count;

    console.log(`⏱️  ${operationName}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  // Get performance statistics
  getStats() {
    const stats = {};
    for (const [operation, metric] of this.metrics) {
      stats[operation] = {
        count: metric.count,
        avgTime: metric.avgTime.toFixed(2),
        minTime: metric.minTime.toFixed(2),
        maxTime: metric.maxTime.toFixed(2),
        totalTime: metric.totalTime.toFixed(2),
      };
    }
    return stats;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Database query performance wrapper
export const queryWithPerformance = async (
  queryText,
  params = [],
  operationName = "Database Query"
) => {
  const monitor = new PerformanceMonitor();
  const timer = monitor.startTimer(operationName);

  try {
    const result = await pool.query(queryText, params);
    timer.end();
    return result;
  } catch (error) {
    timer.end();
    throw error;
  }
};

// Express middleware for endpoint performance monitoring
export const performanceMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const originalSend = res.send;

  res.send = function (data) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000;

    console.log(`🚀 ${req.method} ${req.path}: ${duration.toFixed(2)}ms`);

    // Add performance header
    res.setHeader("X-Response-Time", `${duration.toFixed(2)}ms`);

    return originalSend.call(this, data);
  };

  next();
};

// Export the monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to log slow queries
export const logSlowQuery = (queryText, duration, threshold = 1000) => {
  if (duration > threshold) {
    console.warn(
      `🐌 Slow query detected (${duration.toFixed(2)}ms):`,
      queryText.substring(0, 200) + "..."
    );
  }
};

export default PerformanceMonitor;
