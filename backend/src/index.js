import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";

const __dirname = path.resolve();
dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser()); // Middleware to parse cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin

    credentials: true, // Allow cookies to be sent with requests
  })
); // Middleware to enable CORS

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
