import express from 'express';
import {signUp, login, forgotPassword, verifyResetLink, resetPassword, refresh, verify, checkUsername, logout, verifyEmail, resendVerifyMail} from '../controllers/auth.controller';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/login', login);
router.get('/refresh', refresh);
router.get('/verify', verify);
router.get('/check-username', checkUsername);
router.get('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-mail', resendVerifyMail);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-link', verifyResetLink);
router.post('/reset-password', resetPassword);

export default router;