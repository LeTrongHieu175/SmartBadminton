import { z } from 'zod';

const usernameRegex = /^[A-Za-z0-9_]+$/;
const fullNameRegex = /^[A-Za-zÀ-ỹ\s]+$/u;
const phoneRegex = /^\d{10}$/;

export const registerSchema = z.object({
  username: z
    .string()
    .min(6, 'Tên đăng nhập phải có ít nhất 6 ký tự')
    .max(32, 'Tên đăng nhập tối đa 32 ký tự')
    .regex(
      usernameRegex,
      'Tên đăng nhập chỉ bao gồm chữ, số hoặc dấu gạch dưới',
    ),
  password: z
    .string()
    .min(10, 'Mật khẩu phải tối thiểu 10 ký tự')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa',
    }),
  fullName: z
    .string()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .regex(fullNameRegex, 'Họ tên không chứa số hoặc ký tự đặc biệt'),
  phone: z
    .string()
    .regex(phoneRegex, 'Số điện thoại phải gồm 10 chữ số'),
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['CUSTOMER', 'OWNER']),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const validateRegisterPayload = (payload: unknown): RegisterInput =>
  registerSchema.parse(payload);
