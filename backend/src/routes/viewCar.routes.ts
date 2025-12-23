import {Router} from 'express';

import { getCar } from '../controllers/browsing.controller';
import { protect } from '../middlewares/protectRoutes';

const router= Router();
router.use(protect);
router.get('/:carId', getCar);

export default router;