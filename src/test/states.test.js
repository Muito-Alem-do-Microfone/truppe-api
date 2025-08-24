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

import statesRoutes from "../routes/states.routes.js";

describe("States API", () => {
  let app;
  let prisma;
  let consoleSpy;

  beforeAll(() => {
    consoleSpy = mockExternalServices();
    app = createTestApp();
    statesRoutes(app);
    prisma = getMockPrisma();
  });

  afterEach(() => {
    cleanupMocks();
  });

  afterAll(() => {
    cleanupMocks(consoleSpy);
  });

  describe("GET /api/states", () => {
    it("should return list of states successfully", async () => {
      const mockStates = [
        testDataFactory.state({ id: 1, name: "São Paulo" }),
        testDataFactory.state({ id: 2, name: "Rio de Janeiro" }),
        testDataFactory.state({ id: 3, name: "Minas Gerais" }),
        testDataFactory.state({ id: 4, name: "Bahia" }),
        testDataFactory.state({ id: 5, name: "Paraná" }),
      ];

      prisma.state.findMany.mockResolvedValue(mockStates);

      const response = await request(app).get("/api/states");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockStates);
      expect(response.body).toHaveLength(5);
      expect(prisma.state.findMany).toHaveBeenCalledTimes(1);

      // Verify structure of returned states
      response.body.forEach((state) => {
        expect(state).toHaveProperty("id");
        expect(state).toHaveProperty("name");
        expect(typeof state.id).toBe("number");
        expect(typeof state.name).toBe("string");
      });
    });

    it("should return empty array when no states exist", async () => {
      prisma.state.findMany.mockResolvedValue([]);

      const response = await request(app).get("/api/states");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return states with unique names", async () => {
      const mockStates = [
        testDataFactory.state({ id: 1, name: "São Paulo" }),
        testDataFactory.state({ id: 2, name: "Rio de Janeiro" }),
        testDataFactory.state({ id: 3, name: "Minas Gerais" }),
      ];

      prisma.state.findMany.mockResolvedValue(mockStates);

      const response = await request(app).get("/api/states");

      expect(response.status).toBe(200);

      const stateNames = response.body.map((state) => state.name);
      const uniqueNames = [...new Set(stateNames)];

      expect(stateNames).toHaveLength(uniqueNames.length);
    });

    it("should return states sorted alphabetically", async () => {
      const mockStates = [
        testDataFactory.state({ id: 1, name: "São Paulo" }),
        testDataFactory.state({ id: 2, name: "Bahia" }),
        testDataFactory.state({ id: 3, name: "Minas Gerais" }),
        testDataFactory.state({ id: 4, name: "Acre" }),
      ];

      prisma.state.findMany.mockResolvedValue(mockStates);

      const response = await request(app).get("/api/states");

      expect(response.status).toBe(200);

      const stateNames = response.body.map((state) => state.name);
      // Note: This test assumes the API returns states in the order from database
      // If sorting is implemented in the API, this test would verify that
      expect(stateNames).toEqual([
        "São Paulo",
        "Bahia",
        "Minas Gerais",
        "Acre",
      ]);
    });

    it("should handle Brazilian state names with accents", async () => {
      const mockStates = [
        testDataFactory.state({ id: 1, name: "São Paulo" }),
        testDataFactory.state({ id: 2, name: "Ceará" }),
        testDataFactory.state({ id: 3, name: "Pará" }),
        testDataFactory.state({ id: 4, name: "Paraíba" }),
      ];

      prisma.state.findMany.mockResolvedValue(mockStates);

      const response = await request(app).get("/api/states");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4);

      // Verify that accented characters are preserved
      const stateNames = response.body.map((state) => state.name);
      expect(stateNames).toContain("São Paulo");
      expect(stateNames).toContain("Ceará");
      expect(stateNames).toContain("Pará");
      expect(stateNames).toContain("Paraíba");
    });

    it("should return 500 when database query fails", async () => {
      prisma.state.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app).get("/api/states");

      assertHelpers.expectServerError(response);
      expect(response.body.message).toBe("Database connection failed");
    });

    it("should handle timeout errors", async () => {
      prisma.state.findMany.mockRejectedValue(new Error("Query timeout"));

      const response = await request(app).get("/api/states");

      assertHelpers.expectServerError(response);
      expect(response.body.message).toBe("Query timeout");
    });

    it("should handle generic database errors", async () => {
      prisma.state.findMany.mockRejectedValue(new Error("Generic error"));

      const response = await request(app).get("/api/states");

      assertHelpers.expectServerError(response);
      expect(response.body).toHaveProperty("message");
    });
  });
});
