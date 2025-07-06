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

// 👇 change send/:id to message/send/:id
router.post("/message/send/:id", protectRoute, upload.single("image"), sendMessage);

// already fixed
router.get("/chat/:id", protectRoute, getMessages);
router.get("/users", protectRoute, getUsersForSidebar);



router.stack.forEach((layer) => {
  if (layer.route) {
    console.log("🔹 ROUTE:", layer.route.path);
  }
});


export default router;
