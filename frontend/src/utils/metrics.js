// Simple metrics collection in browser environment
// Track metrics in memory and periodically send to server

// Create local metrics storage
const metrics = {
  httpRequestDuration: [],
  httpRequestsTotal: {},
  apiRequestDuration: []
};

// Helper to get average duration
const getAverageDuration = (arr) => {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val.duration, 0);
  return sum / arr.length;
};

// Function to serialize metrics in Prometheus format
const serializeMetrics = () => {
  let output = '';
  
  // HTTP Request Duration
  output += '# HELP http_request_duration_seconds Duration of HTTP requests in seconds\n';
  output += '# TYPE http_request_duration_seconds histogram\n';
  
  const requestsByRoute = {};
  metrics.httpRequestDuration.forEach(req => {
    if (!requestsByRoute[req.route]) {
      requestsByRoute[req.route] = [];
    }
    requestsByRoute[req.route].push(req);
  });
  
  Object.entries(requestsByRoute).forEach(([route, requests]) => {
    const avg = getAverageDuration(requests);
    output += `http_request_duration_seconds{method="GET",route="${route}",status_code="200"} ${avg}\n`;
  });
  
  // HTTP Requests Total
  output += '# HELP http_request_total Total number of HTTP requests\n';
  output += '# TYPE http_request_total counter\n';
  
  Object.entries(metrics.httpRequestsTotal).forEach(([key, value]) => {
    const [method, route, status] = key.split('|');
    output += `http_request_total{method="${method}",route="${route}",status_code="${status}"} ${value}\n`;
  });
  
  // API Request Duration
  output += '# HELP api_request_duration_seconds Duration of API requests in seconds\n';
  output += '# TYPE api_request_duration_seconds histogram\n';
  
  const apiByEndpoint = {};
  metrics.apiRequestDuration.forEach(req => {
    if (!apiByEndpoint[req.endpoint]) {
      apiByEndpoint[req.endpoint] = [];
    }
    apiByEndpoint[req.endpoint].push(req);
  });
  
  Object.entries(apiByEndpoint).forEach(([endpoint, requests]) => {
    const avg = getAverageDuration(requests);
    output += `api_request_duration_seconds{endpoint="${endpoint}",status_code="${requests[0].status_code}"} ${avg}\n`;
  });
  
  return output;
};

// Middleware to track API requests
export const trackAPIRequest = async (endpoint, callback) => {
  const startTime = Date.now();
  try {
    const response = await callback();
    const duration = (Date.now() - startTime) / 1000;
    metrics.apiRequestDuration.push({ 
      endpoint, 
      status_code: response.status, 
      duration 
    });
    // Trim the array to prevent excessive memory usage
    if (metrics.apiRequestDuration.length > 100) {
      metrics.apiRequestDuration.shift();
    }
    return response;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    metrics.apiRequestDuration.push({ 
      endpoint, 
      status_code: error.status || 500, 
      duration 
    });
    // Trim the array to prevent excessive memory usage
    if (metrics.apiRequestDuration.length > 100) {
      metrics.apiRequestDuration.shift();
    }
    throw error;
  }
};

// Function to track page load time
export const trackPageLoad = (route) => {
  const start = performance.now();
  window.addEventListener('load', () => {
    const duration = (performance.now() - start) / 1000;
    metrics.httpRequestDuration.push({ 
      method: 'GET', 
      route, 
      status_code: 200, 
      duration 
    });
    
    // Trim the array to prevent excessive memory usage
    if (metrics.httpRequestDuration.length > 100) {
      metrics.httpRequestDuration.shift();
    }
    
    // Increment request counter
    const key = `GET|${route}|200`;
    metrics.httpRequestsTotal[key] = (metrics.httpRequestsTotal[key] || 0) + 1;
  });
};

// Function to expose metrics endpoint
export const setupMetricsEndpoint = () => {
  // In production or development, send metrics to a dedicated /metrics endpoint
  const sendMetricsToServer = () => {
    try {
      // Setup a timer to periodically send metrics to the server-side endpoint
      // This endpoint will be exposed by server.js for Prometheus to scrape
      fetch('/metrics-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: serializeMetrics()
        }),
      }).catch(err => console.error('Failed to send metrics:', err));
    } catch (error) {
      console.error('Error sending metrics:', error);
    }
  };

  // Send metrics every 10 seconds
  setInterval(sendMetricsToServer, 10000);
  
  // Send metrics on page load
  sendMetricsToServer();
  
  console.log('Frontend metrics are being sent to server-side endpoint');
};

export default {
  metrics,
  trackAPIRequest,
  trackPageLoad,
  setupMetricsEndpoint,
  serializeMetrics
}; 