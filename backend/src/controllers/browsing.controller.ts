import {NextFunction, Request, Response} from 'express';
import { Car } from '../entities/Car';
import { RequestContext } from '@mikro-orm/mysql'; 
import { FilterQuery, IntegerType } from '@mikro-orm/core';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export const getCars = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // console.log("req in get cars ", req);
  const filters: FilterQuery<Car> = {};
  const limit: number = 20; 
  const page: number = Number(req.query.page) || 1;
  const offset: number = (page - 1) * limit;
  const search: string | undefined = req.query.search as string;
  // Helper to parse comma-separated strings into arrays
  const parseArrayParam = (param: unknown): string[] | undefined => {
    if (!param) return undefined;
    if (Array.isArray(param)) return param.map(String);
    return String(param).split(',').map(s => s.trim()).filter(Boolean);
  };

  const manufacturers = parseArrayParam(req.query.manufacturer);
  if (manufacturers?.length) {
    filters.Manufacturer = { $in: manufacturers };
  }

  const drivetrains = parseArrayParam(req.query.drivetrain);
  if (drivetrains?.length) {
    filters.Drivetrain = { $in: drivetrains };
  }

  const fuelTypes = parseArrayParam(req.query.fuel_type);
  if (fuelTypes?.length) {
    filters.FuelType = { $in: fuelTypes };
  }

  const ranks = parseArrayParam(req.query.rank);
  if (ranks?.length) {
    filters.Rank = { $in: ranks };
  }

  const em = RequestContext.getEntityManager();
  if (!em) {
    return next(new AppError("Entity manager not available", 500));
  }
  let cars: Omit<Car, 'Vehicle'>[] = [];
  let count: number = 0;
  if(search === undefined){
    [cars, count] = await em.findAndCount(Car, filters, {
      limit, 
      offset,
      exclude: ['Vehicle']
    });
  }else{
    [cars, count] = await em.findAndCount(Car, {...filters, Vehicle: {$fulltext: search}}, {limit, offset, exclude: ['Vehicle']})
  }
  res.json({ 
    cars, 
    total: count, 
    page, 
    totalPages: Math.ceil(count / limit) 
  })
  
});

export const getCar = catchAsync(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    
  const carId: number = Number(req.params.carId);

  const em = RequestContext.getEntityManager();
  if (!em) {
    return next(new AppError("Entity manager not available", 500));
  }

  const car = await em.findOne(Car, {id: carId as unknown as IntegerType});
  if(!car){
    res.status(404).json({status: "error", message: "Car not found"});
  }else{
    res.status(200).json({status: "success", car});
  }
});