import { Router } from 'express';
import { getPresignedURL, getRecentTunes, me, updateProfilePicture } from '../controllers/me.controller';
import { protect } from '../middlewares/protectRoutes';

const router = Router();

router.use(protect);
router.get('/', me);
router.get('/tunes/recent', getRecentTunes);
router.post('/generate-presignedurl', getPresignedURL);
router.put('/update-profile-picture', updateProfilePicture);

export default router;