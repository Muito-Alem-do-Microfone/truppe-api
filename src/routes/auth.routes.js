const auth = require("../controllers/auth.controller.js")
const { validateJWT } = require('../middlewares/user.middleware.js')

var router = require("express").Router()

module.exports = app => {
  router.post("/", auth.login)

  app.use('/api/auth', router)
};