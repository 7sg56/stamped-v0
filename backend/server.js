require("dotenv").config({ path: "../.env" });
const express = require("express");
const connectDB = require("./config/db");
const setupMiddleware = require("./config/middleware");
const apiRoutes = require("./routes");
const { runSeeds } = require("./seed/adminSeeder");
const errorHandler = require("./middleware/errorHandler");
const { errorLogger } = require("./middleware/requestLogger");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

// Run database seeds (non-blocking)
runSeeds().catch((error) => {
  console.warn("Seeding failed during startup:", error.message);
  console.log("Server will continue to start normally");
});

// Setup middleware
setupMiddleware(app);

// API routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Stamped Event Management & Attendance System API",
    version: "2.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      events: "/api/events",
      registrations: "/api/registrations",
      attendance: "/api/attendance",
      export: "/api/export",
    },
  });
});

// 404 handler with logging
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

// Error logging middleware (before error handler)
app.use(errorLogger);

// Global error handler (must be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("🚀 STAMPED Event Management System Backend");
  console.log("=".repeat(50));
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log("=".repeat(50));
  console.log("✅ Server initialization complete");
});
