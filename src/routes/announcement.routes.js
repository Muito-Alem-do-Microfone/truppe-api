import express from "express";
import { announcementController } from "../controllers/index.js";
import { upload } from "../middlewares/upload.js";

const {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  getAnnouncementById,
} = announcementController;

const router = express.Router();

export default (app) => {
  router.post("/", upload.single("image"), createAnnouncement);
  router.delete("/:id", deleteAnnouncement);
  router.put("/:id", updateAnnouncement);
  router.get("/", getAnnouncements);
  router.get("/:id", getAnnouncementById);

  app.use("/api/announcement", router);
};
