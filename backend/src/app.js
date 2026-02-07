import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import documentRoutes from "./routes/document.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);

// ✅ Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES - Yeh line pehle aani chahiye routes se
// Agar tumhara uploads folder ROOT mein hai (backend ke bahar)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Agar uploads folder backend ke andar hai
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log("📂 Uploads folder path:", path.join(__dirname, "../uploads"));

// ✅ Health Check
app.get("/", (req, res) => {
  res.json({
    message: "DocuLens AI Backend API",
    version: "1.0.0",
    status: "running",
    port: process.env.PORT || 3001,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/",
      documents: "/documents",
      analytics: "/analytics",
      chat: "/chat",
      chatHistory: "/chat/history",
      uploads: "/uploads",
    },
  });
});


// ✅ API Routes
app.use("/documents", documentRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/chat", chatRoutes);


// ✅ 404 Handler
app.use((req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method,
    availableRoutes: ["/documents", "/analytics", "/chat", "/chat/history"],
  });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

export default app;
