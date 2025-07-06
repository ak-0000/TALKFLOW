// backend/routes/auth.route.js
import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import { upload, uploadImageToCloudinary } from "../controllers/upload.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);

// Image upload & profile update
router.put("/upload-profile", protectRoute, upload.single("image"), uploadImageToCloudinary);
router.put("/update-profile", protectRoute, updateProfile);


router.stack.forEach((layer) => {
  if (layer.route) {
    console.log("🔹 ROUTE:", layer.route.path);
  }
});


export default router;
