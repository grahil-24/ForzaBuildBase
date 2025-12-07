import {Request, Response} from 'express';
import { Car } from '../entities/Car';
import { RequestContext } from '@mikro-orm/mysql'; 
import { FilterQuery } from '@mikro-orm/core';

export const getCars = async (req: Request, res: Response): Promise<void> => {
  const filters: FilterQuery<Car> = {};
  const limit: number = 20; 
  const page: number = Number(req.query.page) || 1;
  const offset: number = (page - 1) * limit;
  const search: string | undefined = String(req.query.search);

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
    res.status(500).json({ error: "Entity manager not available" });
    return;
  }
  let cars: Car[] = [];
  let count: number = 0;
  if(!search || search === 'undefined'){
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
  });
}