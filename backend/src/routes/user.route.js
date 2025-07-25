import express from "express"
import { allUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.get("/",protectRoute ,allUsers);


export default router ;