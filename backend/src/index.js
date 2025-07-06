// backend/src/index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";

import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
try {
  app.use("/api/auth", authRoutes);
  console.log("✅ Mounted /api/auth");
} catch (err) {
  console.error("❌ Error mounting /api/auth:", err);
}

try {
  app.use("/api/messages", messageRoutes);
  console.log("✅ Mounted /api/messages");
} catch (err) {
  console.error("❌ Error mounting /api/messages:", err);
}

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}


function logRoutes(app) {
  console.log("\n🔍 Registered Routes:");
  app._router.stack
    .filter((r) => r.route)
    .forEach((r) => {
      console.log(
        `[${Object.keys(r.route.methods).join(",").toUpperCase()}] ${r.route.path}`
      );
    });
}

logRoutes(app); // call after app.use()s



// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  connectDB();
});
