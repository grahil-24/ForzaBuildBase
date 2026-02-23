import {NextFunction, Request, Response} from 'express';
import { catchAsync } from "../utils/catchAsync";
import { RequestContext } from '@mikro-orm/core';
import { AppError } from '../utils/AppError';
import { User } from '../entities/User';
import { Tune } from '../entities/Tunes';
import { raw } from '@mikro-orm/core';

const searchUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = req.query.user;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }

    if (!user || typeof user !== 'string') {
        return next(new AppError("Invalid or missing 'user' query parameter", 400));
    }

    const users = await em.findByCursor(
        User,
        { $or: [
            { [raw(`levenshtein(LOWER(username), LOWER(?))`, [user])]: { $lte: 3 } },
            { username: { $like: `%${user}%` } }
        ]},
        {
            first: 5,
            after: cursor,
            orderBy: [{ username: 'asc' }],
            exclude: ['email', 'password']
        }
    );
    res.status(200).json({...users, nextCursor: users.endCursor});
});

const searchTunes = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const tune = req.query.tune;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }

    if (!tune || typeof tune !== 'string') {
        return next(new AppError("Invalid or missing 'tune' query parameter", 400));
    }

    const tunes = await em.findByCursor(
        Tune,
        {tune_name: {$fulltext: tune}},
        {
            first: 5,
            after: cursor,
            orderBy: [{ tune_name: 'asc' }],
             exclude: ['public_url',
            'front_tire_pressure', 'rear_tire_pressure', 'final_drive',
            'front_camber', 'rear_camber', 'front_toe', 'rear_toe', 'front_caster',
            'front_arb', 'rear_arb', 'front_spring', 'rear_spring',
            'front_ride_height', 'rear_ride_height', 'front_rebound', 'rear_rebound',
            'front_bump', 'rear_bump', 'front_aero', 'rear_aero',
            'brake_balance', 'brake_pressure',
            'front_diff_accel', 'front_diff_decel', 'rear_diff_accel', 'rear_diff_decel',
            'center_diff_balance', 'updated_on']
        }
    );

    await em.populate(tunes.items, ['creator', 'car'], {
        fields: ['tune_name', 'resultant_rank', 'public_url', 'created_on', 'creator.username', 'creator.profile_pic', 'car.Manufacturer', 'car.Model', 'car.image_filename']
    });

    res.status(200).json({...tunes, nextCursor: tunes.endCursor});
});

export {searchUser, searchTunes};