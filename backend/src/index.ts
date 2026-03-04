import express from "express";
import { MikroORM, RequestContext } from "@mikro-orm/mysql";
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import mikroOrmConfig from "./config/mikro-orm.config";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/AppError";
import cors from 'cors';
import router from "./routes";
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit'

const app = express();
const port: string = process.env.PORT ?? '3000';

app.use(helmet());
app.use(cors({
    origin: `${process.env.FRONTEND}`,
    credentials: true
}));

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive,
    message: {
        error: 'Too many requests, please try again later'
    }
})

// Apply the rate limiting middleware to all requests.
app.use(limiter);
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
        console.log(`app listening on port ${port}`);
    });

}

start();

