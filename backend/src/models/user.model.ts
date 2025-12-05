import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  fullName: string;
  password: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,

    },
    fullName: {
        type:String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    avatar: {
        type: String,
        default: "",
    },
    }, 
    { timestamps: true });

const User = mongoose.model<IUser>("User", userSchema);

export default User;

