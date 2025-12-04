import express from 'express';

import { getCars } from '../controllers/browsing.controller';

const router= express.Router();

router.get('/', getCars);

export default router;