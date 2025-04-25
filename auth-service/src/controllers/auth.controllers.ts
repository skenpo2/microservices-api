import { NextFunction, Request, Response } from 'express';
import AsyncHandler from '../middlewares/asyncHandler';
import { loginSchema, registerSchema } from '../validations/auth.validations';
import { HTTPSTATUS } from '../configs/http.config';
import {
  registerUserService,
  verifyLoginOtpService,
  verifyRegisterOtpService,
  verifyUserLogin,
} from '../services/auth.service';
import { sendOtpEmail } from '../utils/sendOtpEmail';
import logger from '../utils/logger';
import { otpSchema } from '../validations/otp.validations';
import generateJwtToken from '../utils/generateJwt';

export const registerUserController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = registerSchema.parse({ ...req.body });

    const { user } = await registerUserService(body);

    const newUser = { name: user.name, email: user.email };
    await sendOtpEmail(newUser);
    logger.info('Register Otp sent successfully');
    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: 'User created Successfully',
    });
  }
);

export const verifyRegisterController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = otpSchema.parse({ ...req.body });

    await verifyRegisterOtpService(body);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'verification successful',
    });
  }
);

export const loginController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = loginSchema.parse({ ...req.body });

    const user = await verifyUserLogin({ email, password });

    await sendOtpEmail({ name: user.name, email: user.email });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'login OTP sent your email successfully',
    });
  }
);

export const verifyLoginController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = otpSchema.parse({ ...req.body });

      const user = await verifyLoginOtpService(body);

      const { accessToken, refreshToken } = await generateJwtToken(user);

      return res
        .status(HTTPSTATUS.OK)
        .cookie('jwt', refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })
        .json({
          success: true,
          message: 'login successful',
          user,
          accessToken,
        });
    } catch (error) {
      throw error;
    }
  }
);

const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
