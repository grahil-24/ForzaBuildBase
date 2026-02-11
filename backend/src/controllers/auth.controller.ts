import {NextFunction, Request, Response} from 'express';
import { User } from "../entities/User";
import { RequestContext } from '@mikro-orm/mysql';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { validateEmail, validatePassword, validateUsername } from '../utils/Validator';
import jwtVerifyPromisifed from '../utils/jwtVerifier';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { profile } from 'console';

interface JwtPayload {
    id: number
}

const saltRounds: number = 10;

const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION!;
const JWT_REFRESH_EXPIRATION: string = process.env.JWT_REFRESH_EXPIRATION!;
const JWT_SECRET: string = process.env.JWT_SECRET!;
const secure: boolean = process.env.NODE_ENV === 'production' ? true : false;

const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const signToken = (user_id: number, expires: string): string => {
    return jwt.sign({id: user_id}, JWT_SECRET, {expiresIn: expires as ms.StringValue});
}

export const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const newUser = new User({email: req.body.email, password: req.body.password, username: req.body.username});

    const em = RequestContext.getEntityManager();

    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }
    if(!validateEmail(newUser.email) || !validatePassword(newUser.password) || !validateUsername(newUser.username)){
        return next(new AppError("password or email dont match criteria", 200));
    }

    const fetched_user = await em.findOne(User, {email: newUser.email});
    if(fetched_user){
        return next(new AppError("You have already registered with this email", 400));
    }
    newUser.password = await hashPassword(newUser.password!);
    const result: number = Number(await em.insert(newUser));
    const accessToken = signToken(result, JWT_EXPIRATION);
    const refreshToken = signToken(result, JWT_REFRESH_EXPIRATION);
    res.cookie('refresh_token', refreshToken, {httpOnly: true, sameSite: "strict", secure ,expires: new Date(Date.now() + ms(JWT_REFRESH_EXPIRATION as ms.StringValue))});
    res.status(201).json({status: "success",message: "user created successfully", access_token: accessToken, user: {user_id:result, username: newUser.username, profile_pic: newUser.profile_pic}});
});

export const checkUsername = catchAsync(async (req, res, next) => {
  const em = RequestContext.getEntityManager();
  if (!em) {
    return next(new AppError("Entity manager not available", 500));
  }
  const username: string = req.query.username as string;
  if(!validateUsername(username)){
    return next(new AppError('Invalid username format', 401));
  }

  const user = await em.findOne(User, { username });

  res.status(200).json({
    available: !user,
  });
});

export const login = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void>=>{
    const user: User = new User({email: req.body.email,password: req.body.password});
    const em = RequestContext.getEntityManager();

    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }
    
    const userFromDB = await em.findOne(User, {email: {$eq: user.email}});
    if(!userFromDB){
        return next(new AppError("An account with this email does not exist! Please sign up", 401));
    }
    if(!await bcrypt.compare(user.password!, userFromDB.password!)){
        return next(new AppError("Email or password is incorrect", 401));
    }
    const accessToken = signToken(Number(userFromDB.user_id), JWT_EXPIRATION);
    const refreshToken = signToken(Number(userFromDB.user_id), JWT_REFRESH_EXPIRATION);
    res.cookie('refresh_token', refreshToken, {httpOnly: true, sameSite: "strict", secure, expires: new Date(Date.now() + ms(JWT_REFRESH_EXPIRATION as ms.StringValue))});
    res.status(200).json({status: "success",message: "logged in successfully", access_token: accessToken, user: {user_id:userFromDB.user_id, username: userFromDB.username, profile_pic: user.profile_pic}});       
});

export const logout = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.cookie('refresh_token', "", {httpOnly: true, sameSite: "strict", secure, maxAge: 0});
    res.status(200).json({status: "success", message: "signed out"});
});

export const refresh = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void> => {

    const refreshToken = req.cookies.refresh_token;
    if(!refreshToken){
        return next(new AppError("Refresh token invalid! Log in", 403));
    }
    const decoded = await jwtVerifyPromisifed(refreshToken, JWT_SECRET, 'refresh');
    const newRefreshToken = signToken(decoded.id, JWT_REFRESH_EXPIRATION);
    const newAccessToken = signToken(decoded.id, JWT_EXPIRATION);
    res.cookie('refresh_token', newRefreshToken, {httpOnly: true, sameSite: "strict", secure, expires: new Date(Date.now() + ms(JWT_REFRESH_EXPIRATION as ms.StringValue))});
    res.status(200).json({status: "success", message: "tokens refreshed", access_token: newAccessToken, user: {user_id:decoded.id}});

});

export const verify = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    const accessToken:string | undefined = req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : undefined;
    const refreshToken:string = req.cookies.refresh_token;
    console.log("refresh token ", refreshToken);
    console.log("accessToken ", accessToken);
    if(!accessToken || !refreshToken){
        return next(new AppError("Not authorized! Please log in", 403));
    }else{
        //check if access token is valid and not expired
        try {
            const decoded: JwtPayload = await jwtVerifyPromisifed(accessToken, JWT_SECRET, 'access');
            res.status(200).json({status: "success", message: "Token is valid", user: {user_id: decoded.id}});
        }catch(err){
            //access token is valid but expired. refresh it
            if(err instanceof AppError && err.statusCode == 401){
                try {
                    const decoded: JwtPayload = await jwtVerifyPromisifed(refreshToken, JWT_SECRET, 'refresh');
                    const newAccessToken = signToken(decoded.id, JWT_EXPIRATION);
                    const newRefreshToken = signToken(decoded.id, JWT_REFRESH_EXPIRATION);
                    res.cookie('refresh_token', newRefreshToken, {httpOnly: true, sameSite: "strict", secure, expires: new Date(Date.now() + ms(JWT_REFRESH_EXPIRATION as ms.StringValue))});
                    res.status(200).json({status: "success", access_token: newAccessToken, message: "Token refreshed successfully!", user: {user_id: decoded.id}});
                //refresh token is invalid or expired. log user out
                }catch(refreshTokenErr){
                    return next(refreshTokenErr);
                }
            //access token is invalid. log user out
            }else{
                return next(err);
            }
        }
    }
});




