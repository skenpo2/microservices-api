import { NextFunction, Request, Response } from 'express';
import AsyncHandler from '../middlewares/asyncHandler';
import {
  emailSchema,
  loginSchema,
  registerSchema,
} from '../validations/auth.validations';
import { HTTPSTATUS } from '../configs/http.config';
import {
  createPasswordResetTokenService,
  logOutService,
  registerUserService,
  setNewPasswordService,
  verifyOtpService,
  verifyRefreshTokenService,
  verifyRegisterOtpService,
  verifyUserLogin,
} from '../services/auth.service';
import { sendOtpEmail } from '../utils/sendOtpEmail';
import logger from '../utils/logger';
import { otpSchema } from '../validations/otp.validations';
import generateJwtToken from '../utils/generateJwt';
import UserModel from '../models/user.model';

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
    const body = otpSchema.parse({ ...req.body });

    const user = await verifyOtpService(body);

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
  }
);

export const getResetPasswordOtpController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = emailSchema.parse({ ...req.body });
    const user = await UserModel.findOne({ email: email, isActive: true });

    if (user) {
      await sendOtpEmail(user);
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'Check your email to continue',
    });
  }
);

export const verifyResetPasswordOtpController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = otpSchema.parse({ ...req.body });

    const user = await verifyOtpService(body);
    const { email } = await createPasswordResetTokenService(user);

    if (!email) {
      logger.warn(`Cannot verify otp code for: ${body.email}`);
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: 'Expired of Invalid Otp',
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'Set new password',
    });
  }
);

export const setNewPassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = loginSchema.parse({ ...req.body });

    const user = await setNewPasswordService(body);
    if (!user) {
      logger.warn(`Cannot reset password for: ${body.email}`);
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: ' Cannot reset password, account type does not support this',
      });
    }
    logger.info(`Password reset successful for ${body.email}`);
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
        message: 'password reset successful',
        user,
        accessToken,
      });
  }
);

export const refreshTokenController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      logger.warn('Refresh token missing');
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: 'Refresh token missing',
      });
    }
    const token = cookies.jwt as string;
    const user = await verifyRefreshTokenService(token);

    if (!user) {
      logger.warn(`Cannot get refresh token`);
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: ' Cannot verify token, kindly log in again',
      });
    }
    logger.info('Refresh token verified ');
    // generate new tokens for user
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
        accessToken,
      });
  }
);

export const logoutController = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      logger.warn('Refresh token missing');
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: 'Refresh token missing',
      });
    }
    const token = cookies.jwt as string;

    await logOutService(token);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'Logged out successfully!',
    });
  }
);
