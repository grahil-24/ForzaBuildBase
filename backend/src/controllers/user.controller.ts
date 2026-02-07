import { catchAsync } from '../utils/catchAsync';
import {NextFunction, Request, Response} from 'express';
import { User } from '../entities/User';
import { RequestContext } from '@mikro-orm/core';
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

export const getMyTunes = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = new User({username: req.params.user});
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const cur_user = new User({user_id: req.user_id}); 

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
        fields: ['tune.tune_name', 'tune.creator.username', 'tune.car.image_filename', 'tune.car.Manufacturer', 'tune.car.Model','tune.resultant_rank', 'tune.public_url']
    });
    res.status(200).json({
        pages: savedTunes.items,
        nextCursor: savedTunes.endCursor,
        hasNextPage: savedTunes.hasNextPage,
        totalCount: savedTunes.totalCount
    });
});

export const getUserTunes = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const targetUsername = req.params.user;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const currentUserId = req.user_id;

    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }

    // Find the target user by username
    const targetUser = await em.findOne(User, {username: targetUsername});
    if(!targetUser){
        return next(new AppError('User not found!', 404));
    }
    
    const savedTunes = await em.findByCursor(
        SavedTunes,
        { user: targetUser },
        {
            first: 5,
            after: cursor,
            orderBy: [{ saved_on: 'desc'}],
            exclude: ['user.user_id']
        }
    );
    
    await em.populate(savedTunes.items, ['tune', 'tune.creator', 'tune.car'], {
        fields: ['tune.tune_name', 'tune.creator.username', 'tune.car.image_filename', 'tune.car.Manufacturer', 'tune.car.Model','tune.resultant_rank', 'tune.public_url']
    });

    // Check which tunes are saved by the current user
    const currentUserSavedTuneIds = new Set<number>();
    const currentUserSavedTunes = await em.find(SavedTunes, {user: {user_id: currentUserId}});
    currentUserSavedTunes.forEach(st => {
        if(st.tune.tune_id) currentUserSavedTuneIds.add(st.tune.tune_id);
    });

    // Add isSaved flag to each tune
    const pagesWithSaveStatus = savedTunes.items.map(item => ({
        ...item,
        isSaved: item.tune.tune_id ? currentUserSavedTuneIds.has(item.tune.tune_id) : false
    }));

    res.status(200).json({
        pages: pagesWithSaveStatus,
        nextCursor: savedTunes.endCursor,
        hasNextPage: savedTunes.hasNextPage,
        totalCount: savedTunes.totalCount
    });
});