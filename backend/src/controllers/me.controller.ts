import { catchAsync } from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { User } from "../entities/User";
import { SavedTunes } from "../entities/SavedTunes";
import { RequestContext } from "@mikro-orm/core";
import { AppError } from "../utils/AppError";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { validateUsername } from "../utils/Validator";

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY as string,
        secretAccessKey: process.env.R2_SECRET_KEY as string
    }  
})

export const updateUsername = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const newUsername = req.body.new_username;

    if(!validateUsername(newUsername)){
        return next(new AppError('Username must be 4-20 characters and not start with a hyphen', 400));
    }

    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }  

    const user = await em.findOne(User, {user_id});
    if(!user){
        return next(new AppError('User does not exist', 404));
    }
    if(user?.username === newUsername){
        return next(new AppError('Username is the same as current username', 400));
    }
    user!.username = newUsername;
    try {
        await em.persistAndFlush(user);
        res.status(200).json({status: 'success', username: newUsername});
    }catch(error: any){
        if(error.errno === 1062){
            return next(new AppError('Username already exists! Please choose another one', 409));
        }
        return next(new AppError('An unexpected error occurred. Please try again later', 500));
    }

});

export const getPresignedURL = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const image_name = req.body.image_name;
    const file_type = req.body.file_type;
    const presignedURL = await getSignedUrl(S3, 
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET, 
            Key: `profile_pic/${image_name}`,
            ContentType: file_type
        }),
        {expiresIn: 3600}
    )
    res.status(200).json({status:"success", presigned_url: presignedURL});
});

export const getRecentTunes = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = new User({user_id: req.user_id});
    
    const em = RequestContext.getEntityManager();
    if(!em){
        return next(new AppError("Entity manager not available", 500));
    }   

    const savedTunes = await em.find(
    SavedTunes,
    { user },
    { limit: 5, orderBy: { saved_on: 'desc' }, exclude: ['user.user_id']}
    );    
    await em.populate(savedTunes, ['tune', 'tune.creator', 'tune.car'], {
        fields: ['tune.tune_name', 'tune.creator.username', 'tune.creator.profile_pic','tune.creator.profile_pic','tune.car.image_filename', 'tune.car.Manufacturer', 'tune.resultant_rank']
    });
    res.status(200).json(savedTunes);
});

export const me = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user_id: number = req.user_id;

    const em = RequestContext.getEntityManager();

    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }

    const user = await em.findOne(User, {user_id});
    if(!user){
        return next(new AppError('User not found!', 404));
    }

    res.status(200).json({user_id: user.user_id, username: user.username, email: user.email, profile_pic: user.profile_pic});
});


export const updateProfilePicture = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req;
    const {profile_pic, old_profile_pic} = req.body;

    const em = RequestContext.getEntityManager();
    if (!em) {
        return next(new AppError("Entity manager not available", 500));
    }

    const user = em.getReference(User, {user_id});
    em.assign(user, {profile_pic})
    await em.persistAndFlush(user);
    if(old_profile_pic !== 'def.jpg'){
        await S3.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: `profile_pic/${old_profile_pic}`
        }));
    }
    res.status(204).json({status: "success"})
});