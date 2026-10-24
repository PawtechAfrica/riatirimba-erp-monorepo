// const morgan = require('morgan')
// const fs = require('fs')
// const path = require('path')
// const env = require('../config/env')

// // Ensure logs directory exists
// const logDir = path.join(__dirname, '../../logs')
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir, { recursive: true })
// }

// // Simple console logger
// const logger = {
//   info: (...args) => console.log('[INFO]', ...args),
//   error: (...args) => console.error('[ERROR]', ...args),
//   warn: (...args) => console.warn('[WARN]', ...args),
//   debug: (...args) => console.debug('[DEBUG]', ...args)
// }

// // Create write streams for log files
// const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), {
//   flags: 'a'
// })

// const errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), {
//   flags: 'a'
// })

// // Morgan for console (development)
// const morganConsole = morgan('dev', {
//   skip: req => req.url === '/health' || req.url === '/api/health'
// })

// // Morgan for file (production)
// const morganFile = morgan('combined', {
//   stream: accessLogStream,
//   skip: req => req.url === '/health' || req.url === '/api/health'
// })

// // Morgan for error logging
// const morganError = morgan('combined', {
//   stream: errorLogStream,
//   skip: (req, res) => res.statusCode < 400
// })

// // Morgan for JSON format (for API monitoring)
// const morganJson = morgan(
//   (tokens, req, res) => {
//     return JSON.stringify({
//       timestamp: new Date().toISOString(),
//       method: tokens.method(req, res),
//       url: tokens.url(req, res),
//       status: tokens.status(req, res),
//       responseTime: tokens['response-time'](req, res),
//       contentLength: tokens.res(req, res, 'content-length'),
//       userAgent: tokens['user-agent'](req, res),
//       ip: tokens['remote-addr'](req, res)
//     })
//   },
//   {
//     skip: req => req.url === '/health' || req.url === '/api/health'
//   }
// )

// // Select middleware based on environment
// const getMorganMiddleware = () => {
//   if (env.NODE_ENV === 'development') {
//     return morganConsole
//   }
//   return [morganFile, morganJson]
// }

// module.exports = {
//   logger,
//   morganConsole,
//   morganFile,
//   morganError,
//   morganJson,
//   getMorganMiddleware
// }





const morgan = require('morgan');
const env = require('../config/env');

// Simple console logger
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  debug: (...args) => console.debug('[DEBUG]', ...args),
};

// Morgan middleware for development
const morganMiddleware = morgan('dev', {
  skip: (req) => req.url === '/health' || req.url === '/api/health',
});

// Morgan middleware for production (JSON format)
const morganJsonMiddleware = morgan((tokens, req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    userAgent: tokens['user-agent'](req, res),
    ip: tokens['remote-addr'](req, res),
  });
}, {
  skip: (req) => req.url === '/health' || req.url === '/api/health',
});

module.exports = {
  logger,
  morganMiddleware,
  morganJsonMiddleware,
};