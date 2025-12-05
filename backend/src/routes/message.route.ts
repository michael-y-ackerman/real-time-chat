import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessagesForChat, sendMessage } from "../controllers/message.controller.js";
import upload from "../lib/multerConfig.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessagesForChat);

router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);
export default router;