import * as zod from "zod";

export const shelterSchema = zod.object({
  name: zod.string().nonempty("اسم الملجأ مطلوب"),
  specialty: zod.string().nonempty("التخصص مطلوب"),
  location: zod.string().nonempty("العنوان مطلوب"),
  phone: zod.string().min(10, "رقم الهاتف غير صحيح"),
});