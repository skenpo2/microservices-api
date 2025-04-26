import express from 'express';
import {
  getResetPasswordOtpController,
  loginController,
  logoutController,
  refreshTokenController,
  registerUserController,
  setNewPassword,
  verifyLoginController,
  verifyRegisterController,
  verifyResetPasswordOtpController,
} from '../controllers/auth.controllers';

const router = express.Router();

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
