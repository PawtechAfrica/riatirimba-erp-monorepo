require('dotenv').config()

module.exports = {
  development: {
    username: process.env.VOUCHER_DB_USERNAME || 'postgres',
    password: process.env.VOUCHER_DB_PASSWORD,
    database: process.env.VOUCHER_DB_NAME || 'voucher',
    host: process.env.VOUCHER_DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  },

  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME_TEST || 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },

  production: {
    username: process.env.VOUCHER_DB_USERNAME,
    password: process.env.VOUCHER_DB_PASSWORD,
    database: process.env.VOUCHER_DB_NAME,
    host: process.env.VOUCHER_DB_HOST,
    dialect: 'postgres',
    logging: console.log
  }
}
