import {NextFunction, Request, Response} from 'express';
import { catchAsync } from "../utils/catchAsync";
import { RequestContext } from '@mikro-orm/mysql';
import { AppError } from '../utils/AppError';
import { Tune } from '../entities/Tunes';
import { User } from '../entities/User';
import {Car} from '../entities/Car';
import { validateTuneName } from '../utils/Validator';
import { SavedTunes } from '../entities/SavedTunes';
import { generatePublicURL } from '../utils/PublicURL';
import type { Loaded } from '@mikro-orm/mysql';

const createAndUpdateTune = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const {tune_name, car_id, tuneSettings, tune_id} = req.body;
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

    let tune
    const isUpdate = tune_id ? true : false;
    const created_on = new Date();
    if(isUpdate){
        tune = await em.findOne(Tune, {tune_id, creator});
        if(!tune){
            res.status(404).json({status: "error", message: "Tune doesnt exist!"});
            return;
        }
        if(user_id !== tune.creator?.user_id){
            return next(new AppError('You are not authorized to update this tune', 403));
        }
        tune.tune_name = tune_name;
        tune.updated_on = new Date();
    }else{
        tune = new Tune();
        tune.tune_name = tune_name;
        tune.creator = creator;
        tune.car = car;
        tune.created_on = created_on;
        tune.updated_on = created_on;
        tune.public_url = generatePublicURL();
    }

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
        if(!isUpdate){
            // Add the creator as the first person to save this tune
            const savedTune = new SavedTunes(tune, creator);
            savedTune.saved_on = created_on;
            tune.savedBy.add(savedTune);
        }
        await em.persistAndFlush(tune);
    }catch(error: any){
        if(error.errno == 1062){
            res.status(409).json({status: "error", message: "You have already created a tune with this name"});
            return;
        }
        return next(error);
    }
    
    res.status(isUpdate ? 200: 201).json({
        status: "success", 
        message: isUpdate ? "Tune updated successfully" : "Tune created successfully",
        tune: {
            tune_id: tune.tune_id,
            tune_name: tune.tune_name,
            car_id: car.id,
            created_on: tune.created_on,
            updated_on: tune.updated_on,
            public_url: tune.public_url
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
    
    // First, check if the tune exists
    const tune = await em.findOne(Tune, {tune_id}, {
        populate: ['creator', 'car'],
        fields: [
            'tune_id', 'tune_name', 'created_on', 'resultant_rank', 'public_url',
            'front_tire_pressure', 'rear_tire_pressure', 'final_drive',
            'front_camber', 'rear_camber', 'front_toe', 'rear_toe', 'front_caster',
            'front_arb', 'rear_arb', 'front_spring', 'rear_spring',
            'front_ride_height', 'rear_ride_height', 'front_rebound', 'rear_rebound',
            'front_bump', 'rear_bump', 'front_aero', 'rear_aero',
            'brake_balance', 'brake_pressure',
            'front_diff_accel', 'front_diff_decel', 'rear_diff_accel', 'rear_diff_decel',
            'center_diff_balance',
            'creator.user_id', 'creator.username',
            'car.id', 'car.Year', 'car.image_filename', 'car.Model', 'car.Manufacturer'
        ]
    });

    if (!tune) {
        return next(new AppError('Tune not found', 404));
    }

    // Check if the current user has saved this tune
    const userRef = em.getReference(User, {user_id});
    const savedTune = await em.findOne(SavedTunes, {tune, user: userRef});
    const isSaved = !!savedTune;

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
        isSaved: isSaved,
        public_url: tune.public_url,
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

const getPublicTune = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const public_url = req.params.publicurl;
    if(public_url && public_url.length !== 22){
        return next(new AppError('Invalid public url', 400));
    }

    const em = RequestContext.getEntityManager();
    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }
    
    // First, check if the tune exists
    const tune = await em.findOne(Tune, {public_url}, {
        populate: ['creator', 'car'],
        fields: [
            'tune_id', 'tune_name', 'created_on', 'resultant_rank', 'public_url',
            'front_tire_pressure', 'rear_tire_pressure', 'final_drive',
            'front_camber', 'rear_camber', 'front_toe', 'rear_toe', 'front_caster',
            'front_arb', 'rear_arb', 'front_spring', 'rear_spring',
            'front_ride_height', 'rear_ride_height', 'front_rebound', 'rear_rebound',
            'front_bump', 'rear_bump', 'front_aero', 'rear_aero',
            'brake_balance', 'brake_pressure',
            'front_diff_accel', 'front_diff_decel', 'rear_diff_accel', 'rear_diff_decel',
            'center_diff_balance',
            'creator.user_id', 'creator.username',
            'car.id', 'car.Year', 'car.image_filename', 'car.Model', 'car.Manufacturer'
        ]
    });

    if (!tune) {
        return next(new AppError('Tune not found', 404));
    }

    // Check if the current user has saved this tune
    const userRef = em.getReference(User, {user_id});
    const savedTune = await em.findOne(SavedTunes, {tune, user: userRef});
    const isSaved = !!savedTune;

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
        isSaved: isSaved,
        public_url: tune.public_url,
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

const renameTune = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
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

const removeTune = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
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

const saveTune = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const tune_id = Number(req.params.tuneid);
    
    if(isNaN(tune_id)){
        return next(new AppError('Invalid tune id', 400));
    }

    const em = RequestContext.getEntityManager();
    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }

    // Check if tune exists
    const tune = await em.findOne(Tune, {tune_id});
    if(!tune){
        return next(new AppError('Tune not found', 404));
    }

    const user = em.getReference(User, {user_id});

    // Check if tune is already saved by this user
    const existingSavedTune = await em.findOne(SavedTunes, {tune, user});
    if(existingSavedTune){
        res.status(409).json({status: "error", message: "Tune is already saved"});
        return;
    }

    // Create and save the new SavedTunes entry
    const savedTune = new SavedTunes(tune, user);
    savedTune.saved_on = new Date();
    
    await em.persistAndFlush(savedTune);

    res.status(201).json({
        status: "success",
        message: "Tune saved successfully"
    });
    
});


export {renameTune, removeTune, createAndUpdateTune, getTune, saveTune, getPublicTune};