import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import express from "express";
import type { MulterRequest } from "../types/interface.js";

const getUsersForSidebar = async (req: express.Request, res: express.Response) => {
    try {
        const currUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: currUserId }}).select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error in getUsersForSidebar controller: ", (error as Error).message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMessagesForChat = async (req: express.Request, res: express.Response) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        if (!userToChatId) {
            res.status(400).json({ message: "User id not provided." });
            return;
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ]
        });

        res.status(200).json(messages);

    } catch (error) {
        console.error("Error in getMessagesForChat controller: ", (error as Error).message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const sendMessage = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        let imageUrl: string | undefined;
        
        if (req.file) {
            const multerReq = req as MulterRequest;
            imageUrl = multerReq.file?.location;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch(error) {
        console.error("Error in sendMessage controller: ", (error as Error).message);
        res.status(500).json({ message: "Internal server error" });
    }
}
export { getUsersForSidebar, getMessagesForChat, sendMessage };