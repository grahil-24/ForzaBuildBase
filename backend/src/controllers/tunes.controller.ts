import {NextFunction, Request, Response} from 'express';
import { catchAsync } from "../utils/catchAsync";
import { RawQueryFragment, RequestContext, SmallIntType, UniqueConstraintViolationException } from '@mikro-orm/mysql';
import { AppError } from '../utils/AppError';
import { Tune } from '../entities/Tunes';
import { User } from '../entities/User';
import {Car} from '../entities/Car';
import { validateTuneName } from '../utils/Validator';
import { SavedTunes } from '../entities/SavedTunes';

const create = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const {tune_name, car_id, tuneSettings} = req.body;
    console.log("tuneSettings ", tuneSettings);
    if(!tune_name || !car_id || !tuneSettings) {
        return next(new AppError('Missing required fields: tune_name, car_id, tuneSettings', 400));
    }

    if(!validateTuneName(tune_name)) {
        res.status(422).json({status: 'error', message: 'Tune name needs to be between 3 and 50 characters'});
        return;
    }

    const em = RequestContext.getEntityManager();
    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }

    const creator = em.getReference(User, {user_id});
    const car = em.getReference(Car, car_id);
    // Create new tune
    const tune = new Tune();
    tune.tune_name = tune_name;
    tune.creator = creator;
    tune.car = car;
    tune.created_on = new Date();
    tune.updated_on = new Date();

    // Assign tune settings from request body
    em.assign(tune, {
        front_tire_pressure: tuneSettings.front_tire_pressure,
        rear_tire_pressure: tuneSettings.rear_tire_pressure,
        final_drive: tuneSettings.final_drive,
        front_camber: tuneSettings.front_camber,
        rear_camber: tuneSettings.rear_camber,
        front_toe: tuneSettings.front_toe,
        rear_toe: tuneSettings.rear_toe,
        front_caster: tuneSettings.front_caster,
        front_arb: tuneSettings.front_arb,
        rear_arb: tuneSettings.rear_arb,
        front_spring: tuneSettings.front_spring,
        rear_spring: tuneSettings.rear_spring,
        front_ride_height: tuneSettings.front_ride_height,
        rear_ride_height: tuneSettings.rear_ride_height,
        front_rebound: tuneSettings.front_rebound,
        rear_rebound: tuneSettings.rear_rebound,
        front_bump: tuneSettings.front_bump,
        rear_bump: tuneSettings.rear_bump,
        front_aero: tuneSettings.front_aero,
        rear_aero: tuneSettings.rear_aero,
        brake_balance: tuneSettings.brake_balance,
        brake_pressure: tuneSettings.brake_pressure,
        front_diff_accel: tuneSettings.front_diff_accel,
        front_diff_decel: tuneSettings.front_diff_decel,
        rear_diff_accel: tuneSettings.rear_diff_accel,
        rear_diff_decel: tuneSettings.rear_diff_decel,
        center_diff_balance: tuneSettings.center_diff_balance,
        resultant_rank: tuneSettings.resultant_rank
    });

    try {
        await em.persistAndFlush(tune);
    }catch(error: any){
        if(error.errno == 1062){
            res.status(409).json({status: "error", message: "You have already created a tune with this name"});
            return;
        }
        return next(error);
    }
    

    res.status(201).json({
        status: "success", 
        message: "Tune created successfully",
        tune: {
            tune_id: tune.tune_id,
            tune_name: tune.tune_name,
            car_id: car.id,
            created_on: tune.created_on
        }
    });
});

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


export {rename, remove, create};