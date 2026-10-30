"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, Calendar, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";

export function NewHearingForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { cases, clients, addCaseHearing } = useApp();

  const caseItem = cases.find((c) => c.id === caseId);
  const client = clients.find((cl) => cl.id === caseItem?.clientId);

  const [formData, setFormData] = useState({
    hearingDate: "",
    decision: "",
    notes: "",
    judgeName: "",
    courtCircuit: caseItem?.circuit || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!caseItem) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        القضية غير موجودة.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.hearingDate) {
      setError("يرجى تحديد تاريخ الجلسة");
      return;
    }

    setIsSubmitting(true);
    try {
      addCaseHearing(caseItem.id, {
        hearingDate: new Date(formData.hearingDate).toISOString(),
        decision: formData.decision || undefined,
        notes: formData.notes || undefined,
        judgeName: formData.judgeName || undefined,
        courtCircuit: formData.courtCircuit || undefined,
      });
      router.push(`/cases/${caseItem.id}`);
    } catch {
      setError("حدث خطأ أثناء حفظ الجلسة");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseItem.id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="رجوع لملف القضية"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              إضافة وتوثيق جلسة محكمة جديدة
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-mono font-bold text-navy-900">
                قضية رقم: {caseItem.caseNumber} لسنة {caseItem.caseYear}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                الموكل: {client?.name}
              </span>
              <span>•</span>
              <span className="text-slate-600">{caseItem.court}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/cases/${caseItem.id}`}
          className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
        >
          إلغاء وعودة
        </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                تاريخ انعقاد الجلسة <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.hearingDate}
                onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الدائرة / القاعة</label>
              <input
                type="text"
                value={formData.courtCircuit}
                onChange={(e) => setFormData({ ...formData, courtCircuit: e.target.value })}
                placeholder="مثال: الدائرة 8 جنايات"
                className="w-full px-3 py-2.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم رئيس المحكمة / القاضي (اختياري)
              </label>
              <input
                type="text"
                value={formData.judgeName}
                onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                placeholder="المستشار / ..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                قرار المحكمة / منطوق الحكم / ما دار بالجلسة
              </label>
              <textarea
                rows={3}
                value={formData.decision}
                onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                placeholder="مثال: قررت المحكمة تأجيل نظر الدعوى لجلسة ... لإيداع تقرير الخبير..."
                className="w-full p-3 border border-slate-300 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                المطلوب تجهيزه للجلسة القادمة / ملاحظات الدفاع
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي أوراق، مستندات، شهود، أو مذكرات دفاع مطلوبة..."
                className="w-full p-3 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href={`/cases/${caseItem.id}`}
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
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ وتوثيق الجلسة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
