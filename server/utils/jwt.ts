require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/userModel";
import { redis } from "./redis";
import { ACCESS_TOKEN_EXPIRE_TIME, REFRESH_TOKEN_EXPIRE_TIME } from "./maxAgeToken";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE_TIME),
  maxAge: ACCESS_TOKEN_EXPIRE_TIME,
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_TIME),
  maxAge: REFRESH_TOKEN_EXPIRE_TIME,
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  redis.set(user._id, JSON.stringify(user));
  res
    .cookie("access_token", accessToken, accessTokenOptions)
    .cookie("refresh_token", refreshToken, refreshTokenOptions)
    .status(statusCode)
    .jsonResponse(true, statusCode, "Sign in successfull", {
      user,
      accessToken,
    });
};

export { sendToken, accessTokenOptions, refreshTokenOptions };
