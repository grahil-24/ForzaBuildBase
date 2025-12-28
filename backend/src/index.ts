import express from "express";
import { MikroORM, RequestContext } from "@mikro-orm/mysql";
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import mikroOrmConfig from "./config/mikro-orm.config";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/AppError";
import cors from 'cors';
import router from "./routes";

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

    app.use(router);

    app.all('/*path', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    app.use(globalErrorHandler);

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });

}

start();

