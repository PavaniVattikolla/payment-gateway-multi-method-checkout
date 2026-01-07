require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./db');
const authMiddleware = require('./middleware');
const healthRoutes = require('./routes/health');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.use('/health', healthRoutes);

// Test endpoint (no auth required)
app.use('/api/v1/test', testRoutes);

// Protected routes
app.use('/api/v1/orders', authMiddleware, orderRoutes);
app.use('/api/v1/payments', authMiddleware, paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      description: 'An internal server error occurred'
    }
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Payment Gateway API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
