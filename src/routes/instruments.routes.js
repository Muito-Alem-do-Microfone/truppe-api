import express from "express";
import { instrumentController } from "../controllers/index.js";

const { getInstruments } = instrumentController;
const router = express.Router();

export default (app) => {
  router.get("/", getInstruments);

  app.use("/api/instrument", router);
};
