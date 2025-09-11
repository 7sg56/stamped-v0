/**
 * Admin Authorization Middleware
 * Ensures authenticated user has admin privileges
 * Note: This middleware should be used AFTER the auth middleware
 */
const isAdmin = (req, res, next) => {
  try {
    // Check if user was authenticated by the auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    // Check if admin object exists (set by auth middleware)
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Verify admin object has required properties
    if (!req.admin._id || !req.admin.username) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Invalid admin credentials.'
      });
    }

    // All checks passed, user has admin privileges
    next();
  } catch (error) {
    console.error('Admin authorization middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authorization.'
    });
  }
};

module.exports = isAdmin;
