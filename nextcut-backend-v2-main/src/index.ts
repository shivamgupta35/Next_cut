// src/index.ts - NextCut Backend Main Server
import "dotenv/config";
import express from "express";
import cors from "cors";

// Import route modules
import userRouter from "./routes/userRoutes";
import barberRouter from "./routes/barberRoutes";
import paymentRoutes from "./routes/paymentRoutes";

const app = express();

// 🌍 Environment Debug
console.log("=== ENVIRONMENT DEBUG ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT from env:", process.env.PORT);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "Set" : "Not set");
console.log("========================");

// ✅ CORS Configuration
const allowedOrigins = [
  "https://nextcut-seven.vercel.app", // your Vercel frontend
  "https://next-cut-frontend-e6zu.vercel.app", // any other vercel link
  "http://localhost:5173", // local dev
  "http://localhost:3000",
];

// Allow preview builds on Vercel dynamically
const isVercelPreview = (origin?: string) =>
  typeof origin === "string" && /\.vercel\.app$/.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow curl/postman
      if (allowedOrigins.includes(origin) || isVercelPreview(origin)) {
        return callback(null, true);
      }
      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 204,
  })
);

// Handle all preflight requests
app.options("*", (req, res) => res.sendStatus(204));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Health endpoints
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "NextCut API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "NextCut API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ✅ Mount routes
app.use("/user", userRouter);
app.use("/barber", barberRouter);
app.use("/payment", paymentRoutes);

// 🔍 Debug endpoint
app.get("/debug", (req, res) => {
  res.json({
    origin: req.headers.origin,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: "NextCut API Debug Info",
    routes: {
      user: [
        "POST /user/signup - Signup user",
        "POST /user/signin - Signin user",
        "POST /user/joinqueue - Join barber queue",
        "POST /user/leavequeue - Leave queue",
        "GET /user/queue-status - Queue status",
        "POST /user/barbers - Nearby barbers",
      ],
      barber: [
        "POST /barber/signup - Barber signup",
        "POST /barber/signin - Barber signin",
        "GET /barber/queue - Barber queue",
        "POST /barber/remove-user - Remove from queue",
        "GET /barber/stats - Barber stats",
      ],
      payment: [
        "POST /payment/create-order - Create Razorpay order",
        "POST /payment/verify-payment - Verify payment",
      ],
    },
  });
});

// 🧱 Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
      timestamp: new Date().toISOString(),
    });
  }
);

// 🚫 404 fallback
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      user: "/user/*",
      barber: "/barber/*",
      payment: "/payment/*",
      health: "/health",
      debug: "/debug",
    },
    timestamp: new Date().toISOString(),
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
console.log("Attempting to start server on 0.0.0.0:" + PORT);

app.listen(PORT, () => {
  console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Debug: http://localhost:${PORT}/debug`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
