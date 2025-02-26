import express from "express";
import { tagController } from "../controllers/index.js";

const { getTags } = tagController;
const router = express.Router();

export default (app) => {
  router.get("/", getTags);

  app.use("/api/tag", router);
};
