module.exports = {
  HOST: "madm-prod.c65orlzm5dog.sa-east-1.rds.amazonaws.com",
  USER: "madm_admin",
  PASSWORD: "sH918GglRnOX",
  DB: "madm_prod",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}