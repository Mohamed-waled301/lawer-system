"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Edit, Save, AlertCircle } from "lucide-react";
import { updateClient } from "@/actions/clients";

export function ClientEditForm({ client }: { client: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: client.name || "",
    nationalId: client.nationalId || "",
    phone: client.phone || "",
    address: client.address || "",
    notes: client.notes || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateClient(client.id, formData);
      if (res.success) {
        router.push(`/clients/${client.id}`);
        router.refresh();
      } else {
        setError(res.error || "فشل تعديل بيانات الموكل");
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
            href={`/clients/${client.id}`}
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع لملف الموكل"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Edit className="w-5 h-5 text-navy-800" />
              <span>تعديل بيانات الموكل: {client.name}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              كود الموكل: {client.clientCode}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                الاسم الرباعي أو الثلاثي *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                الرقم القومي (14 رقماً)
              </label>
              <input
                type="text"
                maxLength={14}
                value={formData.nationalId}
                onChange={(e) =>
                  setFormData({ ...formData, nationalId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                رقم الهاتف المحمول الأساسي *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                العنوان بالتفصيل
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              ملاحظات وتوصيات
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href={`/clients/${client.id}`}
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

