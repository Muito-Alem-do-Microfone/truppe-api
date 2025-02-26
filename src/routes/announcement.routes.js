import express from "express";
import { announcementController } from "../controllers/index.js";
import "./docs/announcementSwagger.js";

const {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  getAnnouncements,
} = announcementController;

const router = express.Router();

export default (app) => {
  router.post("/", createAnnouncement);
  router.delete("/:id", deleteAnnouncement);
  router.put("/:id", updateAnnouncement);
  router.get("/", getAnnouncements);

  app.use("/api/announcement", router);
};
