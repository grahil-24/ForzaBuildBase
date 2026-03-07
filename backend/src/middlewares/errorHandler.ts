import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  // Handle JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token. Please log in again.'
    });
  }

  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      status: 'error',
      message: 'Your session has expired. Please log in again.'
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
    message: 'An unexpected error occurred. Please try again later!',
  });
}