import { Schema, model, Document } from "mongoose"

export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN" | "MANAGER"
export type AuthProvider = "LOCAL" | "GOOGLE"
export interface IUser extends Document {
    name?: string
    email: string
    role: UserRole
    phone?: string
    password?: string
    refreshToken?: string
    lastLoginAt?: Date
    walletBalance: number
    // loyaltyPoints?: number // Commented out in dashboard design
    avatar?: string
    authProvider: AuthProvider
    isBlocked: boolean
    isVerified: boolean
    createdAt: Date
    updatedAt: Date
}

const userSchema = new Schema<IUser>({
    name: { type: String, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["CUSTOMER", "PROVIDER", "ADMIN", "MANAGER"],
        default: "CUSTOMER",
    },
    phone: { type: String, trim: true },
    password: { type: String },
    refreshToken: { type: String },
    lastLoginAt: { type: Date },
    walletBalance: { type: Number, default: 0 },
    avatar: { type: String },
    authProvider: {
        type: String,
        enum: ["LOCAL", "GOOGLE"],
        default: "LOCAL",
    },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }
}, {
    timestamps: true,
})

export const User = model<IUser>("User", userSchema)