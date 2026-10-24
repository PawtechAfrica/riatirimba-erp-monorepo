// // src/config/database.js
// // Single Sequelize instance shared by every model.

// const { Sequelize } = require('sequelize');
// const env = require('./env');

// const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
//   host: env.DB_HOST,
//   port: env.DB_PORT,
//     dialect: env.DB_DIALECT,
//   logging: console.log,// env.DB_LOGGING ? console.log : false,
//   define: {
//     underscored: true, // camelCase in JS <-> snake_case in Postgres, matches the spec's DDL
//     freezeTableName: false,
//   },
//   dialectOptions: env.DB_SSL
//     ? {
//         ssl: {
//           require: true,
//           rejectUnauthorized: false,
//         },
//       }
//     : {},
// });

// module.exports = sequelize;
