const mongoose = require('mongoose');
const ErrorResponse = require('./errorResponse');

/**
 * Validation utility functions
 */
class ValidationUtils {
  /**
   * Validate MongoDB ObjectId
   * @param {string} id - The ID to validate
   * @param {string} fieldName - Name of the field for error message
   * @throws {ErrorResponse} - If ID is invalid
   */
  static validateObjectId(id, fieldName = 'ID') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse(`Invalid ${fieldName}`, 400);
    }
  }

  /**
   * Validate required fields
   * @param {Object} data - Data object to validate
   * @param {Array} requiredFields - Array of required field names
   * @throws {ErrorResponse} - If any required field is missing
   */
  static validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      const errors = missingFields.map(field => ({
        field,
        message: `${field} is required`
      }));
      
      throw new ErrorResponse('Validation failed', 400, errors);
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @throws {ErrorResponse} - If email format is invalid
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ErrorResponse('Invalid email format', 400);
    }
  }

  /**
   * Validate date
   * @param {string|Date} date - Date to validate
   * @param {string} fieldName - Name of the field for error message
   * @throws {ErrorResponse} - If date is invalid
   */
  static validateDate(date, fieldName = 'date') {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new ErrorResponse(`Invalid ${fieldName} format`, 400);
    }
    return parsedDate;
  }

  /**
   * Validate that a date is in the future
   * @param {string|Date} date - Date to validate
   * @param {string} fieldName - Name of the field for error message
   * @throws {ErrorResponse} - If date is in the past
   */
  static validateFutureDate(date, fieldName = 'date') {
    const parsedDate = this.validateDate(date, fieldName);
    const now = new Date();
    
    if (parsedDate <= now) {
      throw new ErrorResponse(`${fieldName} must be in the future`, 400);
    }
    
    return parsedDate;
  }

  /**
   * Validate numeric value
   * @param {any} value - Value to validate
   * @param {string} fieldName - Name of the field for error message
   * @param {Object} options - Validation options (min, max)
   * @throws {ErrorResponse} - If value is invalid
   */
  static validateNumber(value, fieldName, options = {}) {
    const num = Number(value);
    
    if (isNaN(num)) {
      throw new ErrorResponse(`${fieldName} must be a valid number`, 400);
    }

    if (options.min !== undefined && num < options.min) {
      throw new ErrorResponse(`${fieldName} must be at least ${options.min}`, 400);
    }

    if (options.max !== undefined && num > options.max) {
      throw new ErrorResponse(`${fieldName} must be at most ${options.max}`, 400);
    }

    return num;
  }

  /**
   * Validate string length
   * @param {string} value - String to validate
   * @param {string} fieldName - Name of the field for error message
   * @param {Object} options - Validation options (min, max)
   * @throws {ErrorResponse} - If string length is invalid
   */
  static validateStringLength(value, fieldName, options = {}) {
    if (typeof value !== 'string') {
      throw new ErrorResponse(`${fieldName} must be a string`, 400);
    }

    const trimmedValue = value.trim();

    if (options.min !== undefined && trimmedValue.length < options.min) {
      throw new ErrorResponse(`${fieldName} must be at least ${options.min} characters long`, 400);
    }

    if (options.max !== undefined && trimmedValue.length > options.max) {
      throw new ErrorResponse(`${fieldName} must be at most ${options.max} characters long`, 400);
    }

    return trimmedValue;
  }

  /**
   * Sanitize input data by trimming strings and removing empty values
   * @param {Object} data - Data to sanitize
   * @returns {Object} - Sanitized data
   */
  static sanitizeInput(data) {
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed !== '') {
          sanitized[key] = trimmed;
        }
      } else if (value !== null && value !== undefined) {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}

module.exports = ValidationUtils;