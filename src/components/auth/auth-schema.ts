import { z } from 'zod';

// Schema dla logowania
export const loginSchema = z.object({
  email: z.string().email({ message: 'Nieprawidłowy format adresu e-mail' }),
  password: z.string().min(1, { message: 'Hasło jest wymagane' }),
});

// Schema dla rejestracji
export const registerSchema = z
  .object({
    email: z.string().email({ message: 'Nieprawidłowy format adresu e-mail' }),
    password: z.string().min(6, { message: 'Hasło musi mieć minimum 6 znaków' }),
    confirmPassword: z.string().min(1, { message: 'Potwierdzenie hasła jest wymagane' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;


