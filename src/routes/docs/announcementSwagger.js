// swaggerDocs.js

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
 *                 type: string
 *                 example: "Matheus Alexandre"
 *               number:
 *                 type: string
 *                 example: "123123123"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 2, 3]
 *               description:
 *                 type: string
 *                 example: "Sou guitarrista há 10 anos, gosto muito de tocar Ska, hardcore e coisas parecidas. Procuro algo sério."
 *               instrumentIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 2, 3]
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

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete an announcement by ID
 *     tags: [Announcements]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the announcement to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The announcement was deleted successfully
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /announcements/{id}:
 *   put:
 *     summary: Update an announcement by ID
 *     tags: [Announcements]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the announcement to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               name:
 *                 type: string
 *               number:
 *                 type: string
 *               email:
 *                 type: string
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: number
 *               description:
 *                 type: string
 *               instrumentIds:
 *                 type: array
 *                 items:
 *                   type: number
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: The announcement was updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcements]
 *     responses:
 *       200:
 *         description: A list of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   name:
 *                     type: string
 *                   number:
 *                     type: string
 *                   email:
 *                     type: string
 *                   genreIds:
 *                     type: array
 *                     items:
 *                       type: number
 *                   description:
 *                     type: string
 *                   instrumentIds:
 *                     type: array
 *                     items:
 *                       type: number
 *                   state:
 *                     type: string
 *                   city:
 *                     type: string
 *                   type:
 *                     type: string
 *       500:
 *         description: Server error
 */

export default {};
