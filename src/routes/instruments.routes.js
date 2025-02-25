import express from "express";
import { getInstruments } from "../controllers/instruments.controller.js";

const router = express.Router();

export default (app) => {
  router.get("/", getInstruments);

  app.use("/api/instruments", router);
};
