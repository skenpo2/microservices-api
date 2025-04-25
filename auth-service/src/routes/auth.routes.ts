import express from 'express';
import {
  loginController,
  registerUserController,
  verifyLoginController,
  verifyRegisterController,
} from '../controllers/auth.controllers';

const router = express.Router();

router.post('/register', registerUserController);
router.post('/verify-register', verifyRegisterController);
router.post('/login', loginController);
router.post('/verify-login', verifyLoginController);

export default router;
