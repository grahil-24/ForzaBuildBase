import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const globalErrorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response, 
    next: NextFunction
) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }
    console.error('ERROR 💥:', err);

    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
    });
}