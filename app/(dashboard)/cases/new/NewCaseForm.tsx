"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, AlertCircle, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useApp } from "@/lib/store";

interface NewCaseFormProps {
  initialClientId?: string;
}

export function NewCaseForm({ initialClientId }: NewCaseFormProps) {
  const router = useRouter();
  const { clients, categories, statuses, staff, addCase } = useApp();

  const activeClients = clients.filter((c) => !c.isDeleted);
  const lawyersList = staff.filter((s) => s.role === "LAWYER" && s.isActive);

  const [formData, setFormData] = useState({
    caseNumber: "",
    caseYear: new Date().getFullYear(),
    court: "",
    circuit: "",
    clientId: initialClientId || activeClients[0]?.id || "",
    lawyerId: lawyersList[0]?.id || "",
    categoryId: categories[0]?.id || "",
    statusId: statuses[0]?.id || "",
    subject: "",
    opponentName: "",
    opponentLawyer: "",
    totalFees: "",
    paidAmount: "0",
    firstHearingDate: "",
    firstHearingDecision: "",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClient = activeClients.find((c) => c.id === formData.clientId);

  const total = parseFloat(formData.totalFees) || 0;
  const paid = parseFloat(formData.paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.caseNumber) {
      setError("يرجى إدخال رقم القضية");
      return;
    }
    if (!formData.clientId) {
      setError("يرجى اختيار الموكل");
      return;
    }
    if (!formData.court) {
      setError("يرجى إدخال اسم المحكمة");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCase = addCase(formData);
      router.push(`/cases/${newCase.id}`);
    } catch {
      setError("حدث خطأ أثناء قيد القضية");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cases"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="رجوع للقضايا"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              افتتاح وقيد ملف قضية جديدة
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ربط القضية بالموكل، تحديد الدائرة القضائية، الأتعاب المتفق عليها وموعد أول جلسة
            </p>
          </div>
        </div>

        <Link
          href="/cases"
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

          {/* Section 1: Client Selection & Code */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2">
              1. بيانات الموكل صاحب الدعوى
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  اختر الموكل من السجل <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded bg-white font-semibold text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="">-- اختر موكلاً --</option>
                  {activeClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} — ({client.clientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">كود الموكل المحدد</label>
                <div className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white font-mono font-bold text-navy-950">
                  {selectedClient?.clientCode || "— غير محدد —"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Case Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
              2. بيانات المحكمة والخصوم
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  رقم القضية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  placeholder="مثال: 1452"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  السنة القضائية <span className="text-red-500">*</span>
                </label>
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
                <label className="block font-bold text-slate-700 mb-1">
                  المحكمة المختصة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  placeholder="مثال: محكمة استئناف القاهرة - الدائرة 8 جنايات"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  الدائرة / القاعة
                </label>
                <input
                  type="text"
                  value={formData.circuit}
                  onChange={(e) => setFormData({ ...formData, circuit: e.target.value })}
                  placeholder="مثال: الدائرة 12 تعويضات، قاعة 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  تصنيف الدعوى <span className="text-red-500">*</span>
                </label>
                <select
                  required
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
                <label className="block font-bold text-slate-700 mb-1">
                  مرحلة / حالة البداية <span className="text-red-500">*</span>
                </label>
                <select
                  required
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
                <label className="block font-bold text-slate-700 mb-1">
                  المحامي المسؤول عن الملف
                </label>
                <select
                  value={formData.lawyerId}
                  onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="">-- المستشار المناوب بالمكتب --</option>
                  {lawyersList.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">اسم الخصم / الطرف الآخر</label>
                <input
                  type="text"
                  value={formData.opponentName}
                  onChange={(e) => setFormData({ ...formData, opponentName: e.target.value })}
                  placeholder="اسم الخصم أو الشركة المدعى عليها..."
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">محامي الخصم</label>
                <input
                  type="text"
                  value={formData.opponentLawyer}
                  onChange={(e) => setFormData({ ...formData, opponentLawyer: e.target.value })}
                  placeholder="الأستاذ / ..."
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-bold text-slate-700 mb-1">موضوع وطلبات الدعوى</label>
                <textarea
                  rows={2}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="ملخص النزاع والطلبات الجازمة بصحيفة الدعوى..."
                  className="w-full p-2.5 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Agreements */}
          <div className="p-4 bg-emerald-50/40 rounded-lg border border-emerald-200 space-y-3">
            <h3 className="font-bold text-emerald-950 text-xs border-b border-emerald-200 pb-2">
              3. الأتعاب المتفق عليها والدفعات
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  إجمالي الأتعاب المتفق عليها (ج.م) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalFees}
                  onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
                  placeholder="مثال: 50000"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المسدد مقدماً (ج.م)</label>
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
                  {formatCurrency(remaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: First Hearing */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-navy-800" />
              <span>4. موعد أول جلسة لنظر القضية (اختياري)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الجلسة الأولى</label>
                <input
                  type="date"
                  value={formData.firstHearingDate}
                  onChange={(e) => setFormData({ ...formData, firstHearingDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المطلوب بالجلسة الأولى
                </label>
                <input
                  type="text"
                  value={formData.firstHearingDecision}
                  onChange={(e) =>
                    setFormData({ ...formData, firstHearingDecision: e.target.value })
                  }
                  placeholder="مثال: تقديم أصل التوكيل وصحيفة الدعوى المعلنة..."
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/cases"
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-semibold"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "جاري القيد..." : "قيد وحفظ ملف القضية"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
