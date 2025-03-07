// genre.test.js
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("@prisma/client", () => {
  const mPrismaClient = {
    genre: {
      findMany: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mPrismaClient),
  };
});

import genreRoutes from "../routes/genre.routes.js";
import { PrismaClient } from "@prisma/client";

describe("GET /api/genre", () => {
  let app;
  let prisma;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    genreRoutes(app);
    prisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return the list of genres", async () => {
    const mockGenres = [
      { id: 1, name: "Rock" },
      { id: 2, name: "Pop" },
    ];
    prisma.genre.findMany.mockResolvedValue(mockGenres);

    const res = await request(app).get("/api/genre");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockGenres);
    expect(prisma.genre.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return 500 when an error occurs", async () => {
    prisma.genre.findMany.mockRejectedValue(new Error("Test error"));

    const res = await request(app).get("/api/genre");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Test error");
  });
});
