import z from 'zod';
import { emailSchema } from './auth.validations';

export const codeSchema = z.string().trim().min(6).max(6);

export const otpSchema = z.object({
  code: codeSchema,
  email: emailSchema,
});
