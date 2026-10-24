// const dotenv = require('dotenv')
// dotenv.config()

// // Core Imports
// const express = require('express')
// const cors = require('cors')

// //Database Connection
// const db = require('../Database/models')

// //Initialize App
// const app = express()
// const PORT = Number(process.env.PORT) || 3000

// // Route Imports
// const apiRoutes = require('./routes/aggregator')

// // Global Middlewares
// const corsOptions = {
//   origin: '*'
// }
// app.use(cors(corsOptions))
// app.use(express.json())

// app.use('/api', apiRoutes)

// // DB Connection + Server Start
// db.sequelize
//   .authenticate()
//   .then(() => {
//     console.log('✅ Database connected')

//     return db.sequelize
//       .sync
//       /* { force: true }
//         { alter: true }*/
//       ()
//   })
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`)
//     })
//   })
//   .catch(err => {
//     console.error('❌ Failed to connect to the database:', err)
//   })

const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const db = require('../Database/models')

const app = express()
const PORT = Number(process.env.ACADEMICS_PORT) || 3000

// ---- retry config (env-overridable) ----
const MAX_RETRIES = Number(process.env.DB_MAX_RETRIES ?? 20) // how many times to try before exiting
const BASE_DELAY_MS = Number(process.env.DB_RETRY_BASE_MS ?? 1000) // first backoff step
const MAX_DELAY_MS = Number(process.env.DB_RETRY_MAX_MS ?? 30000) // cap the delay

// Routes
const apiRoutes = require('./routes/aggregator')
const verifyJWT = require('./middlwares/verifyJWT')

// Middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }))
}

app.use(express.json())
app.use('/api', apiRoutes)
app.use(morgan('dev'))
app.get('/', (req, res) => {
    res.json({
        success_message: 'ACADEMICS SERVER IS ACTIVE'
    })
})

app.get('/api', (req, res) => {
    res.json({message: 'Hello from Academics Service!'})
})

// app.get(
//   '/admin-panel',
//   verifyJWT(['view_users', 'edit_users', 'view_roles']),
//   (req, res) => {
//     // console.log('[Route] /registrar-only accessed')
//     console.log(req.user)
//     res.send('ACCEPTED')
//   }
// )
// http://localhost:4000/api/users
// http://localhost:4000/auth/login

// Helper
const sleep = ms => new Promise(res => setTimeout(res, ms))

async function connectWithRetry(attempt = 1) {
    try {
        console.log(
            `🔌 Trying to connect to DB (attempt ${attempt}/${MAX_RETRIES || '∞'})`
        )
        await db.sequelize.authenticate()
        console.log('✅ Database connected')

        await db.sequelize.sync() // add { alter: true } or { force: true } if you really need it
        console.log('🔄 Models synced')

        return // success!
    } catch (err) {
        if (MAX_RETRIES && attempt >= MAX_RETRIES) {
            console.error(
                `❌ Failed to connect after ${attempt} attempts. Giving up.`
            )
            console.error(err)
            process.exit(1)
        }

        const delay =
            Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS) +
            Math.floor(Math.random() * 1000) // jitter
        console.error(
            `❌ DB connection failed (attempt ${attempt}). Retrying in ${delay} ms…`,
            err.message
        )
        await sleep(delay)
        return connectWithRetry(attempt + 1)
    }
}

;(async () => {
    await connectWithRetry()
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`)
    })
})()

// Graceful shutdown (optional, but nice in Docker/K8s)
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, closing DB connection…')
    try {
        await db.sequelize.close()
    } finally {
        process.exit(0)
    }
})
