import jwt, { type SignOptions } from "jsonwebtoken";
import type { Response, CookieOptions } from "express";
import { Types } from "mongoose";

const DEFAULT_EXPIRES_IN = 24 * 60 * 60 * 1000; // 1 day in MS
const DEFAULT_EXPIRATION_STRING = "1d";

export const generateToken = (userId: Types.ObjectId, res: Response) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || "", {
        expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRATION_STRING
    } as SignOptions);

    res.cookie("jwt", token, {
        maxAge: DEFAULT_EXPIRES_IN, // MS
        httpOnly: true, // preveents XSS attacks
        sameSite: "strict", // preveents CSRF attacks
        secure: process.env.NODE_ENV === "production", // only sends cookie over HTTPS
    } as CookieOptions);
    
    return token;
};