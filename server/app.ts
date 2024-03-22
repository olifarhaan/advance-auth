import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { customErrorHandlerMiddleware } from "./middlewares/customErrorHandlerMiddleware";
import responseMiddleware from "./middlewares/responseMiddleware";
import authRouter from "./routes/authRoutes";
import postRouter from "./routes/postRoutes";
import commentRouter from "./routes/commentRoutes";
import cryptoRouter from "./routes/cryptoRoutes";

export const app = express();
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({ origin: FRONTEND_BASE_URL }));
app.use(responseMiddleware);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Server is running...",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/crypto", cryptoRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as any;
  error.statusCode = 404;
  next(error);
});

app.use(customErrorHandlerMiddleware);
