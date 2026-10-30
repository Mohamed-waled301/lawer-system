"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";

export function CaseEditForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { cases, clients, categories, statuses, staff, updateCase } = useApp();

  const caseItem = cases.find((c) => c.id === caseId);

  const [formData, setFormData] = useState({
    caseNumber: caseItem?.caseNumber || "",
    caseYear: caseItem?.caseYear || 2026,
    court: caseItem?.court || "",
    circuit: caseItem?.circuit || "",
    clientId: caseItem?.clientId || "",
    lawyerId: caseItem?.lawyerId || "",
    categoryId: caseItem?.categoryId || "",
    statusId: caseItem?.statusId || "",
    subject: caseItem?.subject || "",
    opponentName: caseItem?.opponentName || "",
    opponentLawyer: caseItem?.opponentLawyer || "",
    totalFees: caseItem?.totalFees?.toString() || "0",
    paidAmount: caseItem?.paidAmount?.toString() || "0",
    notes: caseItem?.notes || "",
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

  const client = clients.find((c) => c.id === caseItem.clientId);
  const lawyersList = staff.filter((s) => s.role === "LAWYER");

  const total = parseFloat(formData.totalFees) || 0;
  const paid = parseFloat(formData.paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      updateCase(caseItem.id, {
        ...formData,
        totalFees: total,
        paidAmount: paid,
      });
      router.push(`/cases/${caseItem.id}`);
    } catch {
      setError("حدث خطأ أثناء حفظ التعديلات");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseItem.id}`}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="رجوع للقضية"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              تعديل بيانات القضية رقم: {caseItem.caseNumber} لسنة {caseItem.caseYear}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              الموكل: {client?.name} ({client?.clientCode})
            </p>
          </div>
        </div>

        <Link
          href={`/cases/${caseItem.id}`}
          className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم القضية *</label>
              <input
                type="text"
                required
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
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
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">الدائرة / القاعة</label>
              <input
                type="text"
                value={formData.circuit}
                onChange={(e) => setFormData({ ...formData, circuit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div>
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">الحالة / المرحلة *</label>
              <select
                value={formData.statusId}
                onChange={(e) => setFormData({ ...formData, statusId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
              >
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
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
                <option value="">-- المستشار المناوب --</option>
                {lawyersList.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">اسم الخصم</label>
              <input
                type="text"
                value={formData.opponentName}
                onChange={(e) => setFormData({ ...formData, opponentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">محامي الخصم</label>
              <input
                type="text"
                value={formData.opponentLawyer}
                onChange={(e) => setFormData({ ...formData, opponentLawyer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block font-bold text-slate-700 mb-1">موضوع الدعوى والطلبات</label>
              <textarea
                rows={2}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Financial Section */}
          <div className="p-4 bg-emerald-50/40 rounded-lg border border-emerald-200">
            <h4 className="font-bold text-emerald-950 mb-3">الأتعاب المالية</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  إجمالي الأتعاب المتفق عليها (ج.م) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalFees}
                  onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المسدد (ج.م)</label>
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
              <span>{isSubmitting ? "جاري التحديث..." : "حفظ التعديلات"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
