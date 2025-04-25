import UserModel from '../models/user.model';
import AccountModel from '../models/account.model';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '../utils/appError';

import { ProviderEnum } from '../enums/account-provider.enum';
import logger from '../utils/logger';
import { verifyOtp } from '../utils/verifyOtp';

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

export const verifyLoginOtpService = async (body: {
  email: string;
  code: string;
}) => {
  try {
    const { email, code } = body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(
        'Account does not exist or has been verified'
      );
    }

    const validOtp = await verifyOtp(email, code);

    if (!validOtp) {
      throw new Error('Invalid OTP');
    }

    return user.omitPassword();
  } catch (error) {
    logger.error(`cannot verify OTP ${error}`);
    throw new Error('Verifying register OTP error');
  }
};
