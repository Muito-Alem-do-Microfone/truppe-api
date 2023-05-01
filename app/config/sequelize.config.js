module.exports = {
  development: {
    username: 'dev',
    password: 'senha123',
    database: 'madm_dev',
    host: '172.19.8.141',
    port: 5432,
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