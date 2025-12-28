import { catchAsync } from '../utils/catchAsync';
import {NextFunction, Request, Response} from 'express';
import { User } from '../entities/User';
import { RequestContext, SmallIntType, Type, UnknownType } from '@mikro-orm/core';
import { AppError } from '../utils/AppError';
import { SavedTunes } from '../entities/SavedTunes';
import { Tune } from '../entities/Tunes';

export const profile = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user_id: number = req.user_id;

    const em = RequestContext.getEntityManager();

    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }

    const user = await em.findOne(User, {user_id: user_id as unknown as SmallIntType});
    if(!user){
        return next(new AppError('User not found!', 404));
    }

    res.status(200).json({user_id: user.user_id, username: user.username});
});

export const getRecentTunes = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = new User({user_id: req.user_id as unknown as SmallIntType});
    
    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }

    const savedTunes = await em.find(SavedTunes, {user}, {orderBy: {saved_on: 'desc'}, limit: 5});
    await em.populate(savedTunes, ['tune'], {fields: ['tune.tune_name']});
    res.status(200).json(savedTunes);
});