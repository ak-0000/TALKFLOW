import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChats,
  removeFromGroup,
  renameGroup,
  updateGroupLogo,
  deleteGroup,
  leaveGroup,
  getChatById
} from "../controllers/chat.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer(); // for handling multipart/form-data

router.post("/", protectRoute, accessChat);
router.get("/", protectRoute, fetchChats);
router.get("/:chatId", protectRoute, getChatById);
router.post("/group", protectRoute, createGroupChat);
router.put("/rename", protectRoute, renameGroup);
router.put("/groupadd", protectRoute, addToGroup);
router.put("/groupremove", protectRoute, removeFromGroup);

// ✅ NEW routes
router.put("/leave/:chatId" , protectRoute , leaveGroup)
router.put("/group-logo", protectRoute, upload.single("groupLogo"), updateGroupLogo);
router.delete("/:id", protectRoute, deleteGroup);

export default router;
