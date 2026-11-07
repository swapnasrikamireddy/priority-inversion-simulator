const express = require('express');
const cors = require('cors');
const simulationRoutes = require('./routes/simulation');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/simulation', simulationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Priority Sim Backend Running' });
});

// Global error handler — ensures every error returns JSON, never empty body
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
