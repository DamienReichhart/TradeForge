const express = require('express');
const path = require('path');
const cors = require('cors');
const os = require('os');

// Create Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Store the metrics data
let currentMetrics = '';

// Enable CORS for local development
app.use(cors());

// Parse JSON requests
app.use(express.json({ limit: '1mb' }));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Generate basic system metrics
function generateBasicMetrics() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const freemem = os.freemem();
  const totalmem = os.totalmem();
  
  return `# HELP process_uptime_seconds The uptime of the Node.js process in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime}

# HELP nodejs_heap_size_used_bytes Memory used in the Node.js heap in bytes
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes ${memoryUsage.heapUsed}

# HELP nodejs_heap_size_total_bytes Total memory available in the Node.js heap in bytes
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${memoryUsage.heapTotal}

# HELP system_memory_free_bytes Free memory in the system in bytes
# TYPE system_memory_free_bytes gauge
system_memory_free_bytes ${freemem}

# HELP system_memory_total_bytes Total memory in the system in bytes
# TYPE system_memory_total_bytes gauge
system_memory_total_bytes ${totalmem}`;
}

// Endpoint for the frontend to push metrics
app.post('/metrics-push', (req, res) => {
  try {
    const { metrics } = req.body;
    if (metrics) {
      currentMetrics = metrics;
      console.log('Metrics updated from client');
    }
    res.status(200).send({ status: 'success' });
  } catch (error) {
    console.error('Error handling metrics push:', error);
    res.status(500).send({ status: 'error', message: error.message });
  }
});

// Endpoint for Prometheus to scrape metrics
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  // Combine current metrics with basic system metrics
  const basicMetrics = generateBasicMetrics();
  const allMetrics = currentMetrics ? `${currentMetrics}\n${basicMetrics}` : basicMetrics;
  res.send(allMetrics);
});

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
}); 