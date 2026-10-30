"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, Upload, Trash2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { useApp } from "@/lib/store";

export function NewConsultationForm() {
  const router = useRouter();
  const { staff, addConsultation } = useApp();
  const lawyers = staff.filter((s) => s.role === "LAWYER" && s.isActive);

  const [formData, setFormData] = useState({
    personName: "",
    phone: "",
    date: new Date().toISOString().slice(0, 10),
    lawyerId: lawyers[0]?.id || "",
    subject: "",
    amountPaid: "1000",
    paymentMethod: "CASH",
    notes: "",
  });

  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.paymentMethod !== "CASH" && !receiptImage && !previewUrl) {
      setError("إرفاق صورة إيصال التحويل (إنستاباي / محفظة) إلزامي للعمليات غير النقدية");
      return;
    }

    setIsSubmitting(true);
    try {
      addConsultation({
        ...formData,
        transferProofPath: previewUrl || undefined,
      });
      router.push("/consultations");
    } catch {
      setError("حدث خطأ أثناء حفظ الاستشارة");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/consultations"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="رجوع للاستشارات"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              تسجيل استشارة قانونية جديدة
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              توثيق بيانات طالب الاستشارة، أتعاب الرأي القانوني وطريقة التحصيل
            </p>
          </div>
        </div>

        <Link
          href="/consultations"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم طالب الاستشارة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                placeholder="الاسم الكامل للشخص أو ممثل الجهة..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                رقم الهاتف / الواتساب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                className="w-full px-3 py-2.5 border border-slate-300 rounded font-mono text-right focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الاستشارة *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المستشار المناوب</label>
              <select
                value={formData.lawyerId}
                onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded bg-white font-medium"
              >
                <option value="">-- المستشار المناوب بالمكتب --</option>
                {lawyers.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                موضوع الاستشارة القانونية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="مثال: استشارة في عقد بيع شقة سكنية وفحص الملكية والتسجيل..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2">
              بيانات سداد أتعاب الاستشارة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المبلغ المسدد (ج.م) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded font-mono font-bold text-emerald-800 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  طريقة الدفع والخزينة المستلمة <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                >
                  <option value="CASH">نقداً بالخزينة الرئيسية للمكتب</option>
                  <option value="INSTAPAY">تحويل إنستاباي بنكي مباشر (خزينة إنستاباي)</option>
                  <option value="WALLET">محافظ إلكترونية (فودافون كاش / اتصالات)</option>
                </select>
              </div>
            </div>

            {/* Mandatory Receipt Upload for Non-Cash */}
            {formData.paymentMethod !== "CASH" && (
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded space-y-2">
                <label className="block font-bold text-purple-950">
                  إدراج صورة إيصال التحويل (إلزامي للعمليات غير النقدية) *
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                {!previewUrl ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-purple-300 hover:border-purple-400 bg-white rounded p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-purple-900">
                      اضغط لإدراج سكرين شوت أو إيصال التحويل (PNG, JPG, PDF)
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                    <div className="flex items-center gap-2">
                      <img
                        src={previewUrl}
                        alt="receipt"
                        className="w-12 h-12 object-cover rounded border border-slate-200"
                      />
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {receiptImage?.name || "صورة التحويل جاهزة"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptImage(null);
                        setPreviewUrl(null);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات الرأي القانوني</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="الرأي المسلّم لطالب الاستشارة، الخطوات المقترحة..."
              className="w-full p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/consultations"
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
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ الاستشارة وتوريد الأتعاب للخزينة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
