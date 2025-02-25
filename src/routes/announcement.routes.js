import express from "express";
import {
  deleteAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  createAnnouncement,
} from "../controllers/announcement.controller.js";

const router = express.Router();

export default (app) => {
  router.post("/", createAnnouncement);
  router.delete("/:id", deleteAnnouncement);
  router.put("/:id", updateAnnouncement);
  router.get("/", getAnnouncements);

  app.use("/api/announcements", router);
};
