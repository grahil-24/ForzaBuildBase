import { catchAsync } from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { User } from "../entities/User";
import { SavedTunes } from "../entities/SavedTunes";
import { RequestContext } from "@mikro-orm/core";
import { AppError } from "../utils/AppError";

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
