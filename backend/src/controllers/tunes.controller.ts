import {NextFunction, Request, Response} from 'express';
import { catchAsync } from "../utils/catchAsync";
import { RequestContext, SmallIntType } from '@mikro-orm/mysql';
import { AppError } from '../utils/AppError';
import { Tune } from '../entities/Tunes';

const rename = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const tuneid = Number(req.params.tuneid);
    const newName = req.body.name;
    if(isNaN(tuneid)){
        return next(new AppError('Invalid tune id', 400));
    }
    const em = RequestContext.getEntityManager();
    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }

    const tune: Tune | null = await em.findOne(Tune, {tune_id: tuneid as unknown as SmallIntType})
    if(!tune){
        return next(new AppError('Tune does not exist', 404));
    }
    if(user_id !== tune.creator.user_id as unknown as number){
        return next(new AppError('You are not authorized to rename this tune', 403));
    }
    em.assign(tune, {tune_name: newName});
    await em.flush();
    res.status(200).json({status: "success", message: "name of tune updated successfully"});
});

export {rename};