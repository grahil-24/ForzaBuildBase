import express from "express";
// import connection from './database-conn';
import { MikroORM, RequestContext } from "@mikro-orm/mysql";
// import { QueryError } from "mysql2";
import cookieParser from 'cookie-parser';
import browseCarsRouter from './routes/browseCar.routes';
import 'reflect-metadata';
import mikroOrmConfig from "./config/mikro-orm.config";
import cors from 'cors';

const app = express();
const port: string = process.env.PORT ?? '3000';

app.use(cors());
app.use(express.json());
app.use(cookieParser());

export let orm: MikroORM;

async function start(){

    orm = await MikroORM.init(mikroOrmConfig);

    app.use((req, res, next) => {
        RequestContext.create(orm.em, next);
    })

    app.use('/browse', browseCarsRouter);

    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });

}

start();
// connection.connect((err: QueryError | null) => {
//     if(err){
//         console.error(err.message);
//     }
// });

