module.exports = app => {
  const groups = require("../controllers/group.controller.js")
  var router = require("express").Router()

  router.post("/create", groups.create)
  router.get("/", groups.findAll)
  router.get("/:id", groups.findOne)
  router.put("/:id", groups.update)
  router.delete("/:id", groups.deleteGroup)
  router.post("/changeMember/:id", groups.changeMember)

  app.use('/api/groups', router)
};