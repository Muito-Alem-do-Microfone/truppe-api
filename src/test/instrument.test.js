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

import instrumentRoutes from "../routes/instrument.routes.js";

describe("Instrument API", () => {
  let app;
  let prisma;
  let consoleSpy;

  beforeAll(() => {
    consoleSpy = mockExternalServices();
    app = createTestApp();
    instrumentRoutes(app);
    prisma = getMockPrisma();
  });

  afterEach(() => {
    cleanupMocks();
  });

  afterAll(() => {
    cleanupMocks(consoleSpy);
  });

  describe("GET /api/instrument", () => {
    it("should return list of instruments successfully", async () => {
      const mockInstruments = [
        testDataFactory.instrument({ id: 1, name: "Guitar", type: "String" }),
        testDataFactory.instrument({ id: 2, name: "Piano", type: "Keyboard" }),
        testDataFactory.instrument({
          id: 3,
          name: "Drums",
          type: "Percussion",
        }),
        testDataFactory.instrument({ id: 4, name: "Violin", type: "String" }),
      ];

      prisma.instrument.findMany.mockResolvedValue(mockInstruments);

      const response = await request(app).get("/api/instrument");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockInstruments);
      expect(response.body).toHaveLength(4);
      expect(prisma.instrument.findMany).toHaveBeenCalledTimes(1);

      // Verify structure of returned instruments
      response.body.forEach((instrument) => {
        expect(instrument).toHaveProperty("id");
        expect(instrument).toHaveProperty("name");
        expect(instrument).toHaveProperty("type");
        expect(typeof instrument.id).toBe("number");
        expect(typeof instrument.name).toBe("string");
        expect(typeof instrument.type).toBe("string");
      });
    });

    it("should return empty array when no instruments exist", async () => {
      prisma.instrument.findMany.mockResolvedValue([]);

      const response = await request(app).get("/api/instrument");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return instruments grouped by type", async () => {
      const mockInstruments = [
        testDataFactory.instrument({ id: 1, name: "Guitar", type: "String" }),
        testDataFactory.instrument({ id: 2, name: "Bass", type: "String" }),
        testDataFactory.instrument({ id: 3, name: "Piano", type: "Keyboard" }),
        testDataFactory.instrument({
          id: 4,
          name: "Drums",
          type: "Percussion",
        }),
      ];

      prisma.instrument.findMany.mockResolvedValue(mockInstruments);

      const response = await request(app).get("/api/instrument");

      expect(response.status).toBe(200);

      const stringInstruments = response.body.filter(
        (i) => i.type === "String"
      );
      const keyboardInstruments = response.body.filter(
        (i) => i.type === "Keyboard"
      );
      const percussionInstruments = response.body.filter(
        (i) => i.type === "Percussion"
      );

      expect(stringInstruments).toHaveLength(2);
      expect(keyboardInstruments).toHaveLength(1);
      expect(percussionInstruments).toHaveLength(1);
    });

    it("should return 500 when database query fails", async () => {
      prisma.instrument.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app).get("/api/instrument");

      assertHelpers.expectServerError(response);
      expect(response.body.message).toBe("Database connection failed");
    });

    it("should handle timeout errors", async () => {
      prisma.instrument.findMany.mockRejectedValue(new Error("Query timeout"));

      const response = await request(app).get("/api/instrument");

      assertHelpers.expectServerError(response);
      expect(response.body.message).toBe("Query timeout");
    });

    it("should handle generic database errors", async () => {
      prisma.instrument.findMany.mockRejectedValue(new Error("Generic error"));

      const response = await request(app).get("/api/instrument");

      assertHelpers.expectServerError(response);
      expect(response.body).toHaveProperty("message");
    });
  });
});
