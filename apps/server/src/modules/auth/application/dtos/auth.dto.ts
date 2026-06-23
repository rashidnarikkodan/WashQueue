import { z } from 'zod';

// ─── Register ────────────────────────────────────────────────────────────────

export const RegisterInputSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type RegisterInputDTO = z.infer<typeof RegisterInputSchema>;

export interface RegisterOutputDTO {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

// ─── Login ───────────────────────────────────────────────────────────────────

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInputDTO = z.infer<typeof LoginInputSchema>;

export interface LoginOutputDTO {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
}
