import {Request, Response} from 'express';
import { Car } from '../entities/Car';
import { RequestContext } from '@mikro-orm/mysql'; 
import { FilterQuery } from '@mikro-orm/core';


export const getCars = async (req: Request, res: Response): Promise<void> => {
    const filters: FilterQuery<Car> = {};
    const limit: number = 20; 
    const page: number = Number(req.query.page) || 1;
    const offset: number = (page - 1) * limit;
    
    if(req.query.manufacturer) {
        const manufacturers = Array.isArray(req.query.manufacturer) 
            ? req.query.manufacturer.map(String)
            : [String(req.query.manufacturer)];
        filters.Manufacturer = { $in: manufacturers };
    }
    
    if(req.query.drivetrain) {
        const drivetrains = Array.isArray(req.query.drivetrain) 
            ? req.query.drivetrain.map(String)
            : [String(req.query.drivetrain)];
        filters.Drivetrain = { $in: drivetrains };
    }
    
    if(req.query.fuel_type) {
        const fuelTypes = Array.isArray(req.query.fuel_type) 
            ? req.query.fuel_type.map(String)
            : [String(req.query.fuel_type)];
        filters.FuelType = { $in: fuelTypes };
    }
    
    if(req.query.rank) {
        const ranks = Array.isArray(req.query.rank) 
            ? req.query.rank.map(String)
            : [String(req.query.rank)];
        filters.Rank = { $in: ranks };
    }
    
    const em = RequestContext.getEntityManager();
    
    if (!em) {
        res.status(500).json({ error: "Entity manager not available" });
        return;
    }
    
    const [cars, count] = await em.findAndCount(Car, filters, {
        limit, 
        offset
    });
    
    res.json({ cars, total: count, page, totalPages: Math.ceil(count / limit) });
}