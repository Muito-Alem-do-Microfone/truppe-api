import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("@prisma/client", () => {
  const mPrismaClient = {
    instrument: {
      findMany: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mPrismaClient),
  };
});

import instrumentRoutes from "../routes/instrument.routes.js";
import { PrismaClient } from "@prisma/client";

describe("GET /api/instrument", () => {
  let app;
  let prisma;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    instrumentRoutes(app);
    prisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a list of instruments", async () => {
    const mockInstruments = [
      { id: 1, name: "Guitar", type: "String" },
      { id: 2, name: "Piano", type: "Keyboard" },
    ];
    prisma.instrument.findMany.mockResolvedValue(mockInstruments);

    const res = await request(app).get("/api/instrument");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockInstruments);
    expect(prisma.instrument.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return 500 when an error occurs", async () => {
    prisma.instrument.findMany.mockRejectedValue(new Error("Test error"));

    const res = await request(app).get("/api/instrument");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Test error");
  });
});
