import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middlewares/catchAsyncError";
import User from "../models/userModel";
import { CustomErrorHandler } from "../utils/CustomErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { sendMail } from "../mails/sendMails";
import mongoose from "mongoose";
import userModel from "../models/userModel";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import {
  ACCESS_TOKEN_EXPIRE_TIME,
  REFRESH_TOKEN_EXPIRE_TIME,
} from "../utils/maxAgeToken";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUserController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, avatar } = req.body as IRegistrationBody;
    try {
      const isEmailExist = await User.findOne({ email });

      if (isEmailExist) {
        return next(new CustomErrorHandler(409, "Email already exist"));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const data = {
        user: { name: user.name },
        activationCode: activationToken.activationCode,
      };

      try {
        await sendMail({
          toAddress: email,
          subject: "Activate your account for Shiksha Sarovar",
          template: "activationMail.ejs",
          data,
        });
        res
          .status(200)
          .jsonResponse(true, 200, `OTP sent to your email ${email}`, {
            token: activationToken.token,
          });
      } catch (error) {
        next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (
  user: IRegistrationBody
): IActivationToken => {
  console.log(
    process.env.JWT_ACTIVATION_SECRET_KEY as string,
    "actiubvrtd.=----"
  );

  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(activationCode);
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.JWT_ACTIVATION_SECRET_KEY as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

interface IActivationRequest {
  token: string;
  activationCode: string;
}

export const activateUserController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, activationCode } = req.body as IActivationRequest;

      if (!token || !activationCode) {
        next(new CustomErrorHandler(401, "Missing authentication data"));
      }
      const newUser: { user: IRegistrationBody; activationCode: string } =
        jwt.verify(token, process.env.JWT_ACTIVATION_SECRET_KEY as Secret) as {
          user: IRegistrationBody;
          activationCode: string;
        };
      if (newUser.activationCode !== activationCode) {
        next(new CustomErrorHandler(403, "Invalid code entered"));
      }

      const { name, email, password } = newUser.user;

      const isEmailExist = await User.findOne({ email });

      if (isEmailExist) {
        return next(new CustomErrorHandler(409, "Email already exist"));
      }

      const verifiedUser = new User({ ...newUser.user });
      verifiedUser._id = new mongoose.Types.ObjectId();
      const response = await verifiedUser.save();
      res.status(201).jsonResponse(true, 201, "Sign up successfull", response);
    } catch (error) {
      next(error);
    }
  }
);

interface ILoginUser {
  email: string;
  password: string;
}
export const loginUserController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { email, password }: ILoginUser = req.body;
      if (!email || !password) {
        return next(new CustomErrorHandler(400, "Please provide all fields"));
      }

      email.trim();
      password.trim();

      const user = await userModel.findOne({ email }).select("+password");
      console.log(user, "user---------------->");

      if (!user) {
        return next(
          new CustomErrorHandler(
            401,
            "Authentication failed. Wrong email or password"
          )
        );
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new CustomErrorHandler(401, "Invalid Password"));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      next(new CustomErrorHandler(error.statusCode, error.message));
    }
  }
);

export const logoutUserController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .cookie("access_token", "", { maxAge: 0 })
        .cookie("refresh_token", "", { maxAge: 0 })
        .status(204)
        .jsonResponse(true, 204, "Signout successfull");
    } catch (error: any) {
      next(new CustomErrorHandler(500, "Internal Server Error"));
    }
  }
);

export const updateAccessTokenController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.JWT_REFRESH_TOKEN as Secret
      ) as JwtPayload;
      if (!decoded) {
        return next(new CustomErrorHandler(400, "Could not refresh token"));
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new CustomErrorHandler(401, "Session expired"));
      }
      const user = JSON.parse(session);
      console.log(user, "user seession from redis-------------");
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_TOKEN as Secret,
        {
          expiresIn: ACCESS_TOKEN_EXPIRE_TIME,
        }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_TOKEN as Secret,
        {
          expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
        }
      );
      res
        .status(200)
        .cookie("access_token", accessToken, accessTokenOptions)
        .cookie("refresh_token", refreshToken, refreshTokenOptions)
        .jsonResponse(true, 200, "success", { accessToken });
    } catch (error: any) {
      next(error);
    }
  }
);

let lastForgotPasswordRequestTime: number | null = null;
export const forgotPasswordController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      lastForgotPasswordRequestTime &&
      new Date().getTime() - lastForgotPasswordRequestTime < 2*60*1000 // 2 minutes
    ) {
      return next(
        new CustomErrorHandler(
          429,
          "Please wait for 2 minutes before making another request"
        )
      );
    }
    let { email }: { email: string } = req.body;

    if (!email) {
      return next(new CustomErrorHandler(400, "All fields are required"));
    }

    email = email.trim();

    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return next(new CustomErrorHandler(404, "User does not exist"));
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_ACCESS_TOKEN + user.password,
        {
          expiresIn: "15m",
        }
      );
      const encodedToken = Buffer.from(token).toString("base64");

      const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password/${user._id}/${encodedToken}`;

      const data = {
        user: { name: user.name },
        resetUrl,
      };

      try {
        await sendMail({
          toAddress: email,
          subject: "Reset your password for Auth App",
          template: "forgotPasswordMail.ejs",
          data,
        });
        lastForgotPasswordRequestTime = new Date().getTime();
        res
          .status(200)
          .jsonResponse(true, 200, `Reset url sent to your email ${email}`, {
            token: encodedToken,
            resetUrl,
          });
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

export const resetPasswordController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let { userId, token } = req.params;
    let { password } = req.body;

    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return next(new CustomErrorHandler(404, "User does not exist"));
      }
      const secret = process.env.JWT_ACCESS_TOKEN + user.password;
      const decodedToken = Buffer.from(token, "base64").toString();
      jwt.verify(decodedToken, secret);

      if (!password) {
        return next(new CustomErrorHandler(400, "Enter the password"));
      }
      password = password.trim();
      if (password === "") {
        return next(new CustomErrorHandler(400, "Password cannot be empty"));
      }
      if (password.includes(" ")) {
        return next(
          new CustomErrorHandler(400, "Password cannot have whitespaces")
        );
      }
      user.save();
      res.status(200).jsonResponse(true, 200, "Password changed successfully");
    } catch (error: any) {
      console.log(error.message);
      next(error);
    }
  }
);

export const resetPasswordValidatorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { userId, token } = req.params;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(new CustomErrorHandler(404, "User does not exist"));
    }

    const secret = process.env.JWT_ACCESS_TOKEN + user.password;
    const decodedToken = Buffer.from(token, "base64").toString();
    jwt.verify(decodedToken, secret);
    res.status(200).jsonResponse(true, 200, "Request is valid");
  } catch (error) {
    next(error);
  }
};
