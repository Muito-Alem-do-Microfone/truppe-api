const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  development: {
    username: 'postgres',
    password: 'senha123',
    database: 'madm',
    host: 'localhost',
    port: 8001,
    dialect: 'postgresql',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgresql',
  }
};