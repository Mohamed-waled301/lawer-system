"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Briefcase, Save, AlertCircle } from "lucide-react";
import { createCase } from "@/actions/cases";
import { formatCurrency } from "@/lib/utils";

interface NewCaseFormProps {
  clients: Array<{ id: string; clientCode: string; name: string; phone: string }>;
  categories: Array<{ id: string; code: string; name: string }>;
  statuses: Array<{ id: string; name: string; isClosed: boolean }>;
  lawyers: Array<{ id: string; name: string }>;
  preselectedClientId?: string;
}

export function NewCaseForm({
  clients,
  categories,
  statuses,
  lawyers,
  preselectedClientId,
}: NewCaseFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    clientId: preselectedClientId || clients[0]?.id || "",
    lawyerId: lawyers[0]?.id || "",
    categoryId: categories[0]?.id || "",
    statusId: statuses[0]?.id || "",
    caseNumber: "",
    caseYear: new Date().getFullYear(),
    court: "",
    circuit: "",
    totalFees: 15000,
    paidAmount: 5000,
    nextHearingDate: "",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto selected client
  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const calculatedRemaining = Math.max(0, formData.totalFees - (formData.paidAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await createCase(formData);
      if (res.success && res.data) {
        router.push(`/cases/${res.data.id}`);
        router.refresh();
      } else {
        setError(res.error || "فشل تسجيل القضية");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ أثناء حفظ بيانات القضية");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cases"
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع لسجل القضايا"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-navy-800" />
              <span>افتتاح ملف قضية جديدة (صفحة كاملة)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تسجيل بيانات الدعوى، المحكمة المختصة، الأتعاب المتفق عليها ومواعيد الجلسات
            </p>
          </div>
        </div>
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

          {/* Section 1: Client Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              طرف الدعوى (الموكل)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">
                  اختيار الموكل صاحب القضية *
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clientCode}) - هاتف: {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Code Displayed Automatically */}
              <div>
                <label className="block font-bold text-slate-500 mb-1.5">
                  كود الموكل التلقائي
                </label>
                <div className="px-3.5 py-2.5 bg-white border border-slate-300 rounded font-mono font-bold text-sm text-navy-950 flex items-center justify-between">
                  <span>{selectedClient?.clientCode || "-"}</span>
                  <span className="text-[10px] text-slate-400 font-sans">معتمد</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Case Judicial Info */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              بيانات الدعوى والمحكمة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  رقم القضية *
                </label>
                <input
                  type="text"
                  required
                  value={formData.caseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, caseNumber: e.target.value })
                  }
                  placeholder="مثال: 12458"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  سنة القضية القضائية *
                </label>
                <input
                  type="number"
                  required
                  min={1950}
                  max={2100}
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
                  تصنيف القضية وتفرعها *
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
                <label className="block font-bold text-slate-700 mb-1.5">
                  اسم المحكمة المختصة *
                </label>
                <input
                  type="text"
                  required
                  value={formData.court}
                  onChange={(e) =>
                    setFormData({ ...formData, court: e.target.value })
                  }
                  placeholder="مثال: محكمة جنوب القاهرة الابتدائية"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  الدائرة القضائية
                </label>
                <input
                  type="text"
                  value={formData.circuit}
                  onChange={(e) =>
                    setFormData({ ...formData, circuit: e.target.value })
                  }
                  placeholder="مثال: الدائرة ٥ مدني تعويضات"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  المحامي المسؤول عن الملف
                </label>
                <select
                  value={formData.lawyerId}
                  onChange={(e) =>
                    setFormData({ ...formData, lawyerId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white"
                >
                  <option value="">-- إسناد لمكتب المحاماة مباشرة --</option>
                  {lawyers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  الحالة الابتدائية للدعوى *
                </label>
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
            </div>
          </div>

          {/* Section 3: Fees & Financials */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              الاتفاق المالي والأتعاب
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  الأتعاب المتفق عليها (ج.م) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
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

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  تاريخ الجلسة الأولى (إن وُجد)
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

          {/* Section 4: Notes */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              موضوع الدعوى وملاحظات الملف
            </h3>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ملخص النزاع، تفاصيل العقد أو الواقعة، طلبات المدعي..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href="/cases"
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
              <span>{isSubmitting ? "جاري الحفظ..." : "فتح ملف القضية وتوثيق الأتعاب"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

