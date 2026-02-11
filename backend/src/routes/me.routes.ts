import { Router } from 'express';
import { getRecentTunes, me } from '../controllers/me.controller';
import { protect } from '../middlewares/protectRoutes';

const router = Router();

router.use(protect);
router.get('/', me);
router.get('/tunes/recent', getRecentTunes);

export default router;