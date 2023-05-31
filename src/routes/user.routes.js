const users = require("../controllers/user.controller.js")
const { validateJWT } = require('../middlewares/auth.middleware.js')

var router = require("express").Router()

module.exports = app => {

  router.post("/create", users.create)
  router.get("/", validateJWT, users.findAll)
  router.get("/:id", validateJWT, users.findOne)
  router.put("/:id", validateJWT, users.update)
  router.delete("/:id", validateJWT, users.deleteUser)
  router.post("/follow/:id", validateJWT, users.follow)
  router.post("/changeInstrument/:id", validateJWT, users.changeInstrument)

  app.use('/api/users', router)
};