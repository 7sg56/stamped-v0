const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * JWT Authentication Middleware
 * Validates JWT tokens from Authorization header and attaches admin user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization header provided.'
      });
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid authorization header format.'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 JWT decoded:', decoded);
    
    // Fetch admin user from database to ensure they still exist
    const admin = await Admin.findById(decoded.id);
    console.log('🔍 Admin from DB:', admin ? 'Found' : 'Not found');
    if (admin) {
      console.log('🔍 Admin role from DB:', admin.role);
      console.log('🔍 Admin object keys:', Object.keys(admin.toObject()));
      console.log('🔍 Admin raw object:', admin.toObject());
    }
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin user not found.'
      });
    }

    // Attach admin user to request object
    console.log('🔍 Setting req.user with role:', admin.role);
    console.log('🔍 isSuperAdmin result:', admin.isSuperAdmin());
    
    req.user = {
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
      isSuperAdmin: admin.isSuperAdmin(),
      createdAt: admin.createdAt
    };
    req.admin = admin; // Also attach full admin object for backward compatibility
    
    console.log('🔍 Final req.user:', req.user);
    
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token not active yet.'
      });
    }

    // Handle database errors
    if (error.name === 'CastError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // Generic error for unexpected issues
    console.error('Authentication middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication failed.'
    });
  }
};

module.exports = verifyToken;
