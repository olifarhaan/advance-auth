import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "./catchAsyncError";
import { CustomErrorHandler } from "../utils/CustomErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { IUser } from "../models/userModel";

const isAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(new CustomErrorHandler(401, "You are not logged in"));
    }
    try {
      const decoded = jwt.verify(
        access_token,
        process.env.JWT_ACCESS_TOKEN as Secret
      ) as JwtPayload;
      if (!decoded) {
        return next(new CustomErrorHandler(403, "Invalid access token"));
      }
      const user = await redis.get(decoded.id);
      if (!user) {
        return next(new CustomErrorHandler(400, "User not found"));
      }
      req.user = JSON.parse(user);
      next();
    } catch (error: any) {
      next(error);
    }
  }
);

export { isAuthenticated };
