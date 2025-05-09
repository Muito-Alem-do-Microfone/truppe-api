import "newrelic";
import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";

import {
  announcementRoutes,
  formDataRoutes,
  genreRoutes,
  instrumentRoutes,
  tagRoutes,
  statesRoutes,
} from "./src/routes/index.js";

export const app = express();

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Prisma Client
const prisma = new PrismaClient();

// Use routes
announcementRoutes(app);
instrumentRoutes(app);
genreRoutes(app);
tagRoutes(app);
formDataRoutes(app);
statesRoutes(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Optionally handle cleanup on server termination
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma Client disconnected.");
  process.exit(0);
});
