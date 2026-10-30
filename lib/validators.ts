import { z } from "zod";

// Helper regexes
const phoneRegex = /^01[0125][0-9]{8}$/; // Egyptian standard mobile or general 11 digit, also allow landline / international format
const nationalIdRegex = /^[23][0-9]{13}$/; // 14-digit Egyptian national ID

export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const staffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "الاسم يجب أن لا يقل عن حرفين"),
  role: z.enum(["LAWYER", "SECRETARY", "ACCOUNTANT", "OTHER"], {
    errorMap: () => ({ message: "يرجى اختيار دور وظيفي صالح" }),
  }),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  hireDate: z.string().optional().or(z.literal("")),
  barAssociationNumber: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  notes: z.string().optional().or(z.literal("")),
});

export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "اسم الموكل مطلوب ويجب أن لا يقل عن حرفين"),
  nationalId: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^[0-9]{14}$/.test(val), {
      message: "الرقم القومي يجب أن يتكون من 14 رقماً",
    }),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const caseSchema = z.object({
  id: z.string().optional(),
  caseNumber: z.string().min(1, "رقم القضية مطلوب"),
  caseYear: z.coerce.number().int().min(1950, "سنة غير صحيحة").max(2100, "سنة غير صحيحة"),
  court: z.string().min(2, "اسم المحكمة مطلوب"),
  circuit: z.string().optional().or(z.literal("")),
  clientId: z.string().min(1, "يرجى اختيار الموكل"),
  lawyerId: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "يرجى اختيار تصنيف القضية"),
  statusId: z.string().min(1, "يرجى اختيار الحالة الابتدائية للقضية"),
  totalFees: z.coerce.number().min(0, "الأتعاب المتفق عليها يجب أن تكون رقماً موجباً"),
  paidAmount: z.coerce.number().min(0, "المبلغ المسدد يجب أن يكون رقماً موجباً").default(0),
  nextHearingDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const hearingSchema = z.object({
  caseId: z.string().min(1, "معرف القضية مطلوب"),
  hearingDate: z.string().min(1, "تاريخ الجلسة مطلوب"),
  court: z.string().optional().or(z.literal("")),
  circuit: z.string().optional().or(z.literal("")),
  decision: z.string().optional().or(z.literal("")),
  requirements: z.string().optional().or(z.literal("")),
  attendedBy: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const consultationSchema = z.object({
  personName: z.string().min(2, "اسم الشخص مطلوب"),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  date: z.string().min(1, "تاريخ الاستشارة مطلوب"),
  subject: z.string().min(2, "موضوع الاستشارة مطلوب"),
  amountPaid: z.coerce.number().min(0, "المبلغ المدفوع يجب أن يكون صفراً أو أكثر"),
  paymentMethod: z.enum(["CASH", "WALLET", "INSTAPAY"]),
  transferProofPath: z.string().optional().or(z.literal("")),
  lawyerId: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.amountPaid > 0 && data.paymentMethod !== "CASH") {
      return !!data.transferProofPath && data.transferProofPath.trim().length > 0;
    }
    return true;
  },
  {
    message: "يجب إرفاق إيصال أو صورة التحويل (إنستاباي / محفظة) عند السداد بغير النقد",
    path: ["transferProofPath"],
  }
);

export const paymentSchema = z.object({
  amount: z.coerce.number().gt(0, "مبلغ الدفعة يجب أن يكون أكبر من الصفر"),
  paymentDate: z.string().min(1, "تاريخ الدفع مطلوب"),
  paymentMethod: z.enum(["CASH", "WALLET", "INSTAPAY"]),
  transferProofPath: z.string().optional().or(z.literal("")),
  purpose: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  caseId: z.string().optional().or(z.literal("")),
  consultationId: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.paymentMethod !== "CASH") {
      return !!data.transferProofPath && data.transferProofPath.trim().length > 0;
    }
    return true;
  },
  {
    message: "إرفاق صورة التحويل أو الإشعار إلزامي للدفع عبر المحفظة أو إنستاباي",
    path: ["transferProofPath"],
  }
);

export const categorySchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "كود التصنيف مطلوب (مثال: 1, 2)"),
  name: z.string().min(2, "اسم التصنيف مطلوب"),
  description: z.string().optional().or(z.literal("")),
});

export const statusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "اسم الحالة مطلوب"),
  isClosed: z.boolean().default(false),
  color: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().default(0),
});

export const officeSettingsSchema = z.object({
  office_name: z.string().min(2, "اسم المكتب مطلوب"),
  office_owner: z.string().optional().or(z.literal("")),
  office_title: z.string().optional().or(z.literal("")),
  office_address: z.string().optional().or(z.literal("")),
  office_phones: z.string().optional().or(z.literal("")),
  office_email: z.string().optional().or(z.literal("")),
  tax_number: z.string().optional().or(z.literal("")),
  letterhead_notes: z.string().optional().or(z.literal("")),
});

