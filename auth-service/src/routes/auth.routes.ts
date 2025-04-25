import express from 'express';
import {
  loginController,
  registerUserController,
  verifyRegisterController,
} from '../controllers/auth.controllers';

const router = express.Router();

router.post('/register', registerUserController);
router.post('/verify-register', verifyRegisterController);
router.post('/login', loginController);

export default router;
