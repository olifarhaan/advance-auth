import mongoose, { Document, Model, Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import emailRegexPattern from "../utils/emailRegEx";
import {
  ACCESS_TOKEN_EXPIRE_TIME,
  REFRESH_TOKEN_EXPIRE_TIME,
} from "../utils/maxAgeToken";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
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
          return emailRegexPattern.test(value);
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
  },
  { timestamps: true }
);

userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_TOKEN as Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRE_TIME,
  });
};

userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_TOKEN as Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
  });
};

userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcryptjs.compareSync(enteredPassword, this.password);
};

userSchema.pre<IUser>("save", async function name(next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = bcryptjs.hashSync(this.password, 10);
  next();
});

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
export { IUser };
