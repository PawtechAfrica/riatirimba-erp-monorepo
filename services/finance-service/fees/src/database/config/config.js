const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

require('dotenv').config();

module.exports = {
    development: {
        username: process.env.FEES_DB_USER || "postgres",
        password: process.env.FEES_DB_PASSWORD || "postgres",
        database: process.env.FEES_DB_NAME || "riatirimba_finance",
        host: process.env.FEES_DB_HOST || "127.0.0.1",
        port: parseInt(process.env.FEES_DB_PORT, 10) || 5432,
        dialect: "postgres",
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    test: {
        username: process.env.TEST_DB_USER || "postgres",
        password: process.env.TEST_DB_PASSWORD || "postgres",
        database: process.env.TEST_DB_NAME || "riatirimba_finance",
        host: process.env.TEST_DB_HOST || "127.0.0.1",
        port: parseInt(process.env.TEST_DB_PORT, 10) || 5432,
        dialect: "postgres",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    production: {
        username: process.env.FEES_DB_USER || 'postgres',
        password: process.env.FEES_DB_PASSWORD || 'Afnog@#1',
        database: process.env.FEES_DB_NAME || 'fees_db',
        host: process.env.FEES_DB_HOST || 'fees-database',
        port: parseInt(process.env.FEES_DB_PORT, 10) || 5432,
        dialect: "postgres",
        logging: false,
        pool: {
            max: 20,
            min: 2,
            acquire: 60000,
            idle: 10000,
        },

    },
};
