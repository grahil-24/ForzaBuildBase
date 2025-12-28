import { Router } from 'express';
import { getRecentTunes, profile} from '../controllers/user.controller';
import { protect } from '../middlewares/protectRoutes';

const router = Router();

router.use(protect);
router.get('/', profile);
router.get('/recent-tunes', getRecentTunes);

export default router;