import express from 'express';
import {signUp, login, refresh, verify} from '../controllers/auth.controller';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/login', login);
router.get('/refresh', refresh);
router.get('/verify', verify);

export default router;