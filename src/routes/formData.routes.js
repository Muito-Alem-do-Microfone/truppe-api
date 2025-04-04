import express from "express";
import { formDataController } from "../controllers/formData.controller.js";

const { getFormOptions } = formDataController;

const router = express.Router();

export default (app) => {
  router.get("/", getFormOptions);

  app.use("/api/formData", router);
};
