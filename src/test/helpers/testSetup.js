import { vi } from "vitest";
import express from "express";

// Global mock Prisma client
let mockPrismaClient = null;

/**
 * Creates a standardized test app with common middleware
 */
export const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  return app;
};

/**
 * Creates mock Prisma client with common methods
 */
export const createMockPrisma = (models = []) => {
  const mockClient = {};

  // Default models that are commonly used
  const defaultModels = [
    "announcement",
    "genre",
    "instrument",
    "tag",
    "tags", // Note: some models use plural form
    "state",
    "appUser",
    "appUserConfirmation",
  ];
  const allModels = [...new Set([...defaultModels, ...models])];

  allModels.forEach((model) => {
    mockClient[model] = {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
    };
  });

  // Add transaction support
  mockClient.$transaction = vi.fn();
  mockClient.$disconnect = vi.fn();

  // Store globally for access in tests
  mockPrismaClient = mockClient;

  return mockClient;
};

/**
 * Get the current mock Prisma client
 */
export const getMockPrisma = () => mockPrismaClient;

/**
 * Setup Prisma mocking for all tests
 */
export const setupPrismaMock = () => {
  // Mock the PrismaClient constructor
  vi.mock("@prisma/client", () => {
    return {
      PrismaClient: vi.fn().mockImplementation(() => {
        if (!mockPrismaClient) {
          mockPrismaClient = createMockPrisma();
        }
        return mockPrismaClient;
      }),
    };
  });
};

/**
 * Mock external services commonly used in tests
 */
export const mockExternalServices = () => {
  // Mock S3 upload
  vi.mock("../services/s3/imageUpload.js", () => ({
    uploadToS3: vi.fn().mockResolvedValue("https://mock-s3-url.com/image.jpg"),
  }));

  // Mock generic email service
  vi.mock("../services/email/sendGenericEmail.js", () => ({
    sendGenericEmail: vi.fn().mockResolvedValue(true),
  }));

  // Mock global fetch for Discord webhooks
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
    text: async () => "OK",
  });

  // Mock console methods to avoid noise in tests
  const consoleSpy = {
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
  };

  return consoleSpy;
};

/**
 * Standard cleanup function for tests
 */
export const cleanupMocks = (consoleSpy) => {
  vi.clearAllMocks();
  if (consoleSpy) {
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
  }
};

/**
 * Creates test data factories for consistent test data
 */
export const testDataFactory = {
  announcement: (overrides = {}) => ({
    id: 1,
    title: "Test Announcement",
    name: "Test User",
    number: "123456789",
    email: "test@example.com",
    age: 25,
    about: "Test about section",
    type: "Musician",
    state: "Test State",
    city: "Test City",
    description: "Test description",
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    genres: [],
    instruments: [],
    tags: [],
    socialLinks: [],
    ...overrides,
  }),

  appUser: (overrides = {}) => ({
    id: 1,
    email: "user@example.com",
    password: "$2b$10$hashedpassword",
    name: "Test User",
    surname: "Test Surname",
    dateOfBirth: new Date("1990-01-01"),
    country: "Brazil",
    state: "São Paulo",
    isEmailConfirmed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    confirmations: [],
    ...overrides,
  }),

  genre: (overrides = {}) => ({
    id: 1,
    name: "Rock",
    ...overrides,
  }),

  instrument: (overrides = {}) => ({
    id: 1,
    name: "Guitar",
    type: "String",
    ...overrides,
  }),

  tag: (overrides = {}) => ({
    id: 1,
    name: "Beginner",
    ...overrides,
  }),

  state: (overrides = {}) => ({
    id: 1,
    name: "California",
    ...overrides,
  }),
};

/**
 * Common assertion helpers
 */
export const assertHelpers = {
  expectValidationError: (response, expectedMessage) => {
    expect(response.status).toBe(400);
    // Handle both "error" and "message" properties
    const errorMessage = response.body.error || response.body.message;
    expect(errorMessage).toBeDefined();
    if (expectedMessage) {
      expect(errorMessage).toContain(expectedMessage);
    }
  },

  expectNotFound: (response, expectedMessage = "not found") => {
    expect(response.status).toBe(404);
    // Handle both "error" and "message" properties
    const errorMessage = response.body.error || response.body.message;
    expect(errorMessage).toBeDefined();
    expect(errorMessage.toLowerCase()).toContain(expectedMessage.toLowerCase());
  },

  expectServerError: (response) => {
    expect(response.status).toBe(500);
    // Handle both "error" and "message" properties
    const errorMessage = response.body.error || response.body.message;
    expect(errorMessage).toBeDefined();
  },

  expectSuccess: (response, expectedData) => {
    expect(response.status).toBeLessThan(400);
    if (expectedData) {
      expect(response.body).toMatchObject(expectedData);
    }
  },
};
