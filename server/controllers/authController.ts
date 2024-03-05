import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middlewares/catchAsyncError";
import User from "../models/userModel";
import { CustomErrorHandler } from "../utils/CustomErrorHandler";
import jwt, { Secret } from "jsonwebtoken";
import { sendMail } from "../mails/sendMails";
import mongoose from "mongoose";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUserController = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, avatar } = req.body as IRegistrationBody;
    console.log(process.env.JWT_SECRET_KEY, "jwt decret key");
    

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
