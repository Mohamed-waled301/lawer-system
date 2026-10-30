"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";

export function NewClientForm() {
  const router = useRouter();
  const { addClient, generateNextClientCode } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextCode = generateNextClientCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.name.trim().length < 2) {
      setError("اسم الموكل يجب أن لا يقل عن حرفين");
      return;
    }
    if (formData.phone.trim().length < 8) {
      setError("رقم الهاتف يجب أن لا يقل عن 8 أرقام");
      return;
    }

    setIsSubmitting(true);
    try {
      const newClient = addClient(formData);
      router.push(`/clients/${newClient.id}`);
    } catch {
      setError("حدث خطأ أثناء حفظ بيانات الموكل");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="رجوع للموكلين"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              إضافة ملف موكل جديد
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تسجيل بيانات الموكل الأساسية وتوليد الكود التعريفي التلقائي
            </p>
          </div>
        </div>

        <Link
          href="/clients"
          className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded"
        >
          إلغاء وعودة
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto Client Code Banner */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block">
                كود الموكل التلقائي (Unique Client Code)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                يتم توليده تلقائياً بشكل فريد لتمييز الموكل وسرعة البحث
              </p>
            </div>
            <div className="text-base font-black font-mono text-navy-950 bg-white px-3 py-1.5 rounded border border-slate-300 shadow-2xs">
              {nextCode}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                اسم الموكل بالكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="الاسم الثلاثي أو الرباعي للموكل..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* National ID */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الرقم القومي (14 رقم)
              </label>
              <input
                type="text"
                maxLength={14}
                value={formData.nationalId}
                onChange={(e) =>
                  setFormData({ ...formData, nationalId: e.target.value })
                }
                placeholder="2xxxxxxxxxxxxx أو 3xxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                مطلوب 14 رقماً مصرياً صحيحاً (اختياري عند فتح الملف)
              </span>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                رقم الهاتف / الواتساب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010 / 011 / 012 / 015..."
                dir="ltr"
                className="w-full px-3 py-2.5 border border-slate-300 rounded font-mono text-right focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                محل الإقامة / العنوان بالتفصيل
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="المحافظة، المدينة، اسم الشارع، رقم العقار..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                ملاحظات إضافية عن الموكل
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="طريقة التعرف على المكتب، صلة القرابة، مواعيد الاتصال المفضلة..."
                className="w-full p-3 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/clients"
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ ملف الموكل"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
