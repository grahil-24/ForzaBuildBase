import { Router } from 'express';
import { getMyTunes, getUserTunes, profile} from '../controllers/user.controller';
import { protect } from '../middlewares/protectRoutes';

const router = Router();

router.use(protect);
router.get('/', profile);
router.get('/my-tunes', getMyTunes);
router.get('/:user/tunes', getUserTunes);

export default router;