import express from "express";
import { getGenres } from "../controllers/genre.controller.js";

const router = express.Router();

export default (app) => {
  router.get("/", getGenres);

  app.use("/api/genre", router);
};
