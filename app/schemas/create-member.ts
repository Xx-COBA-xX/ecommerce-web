import { z } from "zod";

export const createMemberSchema = z.object({
  // Member fields
  full_name: z.string().min(3, "الاسم الرباعي يجب أن يكون 3 أحرف على الأقل").max(255),
  last_name: z.string().max(100).optional(),
  national_id: z.string().max(50).optional(),
  mother_name: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  birth_date: z.string().optional(),
  province_id: z.string().uuid("معرف المحافظة غير صحيح").optional(),
  residence: z.string().max(255).optional(),
  landmark: z.string().max(255).optional(),
  education_id: z.string().uuid("معرف التحصيل الدراسي غير صحيح").optional(),
  specialization: z.string().max(255).optional(),
  job: z.string().max(255).optional(),
  workplace: z.string().max(255).optional(),
  join_date: z.string().optional(),
  recommender_name: z.string().max(255).optional(),
  custom_code: z.string().max(100).optional(),
  is_banned: z.boolean().optional(),
  // group_id: z.string().uuid("معرف المجموعة غير صحيح").optional().or(z.literal("")),

  // Account creation fields (optional)
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional().or(z.literal("")),
  role_id: z.string().uuid("معرف الدور غير صحيح").optional().or(z.literal("")),
}).refine(
  (data) => {
    // If any account field is provided, all must be provided
    const hasEmail = data.email && data.email.length > 0;
    const hasPassword = data.password && data.password.length > 0;
    const hasRole = data.role_id && data.role_id.length > 0;

    if (hasEmail || hasPassword || hasRole) {
      return hasEmail && hasPassword && hasRole;
    }
    return true;
  },
  {
    message: "لإنشاء حساب، يجب توفير البريد الإلكتروني وكلمة المرور والدور",
    path: ["email"],
  }
);

export type CreateMemberFormData = z.infer<typeof createMemberSchema>;
