import jwt from 'jsonwebtoken';
import { AppError } from './AppError';

interface JwtPayload {
    id: number
}


const jwtVerifyPromisifed = (token: string, secret: string, tokenType: 'access' | 'refresh'): Promise<JwtPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, payload) => {
            if(err){
                if(err.name === 'TokenExpiredError' && tokenType === 'refresh'){
                    return reject(new AppError("Not authorized! Please log in", 403));
                }
                if(err.name === 'TokenExpiredError' && tokenType === 'access'){
                    console.log("token expired");
                    return reject(new AppError("Access token expired!", 401));
                }
                reject(err);
            }else{
                if(!payload || typeof payload ==='string'){
                    return reject(new Error("Invalid token payload"));
                }
                resolve(payload as JwtPayload);
            }
        })
    })
}

export default jwtVerifyPromisifed;