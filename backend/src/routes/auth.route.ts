import express from "express";
import { login, register, logout, updateAvatar, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../lib/multerConfig.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.put("/update-avatar", protectRoute, upload.single("profilePic"), updateAvatar);
router.get("/check", protectRoute, checkAuth);
export default router;