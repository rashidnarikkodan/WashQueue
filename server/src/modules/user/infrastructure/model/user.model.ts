import { AUTH_PROVIDER, AuthProvider } from "@/common/constants/authProvider"
import { ROLE, RoleType } from "@/common/constants/role.constants"
import { Schema, model, Document } from "mongoose"

export interface IUser extends Document {
  name?: string
  email: string
  role: RoleType
  phone?: string
  password?: string
  refreshToken?: string
  lastLoginAt?: Date
  walletBalance: number
  avatar?: string
  authProvider: AuthProvider
  isBlocked: boolean
  isVerified: boolean
  bookmarks: string[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
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
      enum: [ROLE.CUSTOMER, ROLE.OWNER, ROLE.ADMIN, ROLE.MANAGER],
      default: ROLE.CUSTOMER,
    },
    phone: { type: String, trim: true },
    password: { type: String },
    refreshToken: { type: String },
    lastLoginAt: { type: Date },
    walletBalance: { type: Number, default: 0 },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    authProvider: {
      type: String,
      enum: [AUTH_PROVIDER.LOCAL, AUTH_PROVIDER.GOOGLE],
      default: AUTH_PROVIDER.LOCAL,
    },
    isBlocked: { type: Boolean, default: false },
    bookmarks: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
)

export const User = model<IUser>("User", userSchema)
