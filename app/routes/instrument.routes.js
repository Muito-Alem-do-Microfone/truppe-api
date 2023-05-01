module.exports = app => {
  const instruments = require("../controllers/instrument.controller.js")
  var router = require("express").Router()

  router.post("/", instruments.findAll)
  router.post("/:name", instruments.findByName)

  app.use('/api/instruments', router)
};