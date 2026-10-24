const dotenv = require('dotenv');
dotenv.config();

// Import ansis for colored logging (CommonJS compatible, zero dependencies)
const { red, green, blue, yellow, cyan, gray, bold, underline } = require('ansis');

const env = require('./config/env');
const app = require('./app');
const db = require('./database/models');

// Custom logger with colors using ansis
const logger = {
  ok: (msg) => console.log(green('[OK]') + ' ' + msg),
  info: (msg) => console.log(blue('[INFO]') + ' ' + msg),
  error: (msg, err) => {
    console.error(red('[ERROR]') + ' ' + msg);
    if (err) console.error(red(err));
  },
  warn: (msg) => console.log(yellow('[WARN]') + ' ' + msg),
  success: (msg) => console.log(green.bold('[SUCCESS]') + ' ' + msg),
  divider: () => console.log(gray('─'.repeat(60)))
};

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('');
    logger.ok('Database connection established.');

    // DB_SYNC defaults to false if not set
    const dbSync = process.env.DB_SYNC !== undefined ? process.env.DB_SYNC : false;
    const dbSyncAlter = process.env.DB_SYNC_ALTER !== undefined ?process.env.DB_SYNC_ALTER : false;

    if (dbSync) {
      // Dev-only convenience until real migrations exist (per plan: models first).
      await db.sequelize.sync({ alter: dbSyncAlter });
      console.log('');
      logger.success(`Models synced${dbSyncAlter ? ' (alter mode)' : ''}.`);
      console.log('');
    }

    // Use PORT from env or fallback to 8000
    const port = process.env.PORT || 8000;

    app.listen(port, () => {
      logger.divider();
      logger.info('Fees-Microservice listening on port ' + yellow(port));
      logger.info('Environment: ' + cyan(process.env.NODE_ENV || 'development'));
      logger.info('API: ' + underline('http://localhost:' + port + '/api'));
      logger.info('Health: ' + underline('http://localhost:' + port + '/health'));
      logger.divider();
      console.log('');
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.warn('SIGTERM received, shutting down gracefully...');
  await db.sequelize.close();
  logger.ok('Database connection closed.');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.warn('SIGINT received, shutting down gracefully...');
  await db.sequelize.close();
  logger.ok('Database connection closed.');
  process.exit(0);
});

start();