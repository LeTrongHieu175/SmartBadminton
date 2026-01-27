import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Vui long nhap dung tai khoan"),
  password: z.string().min(1, "Vui long nhap dung mat khau"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const validateLoginPayload = (payload: unknown): LoginInput =>
  loginSchema.parse(payload);
