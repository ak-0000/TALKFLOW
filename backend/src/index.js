// backend/src/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; // ✅ Add this
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Setup dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Add these middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Catch-all route for SPA
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
