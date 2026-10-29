import * as zod from "zod";

export const registerSchema = zod
  .object({
    name: zod
      .string()
      .nonempty("Name is a required")
      .min(3, "Name must be at least 3 characters")
      .max(20, "Name must be shorter than 20 characters"),

    email: zod
      .string()
      .nonempty("email is a required")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "valid email address"
      ),

    // ✅ التعديل هنا: فقط 8 محارف أو أكثر (أحرف/أرقام/رموز كلها مسموحة)
    password: zod
      .string()
      .nonempty("Password is a required")
      .min(8, "Password must be at least 8 characters"),

    rePassword: zod.string().nonempty("RePassword is a required"),

    role: zod.enum(["user", "admin", "shop_owner", "shelter_owner", "doctor"]),

    document: zod.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.rePassword) {
      ctx.addIssue({
        path: ["rePassword"],
        message: "كلمتا السر غير متطابقتين",
        code: zod.ZodIssueCode.custom,
      });
    }

    // الوثيقة مطلوبة فقط لهذه الأدوار
    if (
      ["shop_owner", "shelter_owner", "doctor"].includes(data.role) &&
      !data.document
    ) {
      ctx.addIssue({
        path: ["document"],
        message: "الوثيقة مطلوبة",
        code: zod.ZodIssueCode.custom,
      });
    }
  });
