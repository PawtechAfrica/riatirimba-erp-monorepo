import { z } from 'zod';

export const loginCredentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const tokenPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.string(),
  permissions: z.array(z.string()).optional(),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
