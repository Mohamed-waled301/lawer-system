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
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/lib/store";

export function NewStaffForm() {
  const router = useRouter();
  const { addStaff } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    role: "LAWYER" as "LAWYER" | "SECRETARY" | "ACCOUNTANT" | "OTHER",
    phone: "",
    email: "",
    hireDate: new Date().toISOString().slice(0, 10),
    barAssociationNumber: "",
    isActive: true,
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("يرجى إدخال اسم العضو بالكامل");
      return;
    }

    if (!formData.phone.trim()) {
      setError("يرجى إدخال رقم الهاتف");
      return;
    }

    if (formData.role === "LAWYER" && !formData.barAssociationNumber.trim()) {
      setError("رقم القيد بنقابة المحامين مطلوب للسادة المحامين");
      return;
    }

    setIsSubmitting(true);

    try {
      addStaff({
        name: formData.name.trim(),
        role: formData.role,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        hireDate: formData.hireDate,
        barAssociationNumber: formData.barAssociationNumber.trim() || undefined,
        isActive: formData.isActive,
        notes: formData.notes.trim() || undefined,
      });

      router.push("/staff");
    } catch {
      setError("حدث خطأ غير متوقع أثناء حفظ البيانات");
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
              إضافة عضو جديد لفريق العمل والمحامين (صفحة كاملة)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تسجيل بيانات محام أو إداري أو محاسب جديد وتحديد صلاحياته ومسؤولياته بالمكتب
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              الاسم بالكامل رباعي *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أ/ أحمد إبراهيم محمد..."
                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              الدور الوظيفي بالمكتب *
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="LAWYER">محام (مرافعة واستشارات وقضايا)</option>
                <option value="SECRETARY">سكرتارية وأعمال إدارية</option>
                <option value="ACCOUNTANT">محاسب مالي وإدارة خزن</option>
                <option value="OTHER">خدمات مساندة وأخرى</option>
              </select>
              <Briefcase className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Bar Association Number (Conditional for Lawyers) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              رقم القيد بنقابة المحامين {formData.role === "LAWYER" ? "*" : "(اختياري)"}
            </label>
            <div className="relative">
              <input
                type="text"
                required={formData.role === "LAWYER"}
                value={formData.barAssociationNumber}
                onChange={(e) => setFormData({ ...formData, barAssociationNumber: e.target.value })}
                placeholder="مثال: 543210 (نقابة المحامين)"
                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <Shield className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              رقم الهاتف المحمول *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010xxxxxxxx"
                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                dir="ltr"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              البريد الإلكتروني (اختياري)
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="lawyer@office.com"
                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

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
                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              حالة العمل
            </label>
            <div className="pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-semibold text-slate-700">
                  نشط ويعمل حالياً بالمكتب
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              ملاحظات أو تخصص المحامي
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="مثال: متخصص في قضايا الجنايات والشركات، مسؤول عن دوائر الجيزة..."
              className="w-full p-3 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/staff"
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "جاري الحفظ..." : "حفظ بيانات العضو"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
