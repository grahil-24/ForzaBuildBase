import { catchAsync } from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";

const healthCheck = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    res.status(200).send('Ok');
});

export {healthCheck};