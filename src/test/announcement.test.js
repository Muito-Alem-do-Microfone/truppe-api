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

import announcementRoutes from "../routes/announcement.routes.js";

describe("Announcement API", () => {
  let app;
  let prisma;
  let consoleSpy;

  beforeAll(() => {
    consoleSpy = mockExternalServices();
    app = createTestApp();
    announcementRoutes(app);
    prisma = getMockPrisma();
  });

  afterEach(() => {
    cleanupMocks();
  });

  afterAll(() => {
    cleanupMocks(consoleSpy);
  });

  describe("POST /api/announcement", () => {
    const validAnnouncementData = {
      title: "Test Announcement",
      name: "Test User",
      number: "123456789",
      email: "test@example.com",
      age: "25",
      about: "Test about section",
      type: "Musician",
      state: "Test State",
      city: "Test City",
      description: "Test description",
      userId: "1",
      genreIds: ["1", "2"],
      instrumentIds: ["1", "2"],
      tagIds: ["1", "2"],
    };

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/api/announcement").send({});

      assertHelpers.expectValidationError(
        response,
        "One or more required fields are missing or invalid"
      );
    });

    it("should return 400 if age is invalid", async () => {
      const invalidData = { ...validAnnouncementData, age: "invalid" };
      const response = await request(app)
        .post("/api/announcement")
        .send(invalidData);

      assertHelpers.expectValidationError(response);
    });

    it("should return 400 if age is zero or negative", async () => {
      const invalidData = { ...validAnnouncementData, age: "0" };
      const response = await request(app)
        .post("/api/announcement")
        .send(invalidData);

      assertHelpers.expectValidationError(response);
    });

    it("should return 400 if arrays are empty", async () => {
      const invalidData = { ...validAnnouncementData, genreIds: [] };
      const response = await request(app)
        .post("/api/announcement")
        .send(invalidData);

      assertHelpers.expectValidationError(response);
    });

    it("should return 400 if userId is missing", async () => {
      const invalidData = { ...validAnnouncementData };
      delete invalidData.userId;
      const response = await request(app)
        .post("/api/announcement")
        .send(invalidData);

      assertHelpers.expectValidationError(response);
    });

    it("should return 404 if user does not exist", async () => {
      prisma.appUser.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/announcement")
        .send(validAnnouncementData);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("User not found");
    });

    it("should create announcement successfully with form data", async () => {
      const mockUser = testDataFactory.appUser({ id: 1 });
      const mockAnnouncement = testDataFactory.announcement({
        genres: [testDataFactory.genre({ id: 1, name: "Rock" })],
        instruments: [testDataFactory.instrument({ id: 1, name: "Guitar" })],
        tags: [testDataFactory.tag({ id: 1, name: "Beginner" })],
        socialLinks: [],
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      prisma.announcement.create.mockResolvedValue(mockAnnouncement);

      const response = await request(app)
        .post("/api/announcement")
        .field("title", validAnnouncementData.title)
        .field("name", validAnnouncementData.name)
        .field("number", validAnnouncementData.number)
        .field("email", validAnnouncementData.email)
        .field("age", validAnnouncementData.age)
        .field("about", validAnnouncementData.about)
        .field("type", validAnnouncementData.type)
        .field("state", validAnnouncementData.state)
        .field("city", validAnnouncementData.city)
        .field("description", validAnnouncementData.description)
        .field("userId", validAnnouncementData.userId)
        .field("genreIds", "1")
        .field("genreIds", "2")
        .field("instrumentIds", "1")
        .field("instrumentIds", "2")
        .field("tagIds", "1")
        .field("tagIds", "2")
        .field("socialLinks[0][socialMediaId]", "1")
        .field("socialLinks[0][url]", "https://example.com");

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toMatchObject({
        title: mockAnnouncement.title,
        name: mockAnnouncement.name,
        age: mockAnnouncement.age,
      });

      expect(prisma.announcement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            age: 25, // Ensure string was converted to number
            title: validAnnouncementData.title,
            name: validAnnouncementData.name,
          }),
        })
      );
    });

    it("should create announcement successfully with image upload", async () => {
      const mockUser = testDataFactory.appUser({ id: 1 });
      const mockAnnouncement = testDataFactory.announcement({
        imageUrl: "https://mock-s3-url.com/image.jpg",
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      prisma.announcement.create.mockResolvedValue(mockAnnouncement);

      const response = await request(app)
        .post("/api/announcement")
        .field("title", validAnnouncementData.title)
        .field("name", validAnnouncementData.name)
        .field("number", validAnnouncementData.number)
        .field("email", validAnnouncementData.email)
        .field("age", validAnnouncementData.age)
        .field("about", validAnnouncementData.about)
        .field("type", validAnnouncementData.type)
        .field("state", validAnnouncementData.state)
        .field("city", validAnnouncementData.city)
        .field("description", validAnnouncementData.description)
        .field("userId", validAnnouncementData.userId)
        .field("genreIds", "1")
        .field("instrumentIds", "1")
        .field("tagIds", "1")
        .attach("image", Buffer.from("fake image"), "test.jpg");

      expect(response.status).toBe(201);
      expect(response.body.data.imageUrl).toBe(
        "https://mock-s3-url.com/image.jpg"
      );
    });

    it("should handle Discord webhook failure gracefully", async () => {
      const mockUser = testDataFactory.appUser({ id: 1 });
      const mockAnnouncement = testDataFactory.announcement();

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      prisma.announcement.create.mockResolvedValue(mockAnnouncement);

      // Mock fetch to fail
      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Discord webhook failed",
      });

      const response = await request(app)
        .post("/api/announcement")
        .send(validAnnouncementData);

      // Should still succeed even if Discord webhook fails
      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
    });

    it("should return 500 when database creation fails", async () => {
      const mockUser = testDataFactory.appUser({ id: 1 });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      prisma.announcement.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/announcement")
        .send(validAnnouncementData);

      assertHelpers.expectServerError(response);
      expect(response.body.message).toContain("error occurred while creating");
    });
  });

  describe("GET /api/announcement", () => {
    it("should return list of announcements with sensitive data removed", async () => {
      const mockAnnouncements = [
        testDataFactory.announcement({
          id: 1,
          about: "sensitive info",
          email: "sensitive@email.com",
          number: "123456789",
        }),
        testDataFactory.announcement({
          id: 2,
          about: "another sensitive info",
          email: "another@email.com",
          number: "987654321",
        }),
      ];

      prisma.announcement.findMany.mockResolvedValue(mockAnnouncements);

      const response = await request(app).get("/api/announcement");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Check that sensitive fields are removed
      response.body.forEach((announcement) => {
        expect(announcement).not.toHaveProperty("about");
        expect(announcement).not.toHaveProperty("email");
        expect(announcement).not.toHaveProperty("number");
      });
    });

    it("should return 500 when database query fails", async () => {
      prisma.announcement.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/announcement");

      assertHelpers.expectServerError(response);
    });
  });

  describe("GET /api/announcement/:id", () => {
    it("should return 404 if announcement not found", async () => {
      prisma.announcement.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/announcement/999");

      assertHelpers.expectNotFound(response, "Announcement not found");
    });

    it("should return announcement with properly mapped social links", async () => {
      const mockAnnouncement = testDataFactory.announcement({
        socialLinks: [
          {
            id: 1,
            url: "https://facebook.com/test",
            socialMedia: { id: 1, name: "Facebook" },
          },
          {
            id: 2,
            url: "https://instagram.com/test",
            socialMedia: { id: 2, name: "Instagram" },
          },
        ],
      });

      prisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);

      const response = await request(app).get("/api/announcement/1");

      expect(response.status).toBe(200);
      expect(response.body.socialLinks).toEqual([
        {
          id: 1,
          url: "https://facebook.com/test",
          socialMediaId: 1,
          socialMediaName: "Facebook",
        },
        {
          id: 2,
          url: "https://instagram.com/test",
          socialMediaId: 2,
          socialMediaName: "Instagram",
        },
      ]);
    });

    it("should return 500 when database query fails", async () => {
      prisma.announcement.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/announcement/1");

      assertHelpers.expectServerError(response);
    });
  });

  describe("PUT /api/announcement/:id", () => {
    const validUpdateData = {
      title: "Updated Title",
      name: "Updated Name",
      number: "987654321",
      email: "updated@example.com",
      age: 30,
      about: "Updated about",
      type: "Updated Type",
      genreIds: [1, 2],
      state: "Updated State",
      city: "Updated City",
      description: "Updated description",
      instrumentIds: [1, 2],
      socialLinks: [{ socialMediaId: 1, url: "https://updated.com" }],
      tagIds: [1, 2],
    };

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).put("/api/announcement/1").send({});

      assertHelpers.expectValidationError(
        response,
        "required fields are missing"
      );
    });

    it("should return 404 if announcement not found", async () => {
      prisma.announcement.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/announcement/999")
        .send(validUpdateData);

      assertHelpers.expectNotFound(response, "Announcement not found");
    });

    it("should update announcement successfully", async () => {
      const existingAnnouncement = testDataFactory.announcement();
      const updatedAnnouncement = testDataFactory.announcement(validUpdateData);

      prisma.announcement.findUnique.mockResolvedValue(existingAnnouncement);
      prisma.announcement.update.mockResolvedValue(updatedAnnouncement);

      const response = await request(app)
        .put("/api/announcement/1")
        .send(validUpdateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toMatchObject({
        title: validUpdateData.title,
        name: validUpdateData.name,
        age: validUpdateData.age,
      });

      expect(prisma.announcement.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            title: validUpdateData.title,
            name: validUpdateData.name,
          }),
        })
      );
    });

    it("should return 500 when update fails", async () => {
      const existingAnnouncement = testDataFactory.announcement();
      prisma.announcement.findUnique.mockResolvedValue(existingAnnouncement);
      prisma.announcement.update.mockRejectedValue(new Error("Update error"));

      const response = await request(app)
        .put("/api/announcement/1")
        .send(validUpdateData);

      assertHelpers.expectServerError(response);
      expect(response.body.message).toContain("error occurred while updating");
    });
  });

  describe("DELETE /api/announcement/:id", () => {
    it("should return 404 if announcement not found", async () => {
      prisma.announcement.findUnique.mockResolvedValue(null);

      const response = await request(app).delete("/api/announcement/999");

      assertHelpers.expectNotFound(response, "Announcement not found");
    });

    it("should delete announcement successfully", async () => {
      const existingAnnouncement = testDataFactory.announcement();
      prisma.announcement.findUnique.mockResolvedValue(existingAnnouncement);
      prisma.announcement.delete.mockResolvedValue({});

      const response = await request(app).delete("/api/announcement/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Announcement deleted successfully.");

      expect(prisma.announcement.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return 500 when deletion fails", async () => {
      const existingAnnouncement = testDataFactory.announcement();
      prisma.announcement.findUnique.mockResolvedValue(existingAnnouncement);
      prisma.announcement.delete.mockRejectedValue(new Error("Deletion error"));

      const response = await request(app).delete("/api/announcement/1");

      assertHelpers.expectServerError(response);
    });
  });
});
