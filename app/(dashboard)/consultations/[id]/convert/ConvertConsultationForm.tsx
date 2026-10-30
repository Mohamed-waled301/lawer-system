"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowRightLeft, Save, AlertCircle } from "lucide-react";
import { convertConsultationToCase } from "@/actions/consultations";
import { formatCurrency } from "@/lib/utils";

interface ConvertConsultationFormProps {
  consultation: any;
  categories: Array<{ id: string; code: string; name: string }>;
  statuses: Array<{ id: string; name: string; isClosed: boolean }>;
}

export function ConvertConsultationForm({
  consultation,
  categories,
  statuses,
}: ConvertConsultationFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    caseNumber: "",
    caseYear: new Date().getFullYear(),
    court: "",
    circuit: "",
    categoryId: categories[0]?.id || "",
    statusId: statuses[0]?.id || "",
    totalFees: 20000,
    paidAmount: 5000,
    nextHearingDate: "",
    notes: `تم فتح القضية بناءً على استشارة سابقة: "${consultation.subject}"`,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedRemaining = Math.max(0, formData.totalFees - (formData.paidAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await convertConsultationToCase({
        consultationId: consultation.id,
        ...formData,
      });

      if (res.success && res.caseId) {
        router.push(`/cases/${res.caseId}`);
        router.refresh();
      } else {
        setError(res.error || "فشل تحويل الاستشارة لقضية");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ أثناء إجراء التحويل");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/consultations"
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع للاستشارات"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-700" />
              <span>تحويل استشارة إلى ملف قضية رسمية (صفحة كاملة)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              طالب الاستشارة: {consultation.personName} - هاتف: {consultation.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Core Rule Callout */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed space-y-1">
        <div className="font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>تأكيد القاعدة المحاسبية القانونية:</span>
        </div>
        <p>
          رسوم الاستشارة السابقة المدفوعة بقيمة ({formatCurrency(consultation.amountPaid)}) لن
          تخصم بأي حال من الأحوال من أتعاب القضية الجديدة، وتظل مقيدة كإيراد استشارة منفصل تماماً
          بخزينة المكتب.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Client conversion info */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-800">
              بيانات الموكل الجديد (تلقائياً)
            </h3>
            <p className="text-slate-600 text-[11px]">
              سيقوم النظام آلياً بإنشاء موكل معتمد باسم: <strong>{consultation.personName}</strong> ورقم هاتف: <strong>{consultation.phone}</strong> مع توليد كود موكل فريد وتعيين المحامي المستشار المسؤول.
            </p>
          </div>

          {/* Section 2: Case Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              بيانات القضية والمحكمة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  رقم القضية الجديد *
                </label>
                <input
                  type="text"
                  required
                  value={formData.caseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, caseNumber: e.target.value })
                  }
                  placeholder="مثال: 8492"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  سنة القضية *
                </label>
                <input
                  type="number"
                  required
                  value={formData.caseYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      caseYear: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  تصنيف القضية *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white font-semibold"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      [{cat.code}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">المحكمة *</label>
                <input
                  type="text"
                  required
                  value={formData.court}
                  onChange={(e) =>
                    setFormData({ ...formData, court: e.target.value })
                  }
                  placeholder="مثال: محكمة جنوب الجيزة الابتدائية"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">الدائرة</label>
                <input
                  type="text"
                  value={formData.circuit}
                  onChange={(e) =>
                    setFormData({ ...formData, circuit: e.target.value })
                  }
                  placeholder="مثال: الدائرة 3 مدني"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">الحالة المبدئية</label>
                <select
                  value={formData.statusId}
                  onChange={(e) =>
                    setFormData({ ...formData, statusId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white font-semibold"
                >
                  {statuses.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.isClosed ? "(مغلقة)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  تاريخ الجلسة الأولى المحددة
                </label>
                <input
                  type="date"
                  value={formData.nextHearingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, nextHearingDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fees */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              الاتفاق المالي لأتعاب القضية الجديدة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  إجمالي أتعاب القضية (ج.م) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.totalFees}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalFees: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  المقدم المسدد فوراً (ج.م)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.paidAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paidAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  المتبقي (محسوب آلياً)
                </label>
                <div className="px-3.5 py-2.5 bg-white border border-slate-300 rounded font-mono font-bold text-sm text-red-700">
                  {formatCurrency(calculatedRemaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">ملاحظات التحويل</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href="/consultations"
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 transition-colors"
            >
              إلغاء ورجوع
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "جاري فتح القضية..." : "تأكيد التحويل وفتح ملف القضية"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

