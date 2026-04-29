import mongoose, { Document, Model, Schema } from "mongoose"

export type UserRole = "user" | "admin"

export interface IUser extends Document {
  name: string
  email: string
  phone?: string
  passwordHash?: string // Optional for phone auth users
  firebaseUid?: string // Firebase UID for phone auth
  isPhoneVerified?: boolean
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      required: function (this: IUser) {
        // Password hash is required only if not using Firebase auth
        return !this.firebaseUid
      },
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models?.User || mongoose.model<IUser>("User", UserSchema)

export default User
