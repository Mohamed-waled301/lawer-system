"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, AlertCircle, ShieldAlert } from "lucide-react";
import { useApp } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export function ConvertConsultationForm({ consultationId }: { consultationId: string }) {
  const router = useRouter();
  const { consultations, clients, categories, statuses, staff, convertConsultationToCase } =
    useApp();

  const consultation = consultations.find((c) => c.id === consultationId);

  const [formData, setFormData] = useState({
    caseNumber: "",
    caseYear: new Date().getFullYear(),
    court: "",
    circuit: "",
    categoryId: categories[0]?.id || "",
    statusId: statuses[0]?.id || "",
    lawyerId: consultation?.lawyerId || staff[0]?.id || "",
    totalFees: "20000",
    paidAmount: "5000",
    clientAddress: "",
    clientNationalId: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!consultation) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        الاستشارة غير موجودة.
      </div>
    );
  }

  const total = parseFloat(formData.totalFees) || 0;
  const paid = parseFloat(formData.paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.caseNumber) {
      setError("يرجى إدخال رقم القضية الجديد");
      return;
    }
    if (!formData.court) {
      setError("يرجى إدخال اسم المحكمة");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCase = convertConsultationToCase(consultation.id, {
        ...formData,
        subject: consultation.subject,
      });
      router.push(`/cases/${newCase.id}`);
    } catch {
      setError("حدث خطأ أثناء تحويل الاستشارة لقضية");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/consultations"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="رجوع للاستشارات"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              تحويل الاستشارة القانونية إلى ملف قضية وموكل رسمي
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              طالب الاستشارة: {consultation.personName} ({consultation.phone})
            </p>
          </div>
        </div>

        <Link
          href="/consultations"
          className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded"
        >
          إلغاء وعودة
        </Link>
      </div>

      {/* Core Rule Alert */}
      <div className="p-4 bg-amber-50 border-r-4 border-amber-600 rounded text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">القاعدة الجوهرية للائحة المكتب (Core Rule):</h4>
          <p className="text-amber-800 mt-0.5">
            أتعاب الاستشارة المسددة (<strong>{formatCurrency(consultation.amountPaid)}</strong>) لا
            تسترد نهائياً ولا يتم خصمها من أتعاب القضية، وتظل مسجلة كإيراد مستقل بالخزينة.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Client Details */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              بيانات فتح ملف الموكل الجديد
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموكل</label>
                <input
                  type="text"
                  disabled
                  value={consultation.personName}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الهاتف</label>
                <input
                  type="text"
                  disabled
                  value={consultation.phone}
                  dir="ltr"
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 font-mono text-right text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الرقم القومي (14 رقماً)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={formData.clientNationalId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientNationalId: e.target.value })
                  }
                  placeholder="2xxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="المحافظة والمدينة..."
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* New Case Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              بيانات القضية الجديدة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم القضية *</label>
                <input
                  type="text"
                  required
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  placeholder="مثال: 945"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السنة *</label>
                <input
                  type="number"
                  required
                  value={formData.caseYear}
                  onChange={(e) =>
                    setFormData({ ...formData, caseYear: parseInt(e.target.value, 10) || 2026 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">المحكمة المختصة *</label>
                <input
                  type="text"
                  required
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  placeholder="مثال: محكمة القاهرة الابتدائية"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">تصنيف الدعوى *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      [{cat.code}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">المحامي المسؤول</label>
                <select
                  value={formData.lawyerId}
                  onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
                >
                  {staff
                    .filter((s) => s.role === "LAWYER")
                    .map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Agreed Case Fees */}
          <div className="p-4 bg-emerald-50/40 rounded-lg border border-emerald-200">
            <h4 className="font-bold text-emerald-950 mb-3">أتعاب القضية المستقلة</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  إجمالي أتعاب القضية المتفق عليها (ج.م) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalFees}
                  onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مقدم الأتعاب المسدد (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-emerald-800 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">المتبقي (محسوب تلقائياً)</label>
                <div className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-black text-rose-700 bg-slate-50">
                  {remaining.toLocaleString()} ج.م
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/consultations"
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-semibold"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "جاري التحويل..." : "تأكيد التحويل وقيد القضية"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
