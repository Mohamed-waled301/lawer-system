"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Clock,
  History,
  Save,
  AlertCircle,
} from "lucide-react";
import { changeCaseStatus } from "@/actions/cases";
import { formatDate } from "@/lib/utils";

interface Props {
  caseItem: any;
  statuses: Array<{ id: string; name: string; isClosed: boolean }>;
}

export function CaseStatusChangeForm({ caseItem, statuses }: Props) {
  const router = useRouter();
  const [selectedStatusId, setSelectedStatusId] = useState(caseItem.statusId);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedStatusId === caseItem.statusId) {
      setError("يرجى اختيار حالة جديدة تختلف عن الحالة الحالية للقضية");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changeCaseStatus({
        caseId: caseItem.id,
        newStatusId: selectedStatusId,
        notes,
      });

      if (res.success) {
        router.push(`/cases/${caseItem.id}`);
        router.refresh();
      } else {
        setError(res.error || "حدث خطأ أثناء تحديث حالة القضية");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ غير متوقع");
      setIsSubmitting(false);
    }
  };

  const currentStatusObj = statuses.find((s) => s.id === caseItem.statusId);
  const selectedStatusObj = statuses.find((s) => s.id === selectedStatusId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseItem.id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="رجوع للقضية"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              تحديث مرحلة وسريان القضية
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-mono font-bold text-navy-900">
                قضية رقم: {caseItem.caseNumber} لسنة {caseItem.caseYear}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                الموكل: {caseItem.client.name}
              </span>
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

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Current State vs New State Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            الحالة والمرحلة الحالية
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-900">
              {currentStatusObj?.name || caseItem.status?.name}
            </span>
            {currentStatusObj?.isClosed ? (
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                مغلقة / منتهية
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                متداولة ونشطة
              </span>
            )}
          </div>
        </div>

        <div className="bg-navy-50/50 p-4 rounded-lg border border-navy-200 shadow-xs">
          <span className="text-[11px] font-semibold text-navy-600 block mb-1">
            المرحلة المنتقل إليها
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-navy-950">
              {selectedStatusObj?.name || "-"}
            </span>
            {selectedStatusObj?.isClosed && (
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                سيتم إغلاق القضية
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            اختر الحالة / المرحلة الجديدة للقضية <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedStatusId}
            onChange={(e) => setSelectedStatusId(e.target.value)}
            className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded bg-white font-bold text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
          >
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} {st.isClosed ? "— (تعتبر القضية مغلقة ومنتهية)" : "— (متداولة)"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            سبب التغيير / منطوق الحكم / ملاحظات المرحلة الجديدة
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: صدور حكم أول درجة بالبراءة / بالتعويض، وتم قيد الاستئناف تحت رقم..."
            className="w-full p-3 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            يتم توثيق هذا البيان تلقائياً في سجل تاريخ مراحل القضية مع اسم الموظف والتاريخ الدقيق
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href={`/cases/${caseItem.id}`}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || selectedStatusId === caseItem.statusId}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "جاري التحديث..." : "تأكيد وتوثيق الانتقال للمرحلة الجديدة"}</span>
          </button>
        </div>
      </form>

      {/* History Log of Previous Changes */}
      {caseItem.statusHistory && caseItem.statusHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800">
              سجل المراحل والحالات السابقة لهذه القضية
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {caseItem.statusHistory.map((h: any) => (
              <div key={h.id} className="py-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {h.fromStatus?.name || "بداية القيد"} ← {h.toStatus.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      بواسطة: {h.changedByName}
                    </span>
                  </div>
                  {h.notes && (
                    <p className="text-slate-600 text-[11px] mt-1">{h.notes}</p>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDate(h.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

