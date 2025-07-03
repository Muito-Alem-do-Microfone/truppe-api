import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import request from "supertest";
import express from "express";
import { uploadToS3 } from "../utils/s3Upload.js";

vi.mock("@prisma/client", () => {
  const mPrismaClient = {
    announcement: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    announcementConfirmation: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mPrismaClient) };
});

// mock:
vi.mock("../services/email/sendEmail.js", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../utils/s3Upload.js", () => ({
  uploadToS3: vi.fn(),
}));

import announcementRoutes from "../routes/announcement.routes.js";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../services/email/sendEmail.js";

describe("Announcement API", () => {
  let app;
  let prisma;
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    app = express();
    app.use(express.json());
    announcementRoutes(app);
    prisma = new PrismaClient();

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();

    uploadToS3.mockResolvedValue("https://mock-s3-url.com/image.jpg");
    sendEmail.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("POST /api/announcement", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/announcement").send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "One or more required fields are missing or invalid"
      );
    });

    it("should create an announcement successfully", async () => {
      sendEmail.mockResolvedValue(true);

      const createdAnnouncement = {
        id: 1,
        title: "Test Title",
        name: "Test Name",
        number: "123456",
        email: "test@example.com",
        age: 30,
        about: "Test About",
        type: "Test Type",
        state: "Test State",
        city: "Test City",
        description: "Test Description",
        genres: [],
        instruments: [],
        socialLinks: [],
        tags: [],
      };

      const createdConfirmation = {
        id: "conf_123",
        code: "ABC123",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        confirmedAt: null,
        createdAt: new Date(),
        announcementId: createdAnnouncement.id,
      };

      prisma.announcement.create.mockResolvedValue(createdAnnouncement);
      prisma.announcementConfirmation.create.mockResolvedValue(createdConfirmation);

      const res = await request(app)
        .post("/api/announcement")
        .field("title", "Test Title")
        .field("name", "Test Name")
        .field("number", "123456")
        .field("email", "test@example.com")
        .field("age", "30")
        .field("about", "Test About")
        .field("type", "Test Type")
        .field("state", "Test State")
        .field("city", "Test City")
        .field("description", "Test Description")
        .field("genreIds", "1")
        .field("genreIds", "2")
        .field("instrumentIds", "3")
        .field("instrumentIds", "4")
        .field("tagIds", "6")
        .field("tagIds", "7")
        .field("socialLinks[0][socialMediaId]", "5")
        .field("socialLinks[0][url]", "http://example.com");

      console.log(res.statusCode, res.body);
      expect(res.body).toEqual({
        status: "success",
        data: createdAnnouncement,
      });

      expect(prisma.announcement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            age: 30, // garante que converteu a string para número
          }),
        })
      );

      expect(prisma.announcementConfirmation.create).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });


    it("should return 500 when creation fails", async () => {
      const reqBody = {
        title: "Test Title",
        name: "Test Name",
        number: "123456",
        email: "test@example.com",
        age: 30,
        about: "Test About",
        type: "Test Type",
        genreIds: [1, 2],
        state: "Test State",
        city: "Test City",
        description: "Test Description",
        instrumentIds: [3, 4],
        socialLinks: [{ socialMediaId: 5, url: "http://example.com" }],
        tagIds: [6, 7],
      };
      prisma.announcement.create.mockRejectedValue(new Error("Creation error"));
      const res = await request(app).post("/api/announcement").send(reqBody);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        status: "error",
        message: "An error occurred while creating the announcement.",
      });
    });
  });

  describe("DELETE /api/announcement/:id", () => {
    it("should return 404 if announcement not found", async () => {
      prisma.announcement.findUnique.mockResolvedValue(null);
      const res = await request(app).delete("/api/announcement/1");
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: "Announcement not found" });
    });

    it("should delete announcement successfully", async () => {
      prisma.announcement.findUnique.mockResolvedValue({ id: 1 });
      prisma.announcement.delete.mockResolvedValue({});
      const res = await request(app).delete("/api/announcement/1");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: "Announcement deleted successfully.",
      });
    });

    it("should return 500 when deletion fails", async () => {
      prisma.announcement.findUnique.mockResolvedValue({ id: 1 });
      prisma.announcement.delete.mockRejectedValue(new Error("Deletion error"));
      const res = await request(app).delete("/api/announcement/1");
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: "Deletion error" });
    });
  });

  describe("PUT /api/announcement/:id", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).put("/api/announcement/1").send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toMatch(
        /One or more required fields are missing/
      );
    });

    it("should return 404 if announcement not found", async () => {
      const reqBody = {
        title: "Updated Title",
        name: "Updated Name",
        number: "654321",
        email: "updated@example.com",
        age: 35,
        about: "Updated About",
        type: "Updated Type",
        genreIds: [1, 2],
        state: "Updated State",
        city: "Updated City",
        description: "Updated Description",
        instrumentIds: [3, 4],
        socialLinks: [{ socialMediaId: 5, url: "http://updated.com" }],
        tagIds: [6, 7],
      };
      prisma.announcement.findUnique.mockResolvedValue(null);
      const res = await request(app).put("/api/announcement/1").send(reqBody);
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: "Announcement not found" });
    });

    it("should update announcement successfully", async () => {
      const reqBody = {
        title: "Updated Title",
        name: "Updated Name",
        number: "654321",
        email: "updated@example.com",
        age: 35,
        about: "Updated About",
        type: "Updated Type",
        genreIds: [1, 2],
        state: "Updated State",
        city: "Updated City",
        description: "Updated Description",
        instrumentIds: [3, 4],
        socialLinks: [{ socialMediaId: 5, url: "http://updated.com" }],
        tagIds: [6, 7],
      };
      const updatedAnnouncement = {
        id: 1,
        ...reqBody,
        genres: [
          { id: 1, name: "Genre1" },
          { id: 2, name: "Genre2" },
        ],
        instruments: [
          { id: 3, name: "Instrument1" },
          { id: 4, name: "Instrument2" },
        ],
        socialLinks: [
          {
            id: 10,
            url: "http://updated.com",
            socialMedia: { id: 5, name: "Social1" },
          },
        ],
        tags: [
          { id: 6, name: "Tag1" },
          { id: 7, name: "Tag2" },
        ],
      };
      prisma.announcement.findUnique.mockResolvedValue({ id: 1 });
      prisma.announcement.update.mockResolvedValue(updatedAnnouncement);
      const res = await request(app).put("/api/announcement/1").send(reqBody);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: updatedAnnouncement,
      });
    });

    it("should return 500 when update fails", async () => {
      const reqBody = {
        title: "Updated Title",
        name: "Updated Name",
        number: "654321",
        email: "updated@example.com",
        age: 35,
        about: "Updated About",
        type: "Updated Type",
        genreIds: [1, 2],
        state: "Updated State",
        city: "Updated City",
        description: "Updated Description",
        instrumentIds: [3, 4],
        socialLinks: [{ socialMediaId: 5, url: "http://updated.com" }],
        tagIds: [6, 7],
      };
      prisma.announcement.findUnique.mockResolvedValue({ id: 1 });
      prisma.announcement.update.mockRejectedValue(new Error("Update error"));
      const res = await request(app).put("/api/announcement/1").send(reqBody);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        status: "error",
        message: "An error occurred while updating the announcement.",
      });
    });
  });

  describe("GET /api/announcement", () => {
    it("should return a list of announcements with sensitive fields removed", async () => {
      const announcementsList = [
        {
          id: 1,
          about: "secret",
          email: "secret@example.com",
          number: "123",
          other: "value",
        },
        {
          id: 2,
          about: "hidden",
          email: "hidden@example.com",
          number: "456",
          other: "value2",
        },
      ];
      prisma.announcement.findMany.mockResolvedValue(announcementsList);
      const res = await request(app).get("/api/announcement");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([
        { id: 1, other: "value" },
        { id: 2, other: "value2" },
      ]);
    });

    it("should return 500 when retrieval fails", async () => {
      prisma.announcement.findMany.mockRejectedValue(
        new Error("Retrieval error")
      );
      const res = await request(app).get("/api/announcement");
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: "Retrieval error" });
    });
  });

  describe("GET /api/announcement/:id", () => {
    it("should return 404 if announcement not found", async () => {
      prisma.announcement.findUnique.mockResolvedValue(null);
      const res = await request(app).get("/api/announcement/1");
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: "Announcement not found" });
    });

    it("should return announcement with mapped socialLinks", async () => {
      const announcement = {
        id: 1,
        title: "Test Title",
        socialLinks: [
          {
            id: 10,
            url: "http://example.com",
            socialMedia: { id: 5, name: "Social1" },
          },
        ],
        genres: [],
        instruments: [],
        tags: [],
      };
      prisma.announcement.findUnique.mockResolvedValue(announcement);
      const res = await request(app).get("/api/announcement/1");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        ...announcement,
        socialLinks: [
          {
            id: 10,
            url: "http://example.com",
            socialMediaId: 5,
            socialMediaName: "Social1",
          },
        ],
      });
    });

    it("should return 500 when retrieval fails", async () => {
      prisma.announcement.findUnique.mockRejectedValue(
        new Error("Retrieval error")
      );
      const res = await request(app).get("/api/announcement/1");
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: "Retrieval error" });
    });
  });
});
