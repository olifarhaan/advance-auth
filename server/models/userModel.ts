import mongoose, { Document, Schema } from "mongoose";
import bcryptjs from "bcryptjs";

export const emailRegexPattern: RegExp =
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: mongoose.Schema.Types.ObjectId }>;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema= new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return;
          emailRegexPattern.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Your password must be at least 6 characters"],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function name(next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = bcryptjs.hashSync(this.password, 10);
  next();
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
