import {NextFunction, Request, Response} from 'express';
import { catchAsync } from "../utils/catchAsync";
import { RequestContext } from '@mikro-orm/mysql';
import { AppError } from '../utils/AppError';
import { Tune } from '../entities/Tunes';
import { User } from '../entities/User';
import {Car} from '../entities/Car';
import { validateTuneName } from '../utils/Validator';
import { SavedTunes } from '../entities/SavedTunes';

const create = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const {tune_name, car_id, tuneSettings} = req.body;
    const created_on = new Date();
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
    tune.created_on = created_on;
    tune.updated_on = created_on;

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
        // Add the creator as the first person to save this tune
        const savedTune = new SavedTunes(tune, creator);
        savedTune.saved_on = created_on;
        tune.savedBy.add(savedTune);
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

const getTune = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const tune_id = Number(req.params.tuneid);
    if(isNaN(tune_id)){
        return next(new AppError('Invalid tune id', 400));
    }

    const em = RequestContext.getEntityManager();
    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }
    
    const tuneRef = new Tune(tune_id);
    const userRef = em.getReference(User, {user_id});

    const savedTune = await em.findOne(SavedTunes, {tune: tuneRef, user: userRef}, {
        populate: ['tune.creator', 'tune.car'],
        fields: [
            'tune.tune_id', 'tune.tune_name', 'tune.created_on', 'tune.resultant_rank',
            'tune.front_tire_pressure', 'tune.rear_tire_pressure', 'tune.final_drive',
            'tune.front_camber', 'tune.rear_camber', 'tune.front_toe', 'tune.rear_toe', 'tune.front_caster',
            'tune.front_arb', 'tune.rear_arb', 'tune.front_spring', 'tune.rear_spring',
            'tune.front_ride_height', 'tune.rear_ride_height', 'tune.front_rebound', 'tune.rear_rebound',
            'tune.front_bump', 'tune.rear_bump', 'tune.front_aero', 'tune.rear_aero',
            'tune.brake_balance', 'tune.brake_pressure',
            'tune.front_diff_accel', 'tune.front_diff_decel', 'tune.rear_diff_accel', 'tune.rear_diff_decel',
            'tune.center_diff_balance',
            'tune.creator.user_id', 'tune.creator.username',
            'tune.car.id', 'tune.car.Year', 'tune.car.image_filename', 'tune.car.Model', 'tune.car.Manufacturer'
        ]
    });

    if (!savedTune) {
        return next(new AppError('Tune not found', 404));
    }

    const tune = savedTune.tune;
    res.status(200).json({
        status: 'success',
        car: {
            id: tune.car?.id,
            Year: tune.car?.Year,
            image_filename: tune.car?.image_filename,
            Model: tune.car?.Model,
            Manufacturer: tune.car?.Manufacturer
        },
        tune_name: tune.tune_name,
        created_on: tune.created_on,
        creator: tune.creator?.username,
        class: tune.resultant_rank,
        tune_id: tune.tune_id,
        tune_details: {
            front_tire_pressure: tune.front_tire_pressure,
            rear_tire_pressure: tune.rear_tire_pressure,
            final_drive: tune.final_drive,
            front_camber: tune.front_camber,
            rear_camber: tune.rear_camber,
            front_toe: tune.front_toe,
            rear_toe: tune.rear_toe,
            front_caster: tune.front_caster,
            front_arb: tune.front_arb,
            rear_arb: tune.rear_arb,
            front_spring: tune.front_spring,
            rear_spring: tune.rear_spring,
            front_ride_height: tune.front_ride_height,
            rear_ride_height: tune.rear_ride_height,
            front_rebound: tune.front_rebound,
            rear_rebound: tune.rear_rebound,
            front_bump: tune.front_bump,
            rear_bump: tune.rear_bump,
            front_aero: tune.front_aero,
            rear_aero: tune.rear_aero,
            brake_balance: tune.brake_balance,
            brake_pressure: tune.brake_pressure,
            front_diff_accel: tune.front_diff_accel,
            front_diff_decel: tune.front_diff_decel,
            rear_diff_accel: tune.rear_diff_accel,
            rear_diff_decel: tune.rear_diff_decel,
            center_diff_balance: tune.center_diff_balance
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


export {rename, remove, create, getTune};