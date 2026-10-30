"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";

export function ClientEditForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { clients, updateClient } = useApp();
  const client = clients.find((c) => c.id === clientId);

  const [formData, setFormData] = useState({
    name: client?.name || "",
    nationalId: client?.nationalId || "",
    phone: client?.phone || "",
    address: client?.address || "",
    notes: client?.notes || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!client) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        الموكل غير موجود.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      updateClient(client.id, formData);
      router.push(`/clients/${client.id}`);
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
            href={`/clients/${client.id}`}
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع لملف الموكل"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              تعديل بيانات الموكل: {client.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              كود الموكل: <span className="font-mono font-bold">{client.clientCode}</span>
            </p>
          </div>
        </div>

        <Link
          href={`/clients/${client.id}`}
          className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded"
        >
          إلغاء وعودة
        </Link>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
                className="w-full px-3 py-2.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
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
                className="w-full px-3 py-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                ملاحظات إضافية
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href={`/clients/${client.id}`}
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
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
