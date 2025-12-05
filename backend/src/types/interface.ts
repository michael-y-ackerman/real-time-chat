import type { Request } from "express";
import { Types } from "mongoose";

export interface MulterRequest extends Request {
    user: { _id: Types.ObjectId };
    file: Express.Multer.File & { location: string };
}
