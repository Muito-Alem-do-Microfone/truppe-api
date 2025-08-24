import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import {
  createTestApp,
  setupPrismaMock,
  getMockPrisma,
  mockExternalServices,
  cleanupMocks,
  testDataFactory,
  assertHelpers,
} from "./helpers/testSetup.js";

// Setup Prisma mocking
setupPrismaMock();

import genreRoutes from "../routes/genre.routes.js";

describe("Genre API", () => {
  let app;
  let prisma;
  let consoleSpy;

  beforeAll(() => {
    consoleSpy = mockExternalServices();
    app = createTestApp();
    genreRoutes(app);
    prisma = getMockPrisma();
  });

  afterEach(() => {
    cleanupMocks();
  });

  afterAll(() => {
    cleanupMocks(consoleSpy);
  });

  describe("GET /api/genre", () => {
    it("should return list of genres successfully", async () => {
      const mockGenres = [
        testDataFactory.genre({ id: 1, name: "Rock" }),
        testDataFactory.genre({ id: 2, name: "Pop" }),
        testDataFactory.genre({ id: 3, name: "Jazz" }),
      ];

      prisma.genre.findMany.mockResolvedValue(mockGenres);

      const response = await request(app).get("/api/genre");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockGenres);
      expect(prisma.genre.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no genres exist", async () => {
      prisma.genre.findMany.mockResolvedValue([]);

      const response = await request(app).get("/api/genre");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return 500 when database query fails", async () => {
      prisma.genre.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app).get("/api/genre");

      assertHelpers.expectServerError(response);
      expect(response.body.message).toBe("Database connection failed");
    });

    it("should handle generic database errors", async () => {
      prisma.genre.findMany.mockRejectedValue(new Error("Generic error"));

      const response = await request(app).get("/api/genre");

      assertHelpers.expectServerError(response);
      expect(response.body).toHaveProperty("message");
    });
  });
});
