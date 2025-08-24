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

import tagRoutes from "../routes/tag.routes.js";

describe("Tag API", () => {
  let app;
  let prisma;
  let consoleSpy;

  beforeAll(() => {
    consoleSpy = mockExternalServices();
    app = createTestApp();
    tagRoutes(app);
    prisma = getMockPrisma();
  });

  afterEach(() => {
    cleanupMocks();
  });

  afterAll(() => {
    cleanupMocks(consoleSpy);
  });

  describe("GET /api/tag", () => {
    it("should return list of tags successfully", async () => {
      const mockTags = [
        testDataFactory.tag({ id: 1, name: "Beginner" }),
        testDataFactory.tag({ id: 2, name: "Intermediate" }),
        testDataFactory.tag({ id: 3, name: "Advanced" }),
        testDataFactory.tag({ id: 4, name: "Professional" }),
      ];

      prisma.tags.findMany.mockResolvedValue(mockTags);

      const response = await request(app).get("/api/tag");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockTags);
      expect(response.body).toHaveLength(4);
      expect(prisma.tags.findMany).toHaveBeenCalledTimes(1);

      // Verify structure of returned tags
      response.body.forEach((tag) => {
        expect(tag).toHaveProperty("id");
        expect(tag).toHaveProperty("name");
        expect(typeof tag.id).toBe("number");
        expect(typeof tag.name).toBe("string");
      });
    });

    it("should return empty array when no tags exist", async () => {
      prisma.tags.findMany.mockResolvedValue([]);

      const response = await request(app).get("/api/tag");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return tags with unique names", async () => {
      const mockTags = [
        testDataFactory.tag({ id: 1, name: "Beginner" }),
        testDataFactory.tag({ id: 2, name: "Intermediate" }),
        testDataFactory.tag({ id: 3, name: "Advanced" }),
      ];

      prisma.tags.findMany.mockResolvedValue(mockTags);

      const response = await request(app).get("/api/tag");

      expect(response.status).toBe(200);

      const tagNames = response.body.map((tag) => tag.name);
      const uniqueNames = [...new Set(tagNames)];

      expect(tagNames).toHaveLength(uniqueNames.length);
    });

    it("should return 500 when database query fails", async () => {
      prisma.tags.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app).get("/api/tag");

      assertHelpers.expectServerError(response);
      expect(response.body.message).toBe("Database connection failed");
    });

    it("should handle timeout errors", async () => {
      prisma.tags.findMany.mockRejectedValue(new Error("Query timeout"));

      const response = await request(app).get("/api/tag");

      assertHelpers.expectServerError(response);
      expect(response.body.message).toBe("Query timeout");
    });

    it("should handle generic database errors", async () => {
      prisma.tags.findMany.mockRejectedValue(new Error("Generic error"));

      const response = await request(app).get("/api/tag");

      assertHelpers.expectServerError(response);
      expect(response.body).toHaveProperty("message");
    });
  });
});
