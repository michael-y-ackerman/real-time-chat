import express, { type CookieOptions } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../lib/utils.js";
import { Types } from "mongoose";
import upload from "../lib/multerConfig.js";
import { type Multer } from "multer";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../lib/s3Client.js";

const register = async (req: express.Request, res: express.Response) => {
    const { email, fullName, password } = req.body;

    try { 

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }// 
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })

        if (!newUser) return res.status(400).json({ message: "Invalid user data." });

        const token = generateToken(newUser._id, res);
        
        await newUser.save();

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            avatar: newUser.avatar,
            token: token,
        });

    } catch(error) {
        console.log("Error in register controller: ", (error as Error).message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            token: token,
        });

    } catch(error) {
        console.log("Error in login controller: ", (error as Error).message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const logout = (req: express.Request, res: express.Response) => {
    try {
        res.cookie("jwt", "", {maxAge:0} as CookieOptions)
        res.status(200).json({ message: "Logged out successfully" });
    } catch(error) {
        console.log("Error in logout controller: ", (error as Error).message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

interface MulterRequest extends express.Request {
    user: { _id: Types.ObjectId };
    file: Express.Multer.File & { location: string };
}

const updateAvatar = async (req: express.Request, res: express.Response) => {
    try {
        const multerReq = req as MulterRequest;
        const s3Location = multerReq.file?.location;
        const userId = multerReq.user._id;

        if (!s3Location) {
            return res.status(400).json({ message: "Profile picture upload failed or file missing." });
        }

        const currentUser = await User.findById(userId);
        
        if (currentUser?.avatar) {
            try {
                const oldAvatarUrl = currentUser.avatar;
                const urlObj = new URL(oldAvatarUrl);
                const oldKey = urlObj.pathname.substring(1); // Remove leading slash

                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: oldKey
                }));
                console.log(`Deleted old avatar: ${oldKey}`);
            } catch (err) {
                console.error("Failed to delete old avatar from S3:", err);
                // Don't stop; just log the error
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { avatar: s3Location }, 
            { new: true, select: "-password" }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            avatar: updatedUser.avatar, // The new S3 URL
        });

    } catch(error) {
        console.log("Error in updateAvatar controller: ", (error as Error).message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const checkAuth = (req: express.Request, res: express.Response) => {
    try {
        res.status(200).json(req.user);
    } catch(error) {
        console.log("Error in checkAuth controller: ", (error as Error).message);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export { login, register, logout, updateAvatar, checkAuth };