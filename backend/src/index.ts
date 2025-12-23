import express from "express";
// import connection from './database-conn';
import { MikroORM, RequestContext } from "@mikro-orm/mysql";
// import { QueryError } from "mysql2";
import cookieParser from 'cookie-parser';
import browseCarsRouter from './routes/browseCar.routes';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import viewCarRouter from './routes/viewCar.routes';
import 'reflect-metadata';
import mikroOrmConfig from "./config/mikro-orm.config";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/AppError";
import cors from 'cors';

const app = express();
const port: string = process.env.PORT ?? '3000';

app.use(cors({
    origin: `${process.env.FRONTEND}`,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());


export let orm: MikroORM;

async function start(){

    orm = await MikroORM.init(mikroOrmConfig);

    app.use((req, res, next) => {
        RequestContext.create(orm.em, next);
    })

    app.use('/browse', browseCarsRouter);

    app.use("/auth", authRouter);
    
    app.use("/profile", userRouter);

    app.use("/view/car", viewCarRouter);

    app.all('/*path', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    app.use(globalErrorHandler);

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });

}

start();

