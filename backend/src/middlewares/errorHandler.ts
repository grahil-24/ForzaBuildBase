import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  // Handle JWT errors
  if (err instanceof JsonWebTokenError) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token. Please log in again.'
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Log unexpected errors
  console.error('ERROR 💥:', err);
  
  // Generic error response
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
}