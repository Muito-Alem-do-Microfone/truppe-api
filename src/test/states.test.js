// state.test.js
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("@prisma/client", () => {
  const mPrismaClient = {
    state: {
      findMany: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mPrismaClient),
  };
});

import stateRoutes from "../routes/states.routes.js";
import { PrismaClient } from "@prisma/client";

describe("GET /api/states", () => {
  let app;
  let prisma;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    stateRoutes(app); // essa função deve registrar a rota no Express
    prisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return the list of states", async () => {
    const mockStates = [
      { id: 1, name: "São Paulo" },
      { id: 2, name: "Rio de Janeiro" },
    ];
    prisma.state.findMany.mockResolvedValue(mockStates);

    const res = await request(app).get("/api/states");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockStates);
    expect(prisma.state.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return 500 when an error occurs", async () => {
    prisma.state.findMany.mockRejectedValue(new Error("Test error"));

    const res = await request(app).get("/api/states");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Test error");
  });
});
