// backend/src/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; // ✅ Add this
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.routes.js";
import cors from "cors";
const PORT = process.env.PORT || 5000;

// Setup dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Add these middlewares

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ no '*', must match frontend
    credentials: true, // ✅ allow sending cookies
  })
);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Catch-all route for SPA
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
