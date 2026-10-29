import * as zod from "zod";

export const profileSchema = zod.object({
  name: zod
    .string()
    .min(3, "الاسم قصير جداً"),

  email: zod
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "البريد الإلكتروني غير صحيح")
    .optional()
    .or(zod.literal("")),

  password: zod
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .optional()
    .or(zod.literal("")),

  phone: zod
    .string()
    .min(10, "رقم الهاتف غير مكتمل")
    .optional()
    .or(zod.literal("")),

  address: zod
    .string()
    .optional()
    .or(zod.literal("")),
});