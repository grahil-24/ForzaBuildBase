import { catchAsync } from '../utils/catchAsync';
import {NextFunction, Request, Response} from 'express';
import { AppError } from '../utils/AppError';
import jwtVerifyPromisifed from '../utils/jwtVerifier';

const JWT_SECRET: string = process.env.JWT_SECRET!;

export const protect = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
        const decoded_id: number = (await jwtVerifyPromisifed(token, JWT_SECRET,'access')).id;
        req.user_id = decoded_id;
        next();
    }else{
        return next(new AppError("Not authorized! Please log in", 403));
    }
});