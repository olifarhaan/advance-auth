import { NextFunction, Request, Response } from "express";

export const customErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    message = `Resource not found. Invalid ${err.path}`;
    statusCode = 404;
  } else if (err.code === 11000) {
    message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    statusCode = 400;
  } else if (err.name === "JsonWebTokenError") {
    message = `Invalid token`;
    statusCode = 401;
  } else if (err.name === "TokenExpiredError") {
    message = "Session expired. Please login again";
    statusCode = 401;
  }

  res.status(statusCode).jsonResponse(false, statusCode, message);
};
