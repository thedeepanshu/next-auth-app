import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole = "USER" | "ADMIN";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minLength: 3,
            maxLength: 120,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },
        emailVerified: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const USER: Model<IUser> =
    mongoose.models.User ||
    mongoose.model<IUser>("User", userSchema);

export default USER;
