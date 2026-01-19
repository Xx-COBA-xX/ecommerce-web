import { z } from "zod";

export const createMemberSchema = z.object({
  // Member fields
  full_name: z
    .string()
    .min(3, "الاسم الرباعي يجب أن يكون 3 أحرف على الأقل")
    .max(255),
  last_name: z.string().min(1, "اللقب مطلوب").max(100),
  national_id: z.string().min(1, "الرقم الوطني مطلوب").max(50),
  mother_name: z.string().min(1, "اسم الأم مطلوب").max(255),
  phone: z.string().min(1, "رقم الهاتف مطلوب").max(20),
  birth_date: z.string().min(1, "تاريخ الميلاد مطلوب"),
  province_id: z.string().uuid("معرف المحافظة غير صحيح"),
  residence: z.string().min(1, "عنوان السكن مطلوب").max(255),
  landmark: z.string().min(1, "أقرب نقطة دالة مطلوبة").max(255),
  education_id: z.string().uuid("معرف التحصيل الدراسي غير صحيح"),
  specialization: z.string().min(1, "عنوان التخصص مطلوب").max(255),
  job: z.string().min(1, "العنوان الوظيفي مطلوب").max(255),
  workplace: z.string().min(1, "مكان العمل مطلوب").max(255),
  join_date: z.string().min(1, "تاريخ الانتماء مطلوب"),
  recommender_name: z.string().min(1, "اسم المزكي مطلوب").max(255),
  custom_code: z.string().min(1, "الكود الخاص مطلوب").max(100),
  is_banned: z.boolean().optional(),
  group_id: z
    .string()
    .uuid("معرف المجموعة غير صحيح")
    .optional()
    .or(z.literal("")),

  // Account creation fields
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .min(1, "البريد الإلكتروني مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role_id: z.string().uuid("معرف الدور غير صحيح"),
});

export type CreateMemberFormData = z.infer<typeof createMemberSchema>;
