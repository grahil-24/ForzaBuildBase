import {NextFunction, Request, Response} from 'express';
import { catchAsync } from "../utils/catchAsync";
import { RequestContext, SmallIntType } from '@mikro-orm/mysql';
import { AppError } from '../utils/AppError';
import { Tune } from '../entities/Tunes';
import { User } from '../entities/User';
import { validateTuneName } from '../utils/Validator';
import { SavedTunes } from '../entities/SavedTunes';

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

    const tune: Tune | null = await em.findOne(Tune, {tune_id: tuneid})
    if(!tune){
        return next(new AppError('Tune does not exist', 404));
    }
    if(user_id !== tune.creator?.user_id){
        return next(new AppError('You are not authorized to rename this tune', 403));
    }
    if(!validateTuneName(newName)){
        res.status(422).json({status: 'error', message: 'Name needs to be in between 3 and 50 chars'});
        return;
    }
    const user = new User({user_id});
    if(await em.findOne(Tune, {creator: user, tune_name: newName})){
        res.status(409).json({status: "error", message: "You have already created a tune with this name"});
    }else{
        em.assign(tune, {tune_name: newName});
        await em.flush();
        res.status(200).json({status: "success", message: "name of tune updated successfully"});
    }    
});

const remove = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const tuneid = Number(req.params.tuneid);
    if(isNaN(tuneid)){
        return next(new AppError('Invalid tune id', 400));
    }
    const em = RequestContext.getEntityManager();
    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }
    const tune = new Tune(tuneid);
    const savedTune = new SavedTunes(tune, new User({user_id}));
    const result: SavedTunes | null = await em.findOne(SavedTunes, savedTune);
    if(!result){
        return next(new AppError('Tune does not exist', 404));
    } 
    await em.populate(result, ['tune.creator.user_id'], {fields: ['tune.creator.user_id']});
    if(user_id === result.tune.creator?.user_id){
        await em.removeAndFlush(tune);
    }else{
        await em.removeAndFlush(savedTune);
    }
    res.status(204).json({status: "success", "message": "Tune deleted successfully"});
});


export {rename, remove};