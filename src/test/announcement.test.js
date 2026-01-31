import { describe, it, expect, vi, beforeEach } from "vitest";
import { announcementController } from "../controllers/announcement.controller.js";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    appUser: {
      findUnique: vi.fn(),
    },
    announcement: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

vi.mock("../services/s3/imageUpload.js", () => ({
  uploadToS3: vi.fn(),
}));

import { PrismaClient } from "@prisma/client";
import { uploadToS3 } from "../services/s3/imageUpload.js";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const validBody = {
  name: "John",
  type: "Musician",
  state: "SP",
  city: "São Paulo",
  description: "Guitar player",
  userId: "1",
  genreIds: ["1", "2"],
  instrumentIds: ["3"],
  tagIds: ["4", "5"],
  "socialLinks[0][socialMediaId]": "1",
  "socialLinks[0][url]": "https://instagram.com/john",
};

const mockUser = { id: 1, name: "John", email: "john@test.com" };

const mockAnnouncement = {
  id: 1,
  name: "John",
  type: "Musician",
  state: "SP",
  city: "São Paulo",
  description: "Guitar player",
  imageUrl: null,
  userId: 1,
  genres: [{ id: 1, name: "Rock" }],
  instruments: [{ id: 3, name: "Guitar" }],
  tags: [{ id: 4, name: "Band" }],
  socialLinks: [
    {
      id: 1,
      url: "https://instagram.com/john",
      socialMedia: { id: 1, name: "Instagram" },
    },
  ],
  user: { id: 1, name: "John", email: "john@test.com" },
};

// ─── createAnnouncement ─────────────────────────────────────────────────────

