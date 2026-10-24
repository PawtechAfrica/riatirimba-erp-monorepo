require('dotenv').config()

module.exports = {
  development: {
    username: process.env.AUTH_DB_USERNAME || 'postgres',
    password: process.env.AUTH_DB_PASSWORD || 'Afnog@#1',
    database: process.env.AUTH_DB_NAME || 'auth-db',
    host: process.env.AUTH_DB_HOST || 'auth-database',
    dialect: process.env.AUTH_DB_DIALECT || 'postgres',
    logging: false
  },
  

  test: {
    username: process.env.AUTH_DB_USERNAME || 'postgres',
    password: process.env.AUTH_DB_PASSWORD || 'Afnog@#1',
    database: process.env.AUTH_DB_NAME || 'auth-db',
    host: process.env.AUTH_DB_HOST || 'auth-database',
    dialect: process.env.AUTH_DB_DIALECT || 'postgres'
  },
  
  production: {
    username: process.env.AUTH_DB_USERNAME || 'postgres',
    password: process.env.AUTH_DB_PASSWORD || 'Afnog@#1',
    database: process.env.AUTH_DB_NAME || 'auth-db',
    host: process.env.AUTH_DB_HOST || 'auth-database',
    dialect: process.env.AUTH_DB_DIALECT || 'postgres'
  }
}
