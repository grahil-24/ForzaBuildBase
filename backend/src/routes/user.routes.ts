import { Router } from 'express';
import { getUserTunes } from '../controllers/user.controller';
import { protect } from '../middlewares/protectRoutes';

const router = Router();

router.use(protect);
router.get('/:user/tunes', getUserTunes);

export default router;