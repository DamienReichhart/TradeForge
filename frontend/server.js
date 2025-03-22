const express = require('express');
const path = require('path');
const cors = require('cors');

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
  res.send(currentMetrics || '# No metrics collected yet');
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