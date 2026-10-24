const { logger } = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`[${err.code || 'UNKNOWN'}] ${err.message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation failed';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
    message = 'Duplicate record found';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    code = 'FOREIGN_KEY_ERROR';
    message = 'Referenced record does not exist';
  }

  if (err.message && err.message.includes('not found')) {
    statusCode = 404;
    code = 'NOT_FOUND';
  }

  if (err.message && err.message.includes('No active fee structure found')) {
    statusCode = 404;
    code = 'FEE_STRUCTURE_NOT_FOUND';
  }

  if (err.message && err.message.includes('Programme') && err.message.includes('not found')) {
    statusCode = 404;
    code = 'PROGRAMME_NOT_FOUND';
  }

  if (err.message && err.message.includes('Invalid obligation')) {
    statusCode = 404;
    code = 'OBLIGATION_NOT_FOUND';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    code: code,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler for routes not found
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.method} ${req.url} not found`, 'ROUTE_NOT_FOUND');
  next(error);
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
};