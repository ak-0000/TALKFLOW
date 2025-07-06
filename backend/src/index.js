// backend/src/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000; // ✅ Define PORT

// Setup dirname (for ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../../client/dist")));

// API routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Safer wildcard route for SPA
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
