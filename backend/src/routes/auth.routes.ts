import express from 'express';
import {signUp, login, refresh, verify, checkUsername, logout} from '../controllers/auth.controller';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/login', login);
router.get('/refresh', refresh);
router.get('/verify', verify);
router.get('/check-username', checkUsername);
router.get('/logout', logout);

export default router;