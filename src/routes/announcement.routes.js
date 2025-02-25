import express from "express";
import {
  deleteAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  createAnnouncement,
} from "../controllers/announcement.controller.js";

const router = express.Router();

export default (app) => {
  /**
   * @swagger
   * tags:
   *   - name: Announcements
   *     description: The Announcements managing API
   */

  /**
   * @swagger
   * /announcements:
   *   post:
   *     summary: Create a new announcement
   *     tags: [Announcements]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 example: "Guitarrista de Ska procura banda profissional"
   *               name:
   *                  type: string
   *                  example: "Matheus Alexandre"
   *               number:
   *                  type: string
   *                  example: "123123123"
   *               email:
   *                  type: string
   *                  example: "john.doe@example.com"
   *               genreIds:
   *                  type: array
   *                  items:
   *                      type: number
   *                  example: [1, 2, 3]
   *               description:
   *                  type: string
   *                  example: "Sou guitarrista há 10 anos, gosto muito de tocar Ska, hardcore e coisas parecidas. Procuro algo sério."
   *               instrumentIds:
   *                  type: array
   *                  items:
   *                      type: number
   *                  example: [1, 2, 3]
   *               state:
   *                 type: string
   *                 example: "Rio de Janeiro"
   *               city:
   *                 type: string
   *                 example: "Rio de Janeiro"
   *               type:
   *                 type: string
   *                 example: "musician"
   *     responses:
   *       200:
   *         description: The announcement was created successfully
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  router.post("/", createAnnouncement);
  router.delete("/:id", deleteAnnouncement);
  router.put("/:id", updateAnnouncement);
  router.get("/", getAnnouncements);

  app.use("/api/announcements", router);
};
