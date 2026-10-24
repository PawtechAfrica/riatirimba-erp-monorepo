require("dotenv").config();

module.exports = {
    development: {
        username: process.env.ACADEMICS_DB_USER,
        password: process.env.ACADEMICS_DB_PASSWORD,
        database: process.env.ACADEMICS_DB_NAME,
        host: process.env.ACADEMICS_DB_HOST,
        port: process.env.ACADEMICS_DB_PORT,
        dialect: "postgres",
        logging: true,
    },
    test: {
        username: "test_user",
        password: "test_pass",
        database: "academics_test_db",
        host: "127.0.0.1",
        port: 5432,
        dialect: "postgres",
    },
    production: {
        username: process.env.ACADEMICS_DB_USER,
        password: process.env.ACADEMICS_DB_PASSWORD,
        database: process.env.ACADEMICS_DB_NAME,
        host: process.env.ACADEMICS_DB_HOST,
        port: process.env.ACADEMICS_DB_PORT,
        dialect: "postgres",
        logging: false,
    },
};
