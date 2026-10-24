require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "Afnog@#1",
        database: process.env.DB_NAME || "filegate-database",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: process.env.DB_DIALECT || "mysql",
        logging: process.env.NODE_ENV == "development",
    },
    test: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "database_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: process.env.DB_DIALECT || "mysql",
    },
    production: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "Afnog@#1",
        database: process.env.DB_NAME || "b2",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: process.env.DB_DIALECT || "mysql",
        logging: process.env.NODE_ENV == "development",
        
    },
};
