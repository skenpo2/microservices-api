import express, { Request, Response } from 'express';
import {
  getResetPasswordOtpController,
  googleCallbackController,
  loginController,
  logoutController,
  refreshTokenController,
  registerUserController,
  setNewPassword,
  verifyLoginController,
  verifyRegisterController,
  verifyResetPasswordOtpController,
} from '../controllers/auth.controllers';
import passport from 'passport';

const router = express.Router();

// Start Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallbackController
);

router.post('/register', registerUserController);
router.post('/verify-register', verifyRegisterController);
router.post('/login', loginController);
router.post('/verify-login', verifyLoginController);
router.post('/reset-password', getResetPasswordOtpController);
router.post('/verify-reset-password', verifyResetPasswordOtpController);
router.post('/set-password', setNewPassword);
router.post('/refresh', refreshTokenController);
router.post('/logout', logoutController);

export default router;
