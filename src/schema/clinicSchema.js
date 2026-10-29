import * as zod from "zod";

export const clinicSchema = zod.object({
  name: zod.string().min(1, "اسم الدكتور مطلوب"),
  specialty: zod.string().min(1, "التخصص مطلوب"),
  location: zod.string().min(1, "العنوان مطلوب"),
  phone: zod.string()
    .min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل")
    .regex(/^[0-9]+$/, "يجب إدخال أرقام فقط"),
});