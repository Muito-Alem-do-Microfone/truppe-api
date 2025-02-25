import express, { json, urlencoded } from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client"; // Import Prisma Client
import announcementRoutes from "./src/routes/announcement.routes.js";
import instrumentsRoutes from "./src/routes/instruments.routes.js";

const app = express();
config();

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
instrumentsRoutes(app);

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
