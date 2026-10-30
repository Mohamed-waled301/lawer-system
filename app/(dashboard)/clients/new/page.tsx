"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserPlus, Save, AlertCircle } from "lucide-react";
import { createClient, generateClientCode } from "@/actions/clients";

export default function NewClientPage() {
  const router = useRouter();
  const [nextCode, setNextCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateClientCode().then(setNextCode);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await createClient(formData);
      if (res.success && res.data) {
        router.push(`/clients/${res.data.id}`);
        router.refresh();
      } else {
        setError(res.error || "فشل تسجيل الموكل");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ أثناء حفظ بيانات الموكل");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع لسجل الموكلين"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-navy-800" />
              <span>تسجيل ملف موكل جديد</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              إدخال البيانات الرسمية وفتح ملف موكل معتمد في المنظومة
            </p>
          </div>
        </div>

        {/* Auto Generated Code Badge */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 border border-slate-200 rounded shadow-xs">
          <span className="text-xs text-slate-500 font-medium">كود الموكل المقترح:</span>
          <span className="font-mono font-bold text-sm text-navy-950 px-2 py-0.5 bg-slate-100 rounded">
            {nextCode || "..."}
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              البيانات الشخصية للموكل
            </h3>

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
                  placeholder="مثال: أحمد عبد الله الشناوي"
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
                  placeholder="2xxxxxxxxxxxxx"
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
                  placeholder="01xxxxxxxxx"
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
                  placeholder="المحافظة، المدينة، الشارع، رقم العقار"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Notes */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              ملاحظات وتوصيات
            </h3>
            <div>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات حول طبيعة التعاقد، صلة القرابة، الشركات التابعة للموكل..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href="/clients"
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
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ الموكل وفتح الملف"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

