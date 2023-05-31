const instruments = require("../controllers/instrument.controller.js")
const { validateJWT } = require('../middlewares/auth.middleware.js')

var router = require("express").Router()

module.exports = app => {
  router.post("/", instruments.findAll)
  router.post("/:name", instruments.findByName)

  app.use('/api/instruments', router)
};