describe("createAnnouncement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an announcement successfully without image", async () => {
    const req = { body: validBody, file: null };
    const res = mockRes();

    prisma.appUser.findUnique.mockResolvedValue(mockUser);
    prisma.announcement.create.mockResolvedValue(mockAnnouncement);

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockAnnouncement,
    });
    expect(uploadToS3).not.toHaveBeenCalled();
  });

  it("should create an announcement with image upload", async () => {
    const mockFile = { buffer: Buffer.from("img"), mimetype: "image/jpeg" };
    const req = { body: validBody, file: mockFile };
    const res = mockRes();

    prisma.appUser.findUnique.mockResolvedValue(mockUser);
    uploadToS3.mockResolvedValue("https://s3.amazonaws.com/bucket/image.jpg");
    prisma.announcement.create.mockResolvedValue({
      ...mockAnnouncement,
      imageUrl: "https://s3.amazonaws.com/bucket/image.jpg",
    });

    await announcementController.createAnnouncement(req, res);

    expect(uploadToS3).toHaveBeenCalledWith(mockFile);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 when required fields are missing", async () => {
    const req = { body: { name: "John" }, file: null };
    const res = mockRes();

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
        fields: expect.arrayContaining([
          "type",
          "state",
          "city",
          "description",
          "userId",
          "genreIds",
          "instrumentIds",
          "tagIds",
        ]),
      }),
    );
  });

  it("should return 400 when genreIds is empty", async () => {
    const req = {
      body: { ...validBody, genreIds: [] },
      file: null,
    };
    const res = mockRes();

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.arrayContaining(["genreIds"]),
      }),
    );
  });

  it("should return 400 when instrumentIds is empty", async () => {
    const req = {
      body: { ...validBody, instrumentIds: [] },
      file: null,
    };
    const res = mockRes();

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.arrayContaining(["instrumentIds"]),
      }),
    );
  });

  it("should return 400 when tagIds is empty", async () => {
    const req = {
      body: { ...validBody, tagIds: [] },
      file: null,
    };
    const res = mockRes();

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.arrayContaining(["tagIds"]),
      }),
    );
  });

  it("should return 404 when user is not found", async () => {
    const req = { body: validBody, file: null };
    const res = mockRes();

    prisma.appUser.findUnique.mockResolvedValue(null);

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "User not found",
    });
  });

  it("should handle single genreId as string (not array)", async () => {
    const req = {
      body: { ...validBody, genreIds: "1" },
      file: null,
    };
    const res = mockRes();

    prisma.appUser.findUnique.mockResolvedValue(mockUser);
    prisma.announcement.create.mockResolvedValue(mockAnnouncement);

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should parse socialLinks from indexed body keys", async () => {
    const body = {
      ...validBody,
      "socialLinks[0][socialMediaId]": "1",
      "socialLinks[0][url]": "https://instagram.com",
      "socialLinks[1][socialMediaId]": "2",
      "socialLinks[1][url]": "https://twitter.com",
    };
    const req = { body, file: null };
    const res = mockRes();

    prisma.appUser.findUnique.mockResolvedValue(mockUser);
    prisma.announcement.create.mockResolvedValue(mockAnnouncement);

    await announcementController.createAnnouncement(req, res);

    const createCall = prisma.announcement.create.mock.calls[0][0];
    expect(createCall.data.socialLinks.create).toHaveLength(2);
    expect(createCall.data.socialLinks.create[0].socialMedia.connect.id).toBe(
      1,
    );
    expect(createCall.data.socialLinks.create[1].socialMedia.connect.id).toBe(
      2,
    );
  });

  it("should return 500 when prisma throws", async () => {
    const req = { body: validBody, file: null };
    const res = mockRes();

    prisma.appUser.findUnique.mockResolvedValue(mockUser);
    prisma.announcement.create.mockRejectedValue(new Error("DB error"));

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "An error occurred while creating the announcement.",
    });
  });

  it("should return 500 when S3 upload fails", async () => {
    const req = {
      body: validBody,
      file: { buffer: Buffer.from("img"), mimetype: "image/jpeg" },
    };
    const res = mockRes();

    prisma.appUser.findUnique.mockResolvedValue(mockUser);
    uploadToS3.mockRejectedValue(new Error("S3 error"));

    await announcementController.createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── deleteAnnouncement ─────────────────────────────────────────────────────

describe("deleteAnnouncement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete an announcement successfully", async () => {
    const req = { params: { id: "1" } };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
    prisma.announcement.delete.mockResolvedValue(mockAnnouncement);

    await announcementController.deleteAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      message: "Announcement deleted successfully.",
    });
  });

  it("should return 404 when announcement does not exist", async () => {
    const req = { params: { id: "999" } };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(null);

    await announcementController.deleteAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Announcement not found",
    });
    expect(prisma.announcement.delete).not.toHaveBeenCalled();
  });

  it("should return 500 when delete throws", async () => {
    const req = { params: { id: "1" } };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
    prisma.announcement.delete.mockRejectedValue(new Error("DB error"));

    await announcementController.deleteAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── updateAnnouncement ─────────────────────────────────────────────────────

describe("updateAnnouncement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const updateBody = {
    name: "Updated",
    type: "Band",
    state: "RJ",
    city: "Rio de Janeiro",
    description: "Updated description",
    userId: "1",
    genreIds: [1, 2],
    instrumentIds: [3],
    tagIds: [4],
    socialLinks: [{ socialMediaId: 1, url: "https://instagram.com/updated" }],
  };

  it("should update an announcement successfully", async () => {
    const req = { params: { id: "1" }, body: updateBody };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
    prisma.announcement.update.mockResolvedValue({
      ...mockAnnouncement,
      ...updateBody,
    });

    await announcementController.updateAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success" }),
    );
  });

  it("should return 404 when announcement does not exist", async () => {
    const req = { params: { id: "999" }, body: updateBody };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(null);

    await announcementController.updateAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Announcement not found",
    });
  });

  it("should return 400 when required fields are missing", async () => {
    const req = {
      params: { id: "1" },
      body: { name: "Updated" },
    };
    const res = mockRes();

    await announcementController.updateAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      }),
    );
  });

  it("should return 500 when update throws", async () => {
    const req = { params: { id: "1" }, body: updateBody };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
    prisma.announcement.update.mockRejectedValue(new Error("DB error"));

    await announcementController.updateAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getAnnouncements ───────────────────────────────────────────────────────

describe("getAnnouncements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all announcements", async () => {
    const req = {};
    const res = mockRes();
    const mockList = [mockAnnouncement];

    prisma.announcement.findMany.mockResolvedValue(mockList);

    await announcementController.getAnnouncements(req, res);

    expect(res.send).toHaveBeenCalledWith(mockList);
  });

  it("should return empty array when no announcements exist", async () => {
    const req = {};
    const res = mockRes();

    prisma.announcement.findMany.mockResolvedValue([]);

    await announcementController.getAnnouncements(req, res);

    expect(res.send).toHaveBeenCalledWith([]);
  });

  it("should return 500 when findMany throws", async () => {
    const req = {};
    const res = mockRes();

    prisma.announcement.findMany.mockRejectedValue(new Error("DB error"));

    await announcementController.getAnnouncements(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getAnnouncementById ────────────────────────────────────────────────────

describe("getAnnouncementById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return an announcement by id with formatted socialLinks", async () => {
    const req = { params: { id: "1" } };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);

    await announcementController.getAnnouncementById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        socialLinks: [
          {
            id: 1,
            url: "https://instagram.com/john",
            socialMediaId: 1,
            socialMediaName: "Instagram",
          },
        ],
      }),
    );
  });

  it("should return 404 when announcement is not found", async () => {
    const req = { params: { id: "999" } };
    const res = mockRes();

    prisma.announcement.findUnique.mockResolvedValue(null);

    await announcementController.getAnnouncementById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Announcement not found",
    });
  });

  it("should return 500 when findUnique throws", async () => {
    const req = { params: { id: "1" } };
    const res = mockRes();

    prisma.announcement.findUnique.mockRejectedValue(new Error("DB error"));

    await announcementController.getAnnouncementById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
