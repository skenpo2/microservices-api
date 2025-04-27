import UserModel, { UserDocument } from '../models/user.model';
import AccountModel from '../models/account.model';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '../utils/appError';

import { ProviderEnum } from '../enums/account-provider.enum';
import logger from '../utils/logger';
import { verifyOtp } from '../utils/verifyOtp';
import PasswordResetTokenModel from '../models/passwordReset';
import RefreshTokenModel from '../models/refreshToken.model';

export const googleLoginOrCreateAccountService = async (body: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
}) => {
  const { provider, displayName, providerId, picture, email } = body;

  try {
    let user = await UserModel.findOne({ email });
    if (!user) {
      // Create a new user if it doesn't exist
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save();

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
        isVerified: true,
      });
      await account.save();
    }

    return user;
  } catch (error) {}
};
export const registerUserService = async (body: {
  email: string;
  password: string;
  name: string;
}) => {
  const { email, password, name } = body;

  try {
    const isExisting = await UserModel.findOne({ email });
    if (isExisting) {
      throw new BadRequestException('User already exist');
    }

    const user = new UserModel({
      email,
      password,
      name,
    });

    await user.save();

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });

    await account.save();

    return { user };
  } catch (error) {
    logger.error('Error registering new user');
    throw error;
  }
};

export const verifyRegisterOtpService = async (body: {
  email: string;
  code: string;
}) => {
  try {
    const { email, code } = body;

    const account = await AccountModel.findOne({
      provider: ProviderEnum.EMAIL,
      providerId: email,
      isVerified: false,
    });

    if (!account) {
      throw new BadRequestException(
        'Account does not exist or has been verified'
      );
    }

    const validOtp = await verifyOtp(email, code);

    if (!validOtp) {
      throw new Error('Invalid OTP');
    }

    account.isVerified = true;
    await account.save();

    return { account };
  } catch (error) {
    logger.error(`cannot verify OTP ${error}`);
    throw new Error('Verifying register OTP error');
  }
};

export const verifyUserLogin = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  try {
    const account = await AccountModel.findOne({
      provider,
      providerId: email,
      isVerified: true,
    });

    if (!account) {
      throw new NotFoundException('Invalid email or password');
    }
    if (account && account.isVerified === false) {
      throw new UnauthorizedException('Please verify your account');
    }

    const user = await UserModel.findById(account.userId);

    if (!user) {
      throw new NotFoundException('User not found for the given account');
    }

    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user.omitPassword();
  } catch (error) {
    throw error;
  }
};

export const verifyOtpService = async (body: {
  email: string;
  code: string;
}) => {
  try {
    const { email, code } = body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Cannot verify user');
    }

    const validOtp = await verifyOtp(email, code);

    if (!validOtp) {
      throw new Error('Invalid OTP');
    }

    return user.omitPassword();
  } catch (error) {
    logger.error(`cannot verify OTP ${error}`);
    throw new Error('Verifying  OTP error');
  }
};

export const createPasswordResetTokenService = async (user: UserDocument) => {
  try {
    const { email } = user;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); //  expires 5 mins from now

    // Delete any existing Token for this email
    await PasswordResetTokenModel.deleteMany({ email });

    // Save new Token
    await PasswordResetTokenModel.create({ email, expiresAt });
    return { email };
  } catch (error) {
    throw error;
  }
};

export const setNewPasswordService = async ({
  email,
  provider = ProviderEnum.EMAIL,
  password,
}: {
  email: string;
  provider?: string;
  password: string;
}) => {
  try {
    // only a user who created account with email can reset password
    const account = await AccountModel.findOne({
      provider,
      providerId: email,
    });

    if (!account) {
      throw new NotFoundException(
        'Cannot reset for this account or account does not exist'
      );
    }

    const user = await UserModel.findById(account.userId);

    if (!user) {
      throw new NotFoundException('User not found for the given account');
    }
    // set new password for the user
    user.password = password;

    await user.save();

    // delete all password reset token if it exist
    await PasswordResetTokenModel.deleteMany({ email });

    return user.omitPassword();
  } catch (error) {
    throw error;
  }
};

export const verifyRefreshTokenService = async (refreshToken: string) => {
  try {
    const storedToken = await RefreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!storedToken) {
      logger.warn('Invalid refresh token provided');
      throw new BadRequestException('Invalid refresh token');
    }

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn('Invalid or expired refresh token');
      throw new BadRequestException('Invalid  or expired refresh token');
    }

    const user = await UserModel.findById(storedToken.user);

    if (!user) {
      logger.warn('User does not exist');

      throw new NotFoundException('User does not exist');
    }
    //delete the old refresh token
    await RefreshTokenModel.deleteOne({ _id: storedToken._id });

    return user.omitPassword();
  } catch (error) {
    logger.error('Refresh token error occurred', error);
    throw error;
  }
};

export const logOutService = async (refreshToken: string) => {
  try {
    const storedToken = await RefreshTokenModel.findOneAndDelete({
      token: refreshToken,
    });
    if (!storedToken) {
      logger.warn('Invalid refresh token provided');
      throw new NotFoundException('Invalid refresh token');
    }

    logger.info('Refresh token deleted for logout');
    return true;
  } catch (error) {
    logger.error('Error while logging out', error);
    throw error;
  }
};
