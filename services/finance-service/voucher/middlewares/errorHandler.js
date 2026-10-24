// middlewares/errorHandler.js

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Custom AppError class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode = 400, name = 'Application Error') {
    super(message)
    this.name = name
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Global error handler middleware
 */
// middlewares/errorHandler.js

const globalErrorHandler = (err, req, res, next) => {
  // Log the error with stack trace for debugging
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    user: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params
  })

  // Handle Sequelize Validation Error - Enhanced
  if (err.name === 'SequelizeValidationError') {
    const validationErrors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value,
      validator: e.validatorKey,
      type: e.type
    }))

    // Provide more helpful messages
    const fieldMessages = validationErrors.reduce((acc, curr) => {
      acc[curr.field] = curr.message
      return acc
    }, {})

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid data provided. Please check the following fields:',
      details: validationErrors,
      fields: fieldMessages,
      // Helpful hints for common validation errors
      hints: {
        voucherNo: 'Voucher number cannot be empty',
        amountInWords: 'Amount in words cannot be empty - this is auto-generated from line items',
        receivedSum: 'Received sum cannot be empty - this is auto-generated from line items',
        payeeName: 'Payee name is required',
        date: 'Date is required'
      }
    })
  }

  // Handle Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'Duplicate entry found',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    })
  }

  // Handle Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'Reference Error',
      message: 'Cannot perform operation due to existing references',
      details: err.message
    })
  }

  // Handle JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication Error',
      message: 'Invalid token provided'
    })
  }

  // Handle JWT Token Expired Error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication Error',
      message: 'Token has expired. Please login again.'
    })
  }

  // Handle PDF Generation Errors
  if (err.message && (err.message.includes('PDF') || err.message.includes('pdf'))) {
    return res.status(500).json({
      success: false,
      error: 'PDF Generation Error',
      message: 'Failed to generate PDF document. Please try again.'
    })
  }

  // Handle Custom Application Errors (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: err.name || 'Application Error',
      message: err.message
    })
  }

  // Default Internal Server Error
  const statusCode = err.statusCode || 500
  const response = {
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  }

  // Include stack trace only in development environment
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
    response.details = err.details || null
  }

  res.status(statusCode).json(response)
}
/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      '/health': 'GET - Health check',
      '/api/vouchers': 'GET - List all vouchers, POST - Create voucher',
      '/api/vouchers/:id': 'GET - Get voucher, PUT - Update voucher, DELETE - Delete voucher',
      '/api/vouchers/:id/pdf': 'GET - Download voucher PDF',
      '/api/vouchers/batch': 'POST - Create batch vouchers',
      '/api/vouchers/batch-pdf': 'POST - Download batch PDF'
    }
  })
}

module.exports = {
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  AppError
}