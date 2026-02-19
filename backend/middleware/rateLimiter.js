const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter to prevent abuse and DoS attacks.
 * Applies to all routes.
 * Limit: 100 requests per 15 minutes.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7', // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

/**
 * Stricter rate limiter for authentication endpoints (login, register).
 * Prevents brute-force attacks.
 * Limit: 5 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};
