module.exports = app => {
  const users = require("../controllers/user.controller.js")

  var router = require("express").Router()

  router.post("/create", users.create)
  router.get("/", users.findAll)
  router.get("/:id", users.findOne)
  router.put("/:id", users.update)
  router.delete("/:id", users.deleteUser)
  router.post("/follow/:id", users.follow)

  app.use('/api/users', router)
};