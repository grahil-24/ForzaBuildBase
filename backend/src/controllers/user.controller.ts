import { catchAsync } from '../utils/catchAsync';
import {NextFunction, Request, Response} from 'express';
import { User } from '../entities/User';
import { EnsureRequestContext, RequestContext, SmallIntType, Type, UnknownType } from '@mikro-orm/core';
import { AppError } from '../utils/AppError';
import { SavedTunes } from '../entities/SavedTunes';

export const profile = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user_id: number = req.user_id;

    const em = RequestContext.getEntityManager();

    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }

    const user = await em.findOne(User, {user_id});
    if(!user){
        return next(new AppError('User not found!', 404));
    }

    res.status(200).json({user_id: user.user_id, username: user.username});
});

export const getRecentTunes = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = new User({user_id: req.user_id});
    
    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }   

    const savedTunes = await em.find(
    SavedTunes,
    { user },
    { limit: 5, orderBy: { saved_on: 'desc' }, exclude: ['user.user_id']}
    );    
    await em.populate(savedTunes, ['tune', 'tune.creator', 'tune.car'], {
        fields: ['tune.tune_name', 'tune.creator.username', 'tune.car.image_filename', 'tune.car.Manufacturer', 'tune.resultant_rank']
    });
    res.status(200).json(savedTunes);
});

export const getMyTunes = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = new User({user_id: req.user_id});
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    
    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }   
    
    const savedTunes = await em.findByCursor(
        SavedTunes,
        { user },
        {
            first: 5,
            after: cursor,
            orderBy: [{ saved_on: 'desc'}],
            exclude: ['user.user_id']
        }
    );
    
    await em.populate(savedTunes.items, ['tune', 'tune.creator', 'tune.car'], {
        fields: ['tune.tune_name', 'tune.creator.username', 'tune.car.image_filename', 'tune.car.Manufacturer', 'tune.car.Model','tune.resultant_rank']
    });

    res.status(200).json({
        pages: savedTunes.items,
        nextCursor: savedTunes.endCursor,
        hasNextPage: savedTunes.hasNextPage,
        totalCount: savedTunes.totalCount
    });
});