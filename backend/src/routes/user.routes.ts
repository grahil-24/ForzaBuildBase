import { Router } from 'express';
import { profile } from '../controllers/user.controller';
import { protect } from '../middlewares/protectRoutes';

const router = Router();

router.use(protect);
router.get('/', profile);

export default router;