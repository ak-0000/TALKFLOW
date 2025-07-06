import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { upload } from "../controllers/upload.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

// ✅ Use multer middleware to handle "image" field from FormData
router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);

export default router;
