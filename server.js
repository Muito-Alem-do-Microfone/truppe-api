import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import announcementRoutes from "./src/routes/announcement.routes.js";
import instrumentsRoutes from "./src/routes/instruments.routes.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MADM API Documentation",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./src/routes/*.routes.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
