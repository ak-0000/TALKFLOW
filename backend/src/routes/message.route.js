// backend/routes/message.route.js
import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { upload } from "../controllers/upload.controller.js";

const router = express.Router();

// 🟢 Get sidebar users (must be first, else ":chatId" will catch it)
router.get("/users", protectRoute, getUsersForSidebar);

// 🟢 Get all messages of a particular chat
router.get("/:chatId", protectRoute, getMessages);

// 🟢 Send message with optional image
router.post("/send", protectRoute, upload.single("image"), sendMessage);

router.stack.forEach((layer) => {
  if (layer.route) {
    console.log("🔹 ROUTE:", layer.route.path);
  }
});


export default router;
