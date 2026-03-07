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
import AdminJS from "adminjs";
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMikroORM from '@adminjs/mikroorm';
import { User } from './entities/User';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';


AdminJS.registerAdapter({
    Resource: AdminJSMikroORM.Resource,
    Database: AdminJSMikroORM.Database
})

const app = express();
app.enable('trust proxy');
const port: string = process.env.PORT ?? '3000';

app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        return next();  // Skip Helmet for AdminJS
    }
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
            }
        }
    })(req, res, next);
});

app.use(cors({
    origin: `${process.env.FRONTEND}`,
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: {
        error: 'Too many requests, please try again later'
    }
})

app.use(limiter);
app.use(cookieParser());
app.use(express.json());

export let orm: MikroORM;

async function start(){
    orm = await MikroORM.init(mikroOrmConfig);

    const MySQLStoreSession = MySQLStore(session);
    const sessionStore = new MySQLStoreSession({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        clearExpired: true,
        checkExpirationInterval: 900000, // 15 minutes
        expiration: 86400000, // 24 hours
        createDatabaseTable: true, // Automatically create sessions table
        schema: {
            tableName: 'sessions',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        }
    });
    
    const adminOptions = {
        resources: [
            {
                resource: { model: User, orm },
                options: {
                    id: 'user_id',
                    properties: {
                        user_id: {
                            isVisible: { list: true, filter: true, show: true, edit: false }
                        },
                        password: { isVisible: false },
                        verification_code: { isVisible: false },
                        reset_token: { isVisible: false },
                        reset_token_expires_at: { isVisible: false },
                        reset_token_created_at: { isVisible: false },
                        expires_at: {isVisible: false},
                        created_at: {isVisible: false}
                    }
                }
            }
        ]
    }
    
    const admin = new AdminJS(adminOptions);
    
    // Session configuration for AdminJS
    const sessionSecret: string = process.env.ADMIN_SESSION_SECRET!;
    
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate: async (email, password) => {
                const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
                const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
                
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
                }
                return null;
            },
            cookieName: 'adminjs',
            cookiePassword: sessionSecret,
        },
        null,
        {
            store: sessionStore,
            resave: false,
            saveUninitialized: true,
            secret: sessionSecret,
            cookie: {
                httpOnly: true,
                secure: true, // Always true on Render
                sameSite: 'lax', // Changed from 'none' - same domain doesn't need 'none'
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                path: '/admin' // Scope cookie to admin routes only
            },
            name: 'adminjs',
            proxy: true
        }
    );
    
    app.use(admin.options.rootPath, adminRouter);
    
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
        console.log(`AdminJS started on http://localhost:${port}${admin.options.rootPath}`)
    });
}

start();