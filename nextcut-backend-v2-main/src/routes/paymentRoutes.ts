/**
 * src/routes/paymentRoutes.ts
 * Safe payment routes — every code path returns a response.
 */
import express, { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { joinQueue } from "../services/userServices"; // existing service
import { authenticateJWT, AuthenticatedRequest } from "./middleware/auth";

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay keys are not configured. Payment endpoints will fail without them.");
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * Body: { amount: number }  // amount in rupees (number)
 */
router.post(
  "/create-order",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { amount } = req.body ?? {};

      // Validate amount
      if (amount === undefined || amount === null) {
        return res.status(400).json({ success: false, msg: "Missing 'amount' in request body" });
      }

      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, msg: "Invalid 'amount' value" });
      }

      // Convert rupees to paise (smallest currency unit)
      const amountPaise = Math.round(parsedAmount * 100);

      // Ensure Razorpay keys exist
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res
          .status(500)
          .json({ success: false, msg: "Payment gateway not configured (missing keys)" });
      }

      const options = {
        amount: amountPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      };

      const order = await razorpay.orders.create(options);

      // Return order object to client
      return res.status(201).json({ success: true, order });
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      return res.status(500).json({ success: false, msg: "Failed to create order" });
    }
  }
);

/**
 * POST /api/payments/verify-payment
 * Body: { order_id, payment_id, signature, barberId, service }
 * Verifies signature then joins queue.
 */
router.post(
  "/verify-payment",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { order_id, payment_id, signature, barberId, service } = req.body ?? {};
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, msg: "User not authenticated" });
      }

      if (!order_id || !payment_id || !signature) {
        return res
          .status(400)
          .json({ success: false, msg: "Missing required fields: order_id, payment_id, signature" });
      }

      if (!RAZORPAY_KEY_SECRET) {
        return res
          .status(500)
          .json({ success: false, msg: "Payment verification not configured (missing secret)" });
      }

      // Verify signature
      const body = `${order_id}|${payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, msg: "Invalid Razorpay signature" });
      }

      // All good — join queue (ensure joinQueue returns value or throws)
      try {
        const queueEntry = await joinQueue(barberId, userId, service);
        return res.status(200).json({
          success: true,
          msg: "Payment verified & joined queue successfully",
          queue: queueEntry,
        });
      } catch (joinErr) {
        console.error("Error joining queue after payment:", joinErr);
        // If joinQueue fails, return a clear response
        return res
          .status(500)
          .json({ success: false, msg: "Payment verified but failed to join queue" });
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      return res.status(500).json({ success: false, msg: "Failed to verify Razorpay payment" });
    }
  }
);

export default router;
