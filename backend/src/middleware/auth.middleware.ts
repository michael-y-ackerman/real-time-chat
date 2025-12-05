import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import User, {type IUser} from "../models/user.model.js";

interface AuthenticatedRequest extends express.Request {
  user?: IUser;
}

const protectRoute = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };
        if (!decoded) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", (error as Error).message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export { protectRoute };