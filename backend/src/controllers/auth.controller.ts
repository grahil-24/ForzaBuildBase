import {NextFunction, Request, Response} from 'express';
import { User } from "../entities/User";
import { RequestContext } from '@mikro-orm/mysql'; 
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { validateEmail, validatePassword } from '../utils/Validator';
import jwt from 'jsonwebtoken';
import ms from 'ms';

interface JwtPayload {
    id: string;
}

const saltRounds: number = 10;

const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION!;
const JWT_REFRESH_EXPIRATION: string = process.env.JWT_REFRESH_EXPIRATION!;
const JWT_SECRET: string = process.env.JWT_SECRET!;

const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const signToken = (user_id: number, expires: string): string => {
    return jwt.sign({id: user_id}, JWT_SECRET, {expiresIn: expires as ms.StringValue});
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
    const accessToken = signToken(result, JWT_EXPIRATION);
    const refreshToken = signToken(result, JWT_REFRESH_EXPIRATION);
    res.cookie('refresh_token', refreshToken, {httpOnly: true, sameSite: "strict", expires: new Date(Date.now() + ms(JWT_REFRESH_EXPIRATION as ms.StringValue))});
    res.status(201).json({status: "success",message: "user created successfully", access_token: accessToken});
});

export const login = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void>=>{
    const user: User = new User(req.body.email, req.body.password);

    const em = RequestContext.getEntityManager();

    if (!em) {
        throw new AppError("Entity manager not available", 500);
    }
    if(!validateEmail(user.email) || !validatePassword(user.password)){
        throw new AppError("password or email dont match criteria", 200);
    }
    const userFromDB = await em.findOne(User, {email: {$eq: user.email}});
    if(!userFromDB){
        throw new AppError("Email or password is incorrect", 401);
    }
    if(!await bcrypt.compare(user.password, userFromDB.password)){
        throw new AppError("Email or password is incorrect", 401);
    }
    const accessToken = signToken(Number(userFromDB.user_id), JWT_EXPIRATION);
    const refreshToken = signToken(Number(userFromDB.user_id), JWT_REFRESH_EXPIRATION);
    res.cookie('refresh_token', refreshToken, {httpOnly: true, sameSite: "strict", expires: new Date(Date.now() + ms(JWT_REFRESH_EXPIRATION as ms.StringValue))});
    res.status(200).json({status: "success",message: "logged in successfully", access_token: accessToken});
});

export const protect = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user_id = Number(decoded.id);
        next();
    }else{
        throw new AppError("Not authorized! Please log in", 401);
    }
});





