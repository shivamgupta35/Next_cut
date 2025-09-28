// src/routes/userRoutes.ts - UPDATED VERSION
import express, { Request, Response } from "express";
import {
  createUser,
  authenticateUser,
  joinQueue,
  getBarbersNearby,
  removeFromQueue,
  getUserQueueStatus,
} from "../services/userServices";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { authenticateJWT, AuthenticatedRequest } from "./middleware/auth";

const userRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

// Helper function to check if error has a code property
const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as any).code;
  }
  return undefined;
};

// ✅ User signup
userRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      res.status(400).json({ error: "Name and phone number are required." });
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      res.status(400).json({ error: "Phone number must be exactly 10 digits." });
      return;
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      res.status(400).json({ error: "Phone number must start with 6, 7, 8, or 9." });
      return;
    }

    const user = await createUser(name, cleanPhone);
    const token = jwt.sign(
      { sub: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET!,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
      msg: "User created successfully",
      token,
    });
  } catch (error) {
    if (getErrorCode(error) === "P2002") {
      res.status(409).json({ msg: "Phone number already exists" });
      return;
    }
    res.status(500).json({ msg: "Error occurred during sign up", error: getErrorMessage(error) });
  }
});

// ✅ User signin
userRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({ error: "Phone number is required." });
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      res.status(400).json({ error: "Phone number must be exactly 10 digits." });
      return;
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      res.status(400).json({ error: "Phone number must start with 6, 7, 8, or 9." });
      return;
    }

    const user = await authenticateUser(cleanPhone);

    if (!user) {
      res.status(401).json({ msg: "Phone number not found. Please sign up first." });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET!,
      { expiresIn: "8h" }
    );

    res.json({
      user,
      msg: "User Signed In Successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error occurred during sign in", error: getErrorMessage(error) });
  }
});

// ✅ Join queue with service selection
userRouter.post(
  "/joinqueue",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { barberId, service } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      if (!barberId) {
        res.status(400).json({ error: "Barber ID is required" });
        return;
      }

      if (!service || typeof service !== "string") {
        res.status(400).json({ error: "Service is required and must be a string" });
        return;
      }

      // ✅ No hardcoded validation — accept any string service
      const queueEntry = await joinQueue(barberId, userId, service);

      res.json({
        msg: `You have joined the queue for ${service}`,
        queue: queueEntry,
      });
    } catch (error) {
      res.status(500).json({ msg: "Error joining queue", error: getErrorMessage(error) });
    }
  }
);

// ✅ Leave queue
userRouter.post(
  "/leavequeue",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const result = await removeFromQueue(userId);
      if (!result.success) {
        res.status(400).json({ msg: result.message });
        return;
      }

      res.json({ msg: "You have been removed from the queue", data: result.data });
    } catch (error) {
      res.status(500).json({ msg: "Error leaving queue", error: getErrorMessage(error) });
    }
  }
);

// ✅ Get queue status
userRouter.get(
  "/queue-status",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const queueStatus = await getUserQueueStatus(userId);
      res.json({ msg: "Queue status retrieved successfully", queueStatus });
    } catch (error) {
      res.status(500).json({ msg: "Error getting queue status", error: getErrorMessage(error) });
    }
  }
);

// ✅ Get nearby barbers
userRouter.post(
  "/barbers",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { lat, long, radius } = req.body;
      if (!lat || !long) {
        res.status(400).json({ error: "Latitude and longitude are required" });
        return;
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(long);
      const searchRadius = radius ? parseFloat(radius) : 10;

      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({ error: "Invalid latitude or longitude values" });
        return;
      }

      const barbers = await getBarbersNearby(latitude, longitude, searchRadius);

      res.json({
        barbers,
        msg: `Found ${barbers.length} barbers within ${searchRadius}km`,
      });
    } catch (error) {
      res.status(500).json({ msg: "Error getting nearby barbers", error: getErrorMessage(error) });
    }
  }
);

export default userRouter;
