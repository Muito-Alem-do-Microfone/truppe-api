import express from "express";
import {
  registerUser,
  confirmEmail,
  resendConfirmationCode,
  loginUser,
  getUserProfile,
} from "../controllers/appUser.controller.js";

const router = express.Router();

export default (app) => {
  // User registration
  router.post("/register", registerUser);

  // Email confirmation
  router.post("/confirm-email", confirmEmail);

  // Resend confirmation code
  router.post("/resend-confirmation", resendConfirmationCode);

  // User login
  router.post("/login", loginUser);

  // Get user profile
  router.get("/profile/:userId", getUserProfile);

  app.use("/api/users", router);
};
