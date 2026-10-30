"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Edit, Save, AlertCircle } from "lucide-react";
import { updateCase } from "@/actions/cases";

interface CaseEditFormProps {
  caseItem: any;
  categories: Array<{ id: string; code: string; name: string }>;
  statuses: Array<{ id: string; name: string; isClosed: boolean }>;
  lawyers: Array<{ id: string; name: string }>;
}

export function CaseEditForm({
  caseItem,
  categories,
  statuses,
  lawyers,
}: CaseEditFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    caseNumber: caseItem.caseNumber || "",
    caseYear: caseItem.caseYear || new Date().getFullYear(),
    court: caseItem.court || "",
    circuit: caseItem.circuit || "",
    categoryId: caseItem.categoryId || categories[0]?.id || "",
    statusId: caseItem.statusId || statuses[0]?.id || "",
    lawyerId: caseItem.lawyerId || "",
    totalFees: caseItem.totalFees || 0,
    nextHearingDate: caseItem.nextHearingDate
      ? new Date(caseItem.nextHearingDate).toISOString().slice(0, 10)
      : "",
    notes: caseItem.notes || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateCase(caseItem.id, {
        ...formData,
        clientId: caseItem.clientId,
      });

      if (res.success) {
        router.push(`/cases/${caseItem.id}`);
        router.refresh();
      } else {
        setError(res.error || "فشل تعديل بيانات القضية");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ أثناء حفظ التعديلات");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseItem.id}`}
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع لملف القضية"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Edit className="w-5 h-5 text-navy-800" />
              <span>تعديل بيانات القضية رقم {caseItem.caseNumber} لسنة {caseItem.caseYear}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              الموكل: {caseItem.client.name} ({caseItem.client.clientCode})
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">رقم القضية *</label>
              <input
                type="text"
                required
                value={formData.caseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, caseNumber: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">سنة القضية *</label>
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
              <label className="block font-bold text-slate-700 mb-1.5">التصنيف *</label>
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
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">المحامي المسؤول</label>
              <select
                value={formData.lawyerId}
                onChange={(e) =>
                  setFormData({ ...formData, lawyerId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white"
              >
                <option value="">-- مكتب المحاماة --</option>
                {lawyers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">الأتعاب المتفق عليها (ج.م) *</label>
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
              <label className="block font-bold text-slate-700 mb-1.5">تاريخ الجلسة القادمة</label>
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

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">ملاحظات القضية</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href={`/cases/${caseItem.id}`}
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
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

