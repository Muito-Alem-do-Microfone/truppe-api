import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("@prisma/client", () => {
  const mPrismaClient = {
    tags: {
      findMany: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mPrismaClient),
  };
});

import tagRoutes from "../routes/tag.routes.js";
import { PrismaClient } from "@prisma/client";

describe("GET /api/tag", () => {
  let app;
  let prisma;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    tagRoutes(app);
    prisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a list of tags", async () => {
    const mockTags = [
      { id: 1, name: "Jazz" },
      { id: 2, name: "Blues" },
    ];
    prisma.tags.findMany.mockResolvedValue(mockTags);
    const res = await request(app).get("/api/tag");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTags);
    expect(prisma.tags.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return 500 when an error occurs", async () => {
    prisma.tags.findMany.mockRejectedValue(new Error("Test error"));
    const res = await request(app).get("/api/tag");
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Test error");
  });
});
