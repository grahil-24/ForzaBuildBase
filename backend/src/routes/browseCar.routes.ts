import express from 'express';

import { getCars } from '../controllers/browsing.controller';
import { protect } from '../controllers/auth.controller';

const router= express.Router();
router.use(protect);
router.get('/', getCars);

export default router;