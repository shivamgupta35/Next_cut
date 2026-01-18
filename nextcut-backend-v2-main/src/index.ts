// src/index.ts - NextCut Backend Main Server
import "dotenv/config";
import express from "express";
import cors from "cors";

// Import route modules
import userRouter from "./routes/userRoutes";
import barberRouter from "./routes/barberRoutes";
import paymentRoutes from "./routes/paymentRoutes";

const app = express();

/* =========================================================
   🌍 ENVIRONMENT DEBUG
========================================================= */
console.log("=== ENVIRONMENT DEBUG ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT from env:", process.env.PORT);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "Set" : "Not set");
console.log("========================");

/* =========================================================
   ✅ SINGLE, CORRECT CORS CONFIG (FIXED)
========================================================= */
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server tools (Postman, curl)
    if (!origin) return callback(null, true);

    if (
      origin === "https://nextcut-seven.vercel.app" ||
      origin === "https://next-cut-frontend-e6zu.vercel.app" ||
      origin.startsWith("http://localhost") ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    console.warn("❌ CORS blocked:", origin);
    return callback(null, true); // do NOT block preflight
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 CRITICAL FIX

/* =========================================================
   📦 BODY PARSERS
========================================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================================================
   🏥 HEALTH CHECKS
========================================================= */
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

/* =========================================================
   🧪 CORS TEST
========================================================= */
app.get("/cors-test", (req, res) => {
  res.json({
    origin: req.headers.origin,
    message: "CORS working ✅",
    time: new Date().toISOString(),
  });
});

/* =========================================================
   🚏 ROUTES
========================================================= */
app.use("/user", userRouter);
app.use("/barber", barberRouter);
app.use("/payment", paymentRoutes);

/* =========================================================
   🧾 DEBUG
========================================================= */
app.get("/debug", (req, res) => {
  res.json({
    origin: req.headers.origin,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: "NextCut API Debug Info",
  });
});

/* =========================================================
   🧱 ERROR HANDLER
========================================================= */
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
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

/* =========================================================
   🚫 404 FALLBACK
========================================================= */
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   🚀 START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;
console.log("Attempting to start server on 0.0.0.0:" + PORT);

app.listen(PORT, () => {
  console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
