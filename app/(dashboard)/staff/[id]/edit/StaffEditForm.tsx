"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  UserCheck,
  Shield,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Save,
  AlertCircle,
} from "lucide-react";
import { updateStaffMember } from "@/actions/staff";

interface StaffData {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string | null;
  hireDate?: Date | string | null;
  barAssociationNumber?: string | null;
  isActive: boolean;
  notes?: string | null;
  _count?: {
    cases: number;
    consultations: number;
  };
}

export function StaffEditForm({ staff }: { staff: StaffData }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: staff.name,
    role: staff.role as "LAWYER" | "SECRETARY" | "ACCOUNTANT" | "OTHER",
    phone: staff.phone,
    email: staff.email || "",
    hireDate: staff.hireDate
      ? new Date(staff.hireDate).toISOString().slice(0, 10)
      : "",
    barAssociationNumber: staff.barAssociationNumber || "",
    isActive: staff.isActive,
    notes: staff.notes || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateStaffMember(staff.id, formData);
      if (res.success) {
        router.push("/staff");
        router.refresh();
      } else {
        setError(res.error || "حدث خطأ أثناء تعديل بيانات الموظف");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ غير متوقع أثناء إرسال البيانات");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/staff"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="رجوع لقائمة فريق العمل"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              تعديل بيانات: {staff.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تحديث الصلاحيات، الهاتف، أو حالة العمل بالمكتب
            </p>
          </div>
        </div>

        <Link
          href="/staff"
          className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
        >
          إلغاء وعودة
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              الدور والمسؤولية الوظيفية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as any,
                  })
                }
                className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="LAWYER">محامٍ ممارس (يحضر الجلسات ويترافع)</option>
                <option value="SECRETARY">سكرتارية وإدارة مكتب</option>
                <option value="ACCOUNTANT">محاسب مالي ومسؤول خزينة</option>
                <option value="OTHER">خدمات مساندة وأخرى</option>
              </select>
              <Briefcase className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              رقم الهاتف / الواتساب <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
                className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded font-mono text-right focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Bar Association Number (Conditional) */}
          {formData.role === "LAWYER" ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-navy-900">
                رقم القيد بنقابة المحامين <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required={formData.role === "LAWYER"}
                  value={formData.barAssociationNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, barAssociationNumber: e.target.value })
                  }
                  className="w-full pl-3 pr-9 py-2.5 text-xs border border-navy-300 bg-navy-50/20 rounded font-mono focus:ring-1 focus:ring-navy-900 focus:outline-none"
                />
                <Shield className="w-4 h-4 text-navy-600 absolute right-3 top-3" />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                البريد الإلكتروني (اختياري)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded font-mono text-right focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          {/* Hire Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              تاريخ الالتحاق بالمكتب
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Email if lawyer */}
          {formData.role === "LAWYER" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                البريد الإلكتروني (اختياري)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded font-mono text-right focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          {/* Status Switch */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">حالة العضو</label>
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="mr-3 text-xs font-bold text-slate-800">
                  {formData.isActive ? "نشط على رأس العمل" : "غير نشط / في إجازة أو متوقف"}
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              ملاحظات وسجل العضو بالمكتب
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/staff"
            className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "جاري التحديث..." : "حفظ التعديلات"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

