import {NextFunction, Request, Response} from 'express';
import { User } from "../entities/User";
import { RequestContext } from '@mikro-orm/mysql'; 
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { validateEmail, validatePassword } from '../utils/Validator';
import jwt from 'jsonwebtoken';
import type {StringValue} from 'ms';

const saltRounds = 10;

const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const signToken = (user_id: number, expires: string): string => {
    return jwt.sign({id: user_id}, process.env.JWT_SECRET!, {expiresIn: expires as StringValue});
}

export const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const newUser = new User(req.body.email, req.body.password);

    const em = RequestContext.getEntityManager();

    if (!em) {
        throw new AppError("Entity manager not available", 500);
    }
    if(!validateEmail(newUser.email) || !validatePassword(newUser.password)){
        throw new AppError("password or email dont match criteria", 200);
    }

    const fetched_user = await em.findOne(User, {email: newUser.email});
    if(fetched_user){
        throw new AppError("You have already registered with this email", 400);
    }
    newUser.password = await hashPassword(newUser.password);
    const result: number = Number((await em.insert(newUser)).user_id);
    const accessToken = signToken(result, process.env.JWT_EXPIRATION!);
    const refreshToken = signToken(result, process.env.JWT_REFRESH_EXPIRATION!);
    res.cookie('refresh_token', refreshToken, {httpOnly: true, sameSite: "strict"});
    res.status(201).json({status: "success",message: "user created successfully", access_token: accessToken});
});






