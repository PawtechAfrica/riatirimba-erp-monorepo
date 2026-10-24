// require('dotenv').config()

// const express = require('express')
// const cors = require('cors')
// const path = require('path')

// const db = require('./database/models')
// const sequelize = db.sequelize

// require('./database/models/Vouchers')

// const voucherRoutes = require('./routes/voucher')
// const voteheadRoutes = require('./routes/voteheads.routes')

// // Import error handlers
// const { 
//   globalErrorHandler, 
//   notFoundHandler 
// } = require('./middlewares/errorHandler')

// const app = express()
// const PORT = process.env.PORT || 3000

// // ─── Middleware ──────────────────────────────────────────────────────────────

// // CORS
// if (process.env.NODE_ENV === 'development') {
//   app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
// } else {
//   app.use(cors()) // Allow all in production or configure as needed
// }

// // Body parsing
// app.use(express.json({ limit: '10mb' }))
// app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// // Static frontend
// app.use(express.static(path.join(__dirname, './frontend')))

// // Optional: Request logging (useful for debugging)
// if (process.env.NODE_ENV === 'development') {
//   const morgan = require('morgan')
//   app.use(morgan('dev'))
// }

// // Optional: Security headers (uncomment if needed)
// // const helmet = require('helmet')
// // app.use(helmet())

// // ─── Routes ──────────────────────────────────────────────────────────────────

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV,
//     service: 'Voucher Service'
//   })
// })

// // API Routes
// app.use('/api/vouchers', voucherRoutes)
// app.use('/api/voteheads', voteheadRoutes)

// // ─── Error Handlers ──────────────────────────────────────────────────────────

// // 404 Not Found handler - MUST be after all routes
// app.use(notFoundHandler)

// // Global error handler - MUST be the LAST middleware
// app.use(globalErrorHandler)

// // ─── Database + Server Start ────────────────────────────────────────────────

// async function startServer() {
//   try {
//     await sequelize.authenticate()
//     console.log('✅ Database connection established')

//     await sequelize.sync({ alter: false })
//     console.log('✅ Database synced')

//     app.listen(PORT, () => {
//       console.log(' ')
//       console.log(`🚀 Voucher server running → http://localhost:${PORT}`)
//       console.log(`📚 Environment: ${process.env.NODE_ENV}`)
//       console.log(`📖 API Docs: http://localhost:${PORT}/api/vouchers`)
//       console.log(' ')
//     })
//   } catch (err) {
//     console.error('❌ DB or Server error:', err)
//     process.exit(1)
//   }
// }

// // 2aef8d4

// // voucher scheduler
// // require('./backup/scripts/scheduler');

// // const { startVoucherWatcher } = require ('./backup/hooks/voucherWatcher');
// // 
// // startVoucherWatcher();



// startServer()

// // ─── Graceful Shutdown ───────────────────────────────────────────────────────

// process.on('SIGTERM', async () => {
//   console.log('🛑 SIGTERM received. Closing server gracefully...')
//   process.exit(0)
// })

// process.on('SIGINT', async () => {
//   console.log('🛑 SIGINT received. Closing server gracefully...')
//   process.exit(0)
// })

// module.exports = app

































require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

const db = require('./database/models')
const sequelize = db.sequelize

const voucherRoutes = require('./routes/voucher')
const voteheadRoutes = require('./routes/voteheads.routes')

// Import error handlers
const {
  globalErrorHandler,
  notFoundHandler
} = require('./middlewares/errorHandler')

const app = express()
const PORT = process.env.PORT || 3000

// ─── Middleware ──────────────────────────────────────────────────────────────

// CORS
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
} else {
  app.use(cors()) // Allow all in production or configure as needed
}

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static frontend
app.use(express.static(path.join(__dirname, './frontend')))

// Optional: Request logging (useful for debugging)
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan')
  app.use(morgan('dev'))
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'Voucher Service'
  })
})

// API Routes
app.use('/api/vouchers', voucherRoutes)
app.use('/api/voteheads', voteheadRoutes)

// ─── Error Handlers ──────────────────────────────────────────────────────────

// 404 Not Found handler - MUST be after all routes
app.use(notFoundHandler)

// Global error handler - MUST be the LAST middleware
app.use(globalErrorHandler)

// ─── Database + Server Start ────────────────────────────────────────────────

async function startServer () {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established')

    await sequelize.sync({ alter: false })
    console.log('✅ Database synced')

    app.listen(PORT, () => {
      console.log(' ')
      console.log(`🚀 Voucher server running → http://localhost:${PORT}`)
      console.log(`📚 Environment: ${process.env.NODE_ENV}`)
      console.log(`📖 API Docs: http://localhost:${PORT}/api/vouchers`)
      console.log(' ')
    })
  } catch (err) {
    console.error('❌ DB or Server error:', err)
    process.exit(1)
  }
}
console.log('vv')
startServer()

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Closing server gracefully...')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Closing server gracefully...')
  process.exit(0)
})

module.exports = app