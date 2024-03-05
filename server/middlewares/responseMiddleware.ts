import { NextFunction, Request, Response } from "express";

// Extend the Response interface to include the jsonResponse property
declare global {
  namespace Express {
    interface Response {
      jsonResponse: (
        success: boolean,
        statusCode: number,
        message: string,
        data?: object | null
      ) => Response;
    }
  }
}

interface JsonResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: object | null;
}

const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.jsonResponse = (
    success: boolean,
    statusCode: number,
    message: string,
    data: object | null = null
  ) => {
    const response: JsonResponse = { success, statusCode, message };

    if (data !== null) {
      response.data = data;
    }

    return res.json(response);
  };

  next();
};

export default responseMiddleware;
