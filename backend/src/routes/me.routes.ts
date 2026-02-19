import { Router } from 'express';
import { getPresignedURL, getRecentTunes, me, updatePassword, updateProfilePicture, updateUsername, deleteAccount} from '../controllers/me.controller';
import { protect } from '../middlewares/protectRoutes';

const router = Router();

router.use(protect);
router.get('/', me);
router.get('/tunes/recent', getRecentTunes);
router.post('/generate-presignedurl', getPresignedURL);
router.put('/update-profile-picture', updateProfilePicture);
router.patch('/update-username', updateUsername);
router.patch('/update-password', updatePassword);
router.delete('/delete', deleteAccount);

export default router;