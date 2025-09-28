// src/routes/paymentRoutes.ts
import express, { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { joinQueue } from "../services/userServices"; // <-- to join queue after success
import { authenticateJWT, AuthenticatedRequest } from "./middleware/auth";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ✅ Create order
router.post("/create-order", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert ₹ to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, msg: "Failed to create order" });
  }
});

// ✅ Verify payment + join queue
router.post("/verify-payment", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { order_id, payment_id, signature, barberId, service } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, msg: "User not authenticated" });
    }

    const body = `${order_id}|${payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, msg: "Invalid Razorpay signature" });
    }

    // ✅ Join queue after successful payment
    const queueEntry = await joinQueue(barberId, userId, service);

    res.json({
      success: true,
      msg: "Payment verified & joined queue successfully",
      queue: queueEntry,
    });
  } catch (err) {
    console.error("❌ Payment verification error:", err);
    res.status(500).json({ success: false, msg: "Failed to verify Razorpay payment" });
  }
});

export default router;
