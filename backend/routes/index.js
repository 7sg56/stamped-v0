const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const eventRoutes = require('./events');
const registrationRoutes = require('./registrations');
const attendanceRoutes = require('./attendance');
const dashboardRoutes = require('./dashboard');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection status
    const dbStatus = mongoose.connection.readyState;
    const dbStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Get database connection details
    const dbInfo = {
      status: dbStatusMap[dbStatus] || 'unknown',
      readyState: dbStatus
    };

    // Perform a simple database operation to verify connectivity
    let dbHealthy = false;
    let dbError = null;
    
    if (dbStatus === 1) {
      try {
        // Simple ping to verify database is responsive
        await mongoose.connection.db.admin().ping();
        dbHealthy = true;
      } catch (error) {
        dbError = 'Database connectivity check failed';
      }
    }

    // Determine overall health status
    const isHealthy = dbHealthy && dbStatus === 1;
    const httpStatus = isHealthy ? 200 : 503;

    const healthResponse = {
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'unhealthy',
      message: 'Stamped Event Management API Health Check',
      timestamp: new Date().toISOString(),
      database: {
        ...dbInfo,
        healthy: dbHealthy,
        error: dbError
      },
      services: {
        api: 'operational',
        database: dbHealthy ? 'operational' : 'degraded'
      }
    };

    res.status(httpStatus).json(healthResponse);
  } catch (error) {
    // Handle any unexpected errors in health check
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      database: {
        status: 'unknown',
        healthy: false,
        error: 'Health check error'
      }
    });
  }
});

// API routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;