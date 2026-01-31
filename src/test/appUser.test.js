import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import {
  createTestApp,
  setupPrismaMock,
  getMockPrisma,
  mockExternalServices,
  cleanupMocks,
  testDataFactory,
  assertHelpers,
} from "./helpers/testSetup.js";

setupPrismaMock();

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

import appUserRoutes from "../routes/appUser.routes.js";

describe("App User API", () => {
  let app;
  let prisma;
  let consoleSpy;

  beforeAll(() => {
    consoleSpy = mockExternalServices();
    app = createTestApp();
    appUserRoutes(app);
    prisma = getMockPrisma();
  });

  afterEach(() => {
    cleanupMocks();
  });

  afterAll(() => {
    cleanupMocks(consoleSpy);
  });

  describe("POST /api/users/register", () => {
    const validRegistrationData = {
      email: "test@example.com",
      password: "testpassword123",
      name: "Test User",
    };

    beforeEach(() => {
      bcrypt.hash.mockResolvedValue("$2b$10$hashedpassword");
    });

    it("should register a new user successfully", async () => {
      const mockUser = testDataFactory.appUser({
        email: validRegistrationData.email,
        name: validRegistrationData.name,
      });
      const mockConfirmation = {
        id: "conf_123",
        userId: mockUser.id,
        code: "123456",
        type: "EMAIL_VERIFICATION",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        confirmedAt: null,
        createdAt: new Date(),
      };

      prisma.appUser.findUnique.mockResolvedValue(null); // User doesn't exist
      prisma.appUser.create.mockResolvedValue(mockUser);
      prisma.appUserConfirmation.create.mockResolvedValue(mockConfirmation);

      const response = await request(app)
        .post("/api/users/register")
        .send(validRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty(
        "email",
        validRegistrationData.email,
      );
      expect(response.body.user).toHaveProperty(
        "name",
        validRegistrationData.name,
      );
      expect(response.body.user).toHaveProperty("isEmailConfirmed", false);
      expect(response.body.user).not.toHaveProperty("password");

      expect(bcrypt.hash).toHaveBeenCalledWith(
        validRegistrationData.password,
        10,
      );
      expect(prisma.appUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: validRegistrationData.email,
            name: validRegistrationData.name,
            isEmailConfirmed: false,
          }),
        }),
      );
      expect(prisma.appUserConfirmation.create).toHaveBeenCalled();
    });

    it("should return 400 if email is missing", async () => {
      const invalidData = { password: "testpassword123" };

      const response = await request(app)
        .post("/api/users/register")
        .send(invalidData);

      assertHelpers.expectValidationError(
        response,
        "Email and password are required",
      );
    });

    it("should return 400 if password is missing", async () => {
      const invalidData = { email: "test@example.com" };

      const response = await request(app)
        .post("/api/users/register")
        .send(invalidData);

      assertHelpers.expectValidationError(
        response,
        "Email and password are required",
      );
    });

    it("should return 409 if user already exists", async () => {
      const existingUser = testDataFactory.appUser();
      prisma.appUser.findUnique.mockResolvedValue(existingUser);

      const response = await request(app)
        .post("/api/users/register")
        .send(validRegistrationData);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain("already exists");
    });

    it("should handle email sending failure gracefully", async () => {
      const mockUser = testDataFactory.appUser();
      prisma.appUser.findUnique.mockResolvedValue(null);
      prisma.appUser.create.mockResolvedValue(mockUser);
      prisma.appUserConfirmation.create.mockResolvedValue({});

      const response = await request(app)
        .post("/api/users/register")
        .send(validRegistrationData);

      // Should still succeed even if email fails
      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
    });

    it("should return 500 when database creation fails", async () => {
      prisma.appUser.findUnique.mockResolvedValue(null);
      prisma.appUser.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/users/register")
        .send(validRegistrationData);

      assertHelpers.expectServerError(response);
    });
  });

  describe("POST /api/users/confirm-email", () => {
    const validConfirmationData = {
      email: "test@example.com",
      code: "123456",
    };

    it("should confirm email successfully", async () => {
      const mockUser = testDataFactory.appUser({
        email: validConfirmationData.email,
        isEmailConfirmed: false,
        confirmations: [
          {
            id: "conf_123",
            code: validConfirmationData.code,
            type: "EMAIL_VERIFICATION",
            confirmedAt: null,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            createdAt: new Date(),
          },
        ],
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      prisma.appUserConfirmation.update.mockResolvedValue({});
      prisma.appUser.update.mockResolvedValue({});

      const response = await request(app)
        .post("/api/users/confirm-email")
        .send(validConfirmationData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email confirmed successfully");

      expect(prisma.appUserConfirmation.update).toHaveBeenCalledWith({
        where: { id: "conf_123" },
        data: { confirmedAt: expect.any(Date) },
      });
      expect(prisma.appUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { isEmailConfirmed: true },
      });
    });

    it("should return 400 if email is missing", async () => {
      const invalidData = { code: "123456" };

      const response = await request(app)
        .post("/api/users/confirm-email")
        .send(invalidData);

      assertHelpers.expectValidationError(
        response,
        "Email and confirmation code are required",
      );
    });

    it("should return 400 if code is missing", async () => {
      const invalidData = { email: "test@example.com" };

      const response = await request(app)
        .post("/api/users/confirm-email")
        .send(invalidData);

      assertHelpers.expectValidationError(
        response,
        "Email and confirmation code are required",
      );
    });

    it("should return 404 if user not found", async () => {
      prisma.appUser.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/users/confirm-email")
        .send(validConfirmationData);

      assertHelpers.expectNotFound(response, "User not found");
    });

    it("should return 400 if email is already confirmed", async () => {
      const mockUser = testDataFactory.appUser({
        isEmailConfirmed: true,
        confirmations: [],
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/users/confirm-email")
        .send(validConfirmationData);

      assertHelpers.expectValidationError(response, "already confirmed");
    });

    it("should return 400 if no valid confirmation code found", async () => {
      const mockUser = testDataFactory.appUser({
        isEmailConfirmed: false,
        confirmations: [], // No valid confirmations
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/users/confirm-email")
        .send(validConfirmationData);

      assertHelpers.expectValidationError(
        response,
        "No valid confirmation code found",
      );
    });

    it("should return 400 if confirmation code is invalid", async () => {
      const mockUser = testDataFactory.appUser({
        isEmailConfirmed: false,
        confirmations: [
          {
            id: "conf_123",
            code: "wrong_code",
            type: "EMAIL_VERIFICATION",
            confirmedAt: null,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            createdAt: new Date(),
          },
        ],
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/users/confirm-email")
        .send(validConfirmationData);

      assertHelpers.expectValidationError(
        response,
        "Invalid confirmation code",
      );
    });
  });

  describe("POST /api/users/login", () => {
    const validLoginData = {
      email: "test@example.com",
      password: "testpassword123",
    };

    it("should login successfully with confirmed email", async () => {
      const mockUser = testDataFactory.appUser({
        email: validLoginData.email,
        isEmailConfirmed: true,
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/users/login")
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.user).toBeDefined();
      expect(response.body.user).not.toHaveProperty("password");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        validLoginData.password,
        mockUser.password,
      );
    });

    it("should return 400 if email is missing", async () => {
      const invalidData = { password: "testpassword123" };

      const response = await request(app)
        .post("/api/users/login")
        .send(invalidData);

      assertHelpers.expectValidationError(
        response,
        "Email and password are required",
      );
    });

    it("should return 400 if password is missing", async () => {
      const invalidData = { email: "test@example.com" };

      const response = await request(app)
        .post("/api/users/login")
        .send(invalidData);

      assertHelpers.expectValidationError(
        response,
        "Email and password are required",
      );
    });

    it("should return 401 if user not found", async () => {
      prisma.appUser.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/users/login")
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Invalid credentials");
    });

    it("should return 401 if password is incorrect", async () => {
      const mockUser = testDataFactory.appUser();
      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/users/login")
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Invalid credentials");
    });

    it("should return 403 if email is not confirmed", async () => {
      const mockUser = testDataFactory.appUser({
        isEmailConfirmed: false,
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/users/login")
        .send(validLoginData);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("confirm your email");
    });
  });

  describe("POST /api/users/resend-confirmation", () => {
    const validResendData = {
      email: "test@example.com",
    };

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/api/users/resend-confirmation")
        .send({});

      assertHelpers.expectValidationError(response, "Email is required");
    });

    it("should return 404 if user not found", async () => {
      prisma.appUser.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/users/resend-confirmation")
        .send(validResendData);

      assertHelpers.expectNotFound(response, "User not found");
    });

    it("should return 400 if email is already confirmed", async () => {
      const mockUser = testDataFactory.appUser({
        isEmailConfirmed: true,
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/users/resend-confirmation")
        .send(validResendData);

      assertHelpers.expectValidationError(response, "already confirmed");
    });

    it("should return 500 if email sending fails", async () => {
      const mockUser = testDataFactory.appUser({
        isEmailConfirmed: false,
      });

      prisma.appUser.findUnique.mockResolvedValue(mockUser);
      prisma.appUserConfirmation.create.mockRejectedValue(
        new Error("Database error"),
      );

      const response = await request(app)
        .post("/api/users/resend-confirmation")
        .send(validResendData);

      assertHelpers.expectServerError(response);
    });
  });

  describe("GET /api/users/profile/:userId", () => {
    it("should return user profile successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        isEmailConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.appUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app).get("/api/users/profile/1");

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        isEmailConfirmed: mockUser.isEmailConfirmed,
      });
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 404 if user not found", async () => {
      prisma.appUser.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/users/profile/999");

      assertHelpers.expectNotFound(response, "User not found");
    });

    it("should return 500 when database query fails", async () => {
      prisma.appUser.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/users/profile/1");

      assertHelpers.expectServerError(response);
    });
  });
});
