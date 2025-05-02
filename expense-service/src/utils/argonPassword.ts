import argon2 from 'argon2';
import logger from './logger';

export const hashPassword = async (password: string) => {
  try {
    const hashValue = await argon2.hash(password);

    return hashValue;
  } catch (error) {
    logger.error(`Argon2 hashing error ${(error as Error).message}`);
  }
};

export const comparePassword = async (
  password: string,
  candidatePassword: string
) => await argon2.verify(password, candidatePassword);
