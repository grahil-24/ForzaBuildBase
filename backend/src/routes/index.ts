import { Router } from 'express';
import authRouter from './auth.routes';
import browseRouter from './browseCar.routes';
import userRouter from './user.routes';
import viewRouter from './viewCar.routes';
import tuneRouter from './tunes.routes';
import meRouter from './me.routes';
import searchRouter from './search.routes';

const router = Router();

router.use('/browse', browseRouter);
router.use('/auth', authRouter);
router.use('/profile', userRouter);
router.use('/view/car', viewRouter);
router.use('/tune', tuneRouter);
router.use('/me', meRouter);
router.use('/search', searchRouter);

export default router;