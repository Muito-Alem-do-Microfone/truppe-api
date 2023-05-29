const groups = require("../controllers/group.controller.js")
const { validateJWT } = require('../middlewares/user.middleware.js')

var router = require("express").Router()

module.exports = app => {

  router.post("/create", validateJWT, groups.create)
  router.get("/", validateJWT, groups.findAll)
  router.get("/:id", validateJWT, groups.findOne)
  router.put("/:id", validateJWT, groups.update)
  router.delete("/:id", validateJWT, groups.deleteGroup)
  router.post("/changeMember/:id", validateJWT, groups.changeMember)

  app.use('/api/groups', router)
};