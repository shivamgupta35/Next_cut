// src/routes/userRoutes.ts
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

/* =========================================================
   🔥 CRITICAL: HANDLE CORS PREFLIGHT INSIDE ROUTER
   (THIS FIXES YOUR ERROR)
========================================================= */
userRouter.options("*", (req, res) => {
  res.sendStatus(204);
});

/* =========================================================
   🛠️ HELPERS
========================================================= */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as any).code;
  }
  return undefined;
};

/* =========================================================
   ✅ USER SIGNUP
========================================================= */
userRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ error: "Name and phone number are required." });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits." });
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      return res.status(400).json({
        error: "Phone number must start with 6, 7, 8, or 9.",
      });
    }

    const user = await createUser(name, cleanPhone);

    const token = jwt.sign(
      { sub: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET!,
      { expiresIn: "8h" }
    );

    return res.status(201).json({
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
      return res.status(409).json({ msg: "Phone number already exists" });
    }

    return res.status(500).json({
      msg: "Error occurred during sign up",
      error: getErrorMessage(error),
    });
  }
});

/* =========================================================
   ✅ USER SIGNIN
========================================================= */
userRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits." });
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      return res.status(400).json({
        error: "Phone number must start with 6, 7, 8, or 9.",
      });
    }

    const user = await authenticateUser(cleanPhone);

    if (!user) {
      return res.status(401).json({
        msg: "Phone number not found. Please sign up first.",
      });
    }

    const token = jwt.sign(
      { sub: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET!,
      { expiresIn: "8h" }
    );

    return res.json({
      user,
      msg: "User signed in successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error occurred during sign in",
      error: getErrorMessage(error),
    });
  }
});

/* =========================================================
   ✅ JOIN QUEUE
========================================================= */
userRouter.post(
  "/joinqueue",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { barberId, service } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!barberId) {
        return res.status(400).json({ error: "Barber ID is required" });
      }

      if (!service || typeof service !== "string") {
        return res.status(400).json({
          error: "Service is required and must be a string",
        });
      }

      const queueEntry = await joinQueue(barberId, userId, service);

      return res.json({
        msg: `You have joined the queue for ${service}`,
        queue: queueEntry,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Error joining queue",
        error: getErrorMessage(error),
      });
    }
  }
);

/* =========================================================
   ✅ LEAVE QUEUE
========================================================= */
userRouter.post(
  "/leavequeue",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const result = await removeFromQueue(userId);

      if (!result.success) {
        return res.status(400).json({ msg: result.message });
      }

      return res.json({
        msg: "You have been removed from the queue",
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Error leaving queue",
        error: getErrorMessage(error),
      });
    }
  }
);

/* =========================================================
   ✅ QUEUE STATUS
========================================================= */
userRouter.get(
  "/queue-status",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const queueStatus = await getUserQueueStatus(userId);

      return res.json({
        msg: "Queue status retrieved successfully",
        queueStatus,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Error getting queue status",
        error: getErrorMessage(error),
      });
    }
  }
);

/* =========================================================
   ✅ NEARBY BARBERS
========================================================= */
userRouter.post(
  "/barbers",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { lat, long, radius } = req.body;

      if (!lat || !long) {
        return res.status(400).json({
          error: "Latitude and longitude are required",
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(long);
      const searchRadius = radius ? parseFloat(radius) : 10;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          error: "Invalid latitude or longitude values",
        });
      }

      const barbers = await getBarbersNearby(
        latitude,
        longitude,
        searchRadius
      );

      return res.json({
        barbers,
        msg: `Found ${barbers.length} barbers within ${searchRadius}km`,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Error getting nearby barbers",
        error: getErrorMessage(error),
      });
    }
  }
);

export default userRouter;
