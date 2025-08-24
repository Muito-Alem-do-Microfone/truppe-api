import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendGenericEmail } from "../services/email/sendGenericEmail.js";

const prisma = new PrismaClient();

// Generate a random 6-digit confirmation code
const generateConfirmationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password, name, surname, dateOfBirth, country, state } =
      req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate date of birth if provided
    let parsedDateOfBirth = null;
    if (dateOfBirth) {
      parsedDateOfBirth = new Date(dateOfBirth);
      if (isNaN(parsedDateOfBirth.getTime())) {
        return res.status(400).json({ error: "Invalid date of birth format" });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.appUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.appUser.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        surname: surname || null,
        dateOfBirth: parsedDateOfBirth,
        country: country || null,
        state: state || null,
        isEmailConfirmed: false,
      },
    });

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create confirmation record
    await prisma.appUserConfirmation.create({
      data: {
        userId: user.id,
        code: confirmationCode,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    // Send confirmation email
    try {
      await sendGenericEmail({
        to: email,
        subject: "Confirm your email address",
        html: `
          <h2>Welcome to Truppe!</h2>
          <p>Please confirm your email address by using this code:</p>
          <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center; font-family: monospace;">${confirmationCode}</h3>
          <p>This code will expire in 24 hours.</p>
        `,
        name: name || "",
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the registration if email fails
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message:
        "User registered successfully. Please check your email for confirmation code.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Confirm email with code
const confirmEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ error: "Email and confirmation code are required" });
    }

    // Find user
    const user = await prisma.appUser.findUnique({
      where: { email },
      include: {
        confirmations: {
          where: {
            type: "EMAIL_VERIFICATION",
            confirmedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailConfirmed) {
      return res.status(400).json({ error: "Email is already confirmed" });
    }

    const confirmation = user.confirmations[0];
    if (!confirmation) {
      return res
        .status(400)
        .json({ error: "No valid confirmation code found" });
    }

    if (confirmation.code !== code) {
      return res.status(400).json({ error: "Invalid confirmation code" });
    }

    // Update confirmation as confirmed
    await prisma.appUserConfirmation.update({
      where: { id: confirmation.id },
      data: { confirmedAt: new Date() },
    });

    // Update user as email confirmed
    await prisma.appUser.update({
      where: { id: user.id },
      data: { isEmailConfirmed: true },
    });

    res.json({ message: "Email confirmed successfully" });
  } catch (error) {
    console.error("Email confirmation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Resend confirmation code
const resendConfirmationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.appUser.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailConfirmed) {
      return res.status(400).json({ error: "Email is already confirmed" });
    }

    // Generate new confirmation code
    const confirmationCode = generateConfirmationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create new confirmation record
    await prisma.appUserConfirmation.create({
      data: {
        userId: user.id,
        code: confirmationCode,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    // Send confirmation email
    try {
      await sendGenericEmail({
        to: email,
        subject: "Confirm your email address",
        html: `
          <h2>Email Confirmation</h2>
          <p>Please confirm your email address by using this code:</p>
          <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center; font-family: monospace;">${confirmationCode}</h3>
          <p>This code will expire in 24 hours.</p>
        `,
        name: user.name || "",
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      return res
        .status(500)
        .json({ error: "Failed to send confirmation email" });
    }

    res.json({ message: "Confirmation code sent successfully" });
  } catch (error) {
    console.error("Resend confirmation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await prisma.appUser.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is confirmed
    if (!user.isEmailConfirmed) {
      return res
        .status(403)
        .json({ error: "Please confirm your email before logging in" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.appUser.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        dateOfBirth: true,
        country: true,
        state: true,
        isEmailConfirmed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  registerUser,
  confirmEmail,
  resendConfirmationCode,
  loginUser,
  getUserProfile,
};
