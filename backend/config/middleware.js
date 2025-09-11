const express = require("express");
const cors = require("cors");
const {
  requestLogger,
  performanceMonitor,
  requestId,
} = require("../middleware/requestLogger");

const setupMiddleware = (app) => {
  
  // Trust proxy for local development
  app.set('trust proxy', 1);

  // Request ID for tracing (should be first)
  app.use(requestId);

  // Request logging middleware
  app.use(requestLogger);

  // Performance monitoring
  app.use(performanceMonitor);


  // CORS configuration: allow all origins for testing
  const corsOptions = {
    origin: (origin, callback) => {
      console.log('CORS request from origin:', origin);
      callback(null, true); // Allow all origins
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID']
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.removeHeader('X-Powered-By');
    next();
  });



  // Request timeout (simplified for local development)
  app.use((req, res, next) => {
    req.setTimeout(30000); // 30 seconds
    next();
  });

  // Health check endpoint (before other middleware)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV
    });
  });
};

module.exports = setupMiddleware;
