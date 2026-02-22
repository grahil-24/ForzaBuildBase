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

export {searchUser};