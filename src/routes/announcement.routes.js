const announcements = require("../controllers/announcement.controller.js")
const { validateJWT } = require('../middlewares/auth.middleware.js')

var router = require("express").Router()

module.exports = app => {

  router.post("/create", validateJWT, announcements.create)
  router.delete("/:id", validateJWT, announcements.deleteAnnouncement)
  router.put("/:id", validateJWT, announcements.updateAnnouncement)
  router.get("/search", validateJWT, announcements.searchWithinRange)

  app.use('/api/announcements', router)
};