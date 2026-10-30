"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Save, AlertCircle } from "lucide-react";
import { addCaseHearing } from "@/actions/cases";

export function NewHearingForm({ caseItem }: { caseItem: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hearingDate: new Date().toISOString().slice(0, 10),
    court: caseItem.court || "",
    circuit: caseItem.circuit || "",
    decision: "",
    requirements: "",
    attendedBy: caseItem.lawyer?.name || "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await addCaseHearing({
        ...formData,
        caseId: caseItem.id,
      });

      if (res.success) {
        router.push(`/cases/${caseItem.id}`);
        router.refresh();
      } else {
        setError(res.error || "فشل تسجيل الجلسة");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ أثناء حفظ الجلسة");
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
              <Calendar className="w-5 h-5 text-navy-800" />
              <span>إضافة جلسة محكمة جديدة (صفحة كاملة)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              للقضية رقم {caseItem.caseNumber} لسنة {caseItem.caseYear} - الموكل: {caseItem.client.name}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                تاريخ انعقاد الجلسة *
              </label>
              <input
                type="date"
                required
                value={formData.hearingDate}
                onChange={(e) =>
                  setFormData({ ...formData, hearingDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                المحامي الحاضر بالجلسة
              </label>
              <input
                type="text"
                value={formData.attendedBy}
                onChange={(e) =>
                  setFormData({ ...formData, attendedBy: e.target.value })
                }
                placeholder="اسم المحامي الحاضر"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">المحكمة</label>
              <input
                type="text"
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

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              قرار المحكمة / منطوق الحكم
            </label>
            <textarea
              rows={3}
              value={formData.decision}
              onChange={(e) =>
                setFormData({ ...formData, decision: e.target.value })
              }
              placeholder="مثال: التأجيل لجلسة 2024/12/10 لإحضار أصل المستندات والمذكرات الختامية..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              المطلوب للجلسة القادمة / الطلبات القضائية
            </label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              placeholder="مثال: استخراج شهادة من السجل التجاري، إعلان المدعى عليه بالطلبات المعدلة..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">ملاحظات إضافية</label>
            <textarea
              rows={2}
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
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ الجلسة وتحديث الأجندة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

