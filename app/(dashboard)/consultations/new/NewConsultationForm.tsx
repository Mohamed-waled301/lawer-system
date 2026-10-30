"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Save,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  Building,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { createConsultationWithProof } from "@/actions/consultations";

interface NewConsultationFormProps {
  lawyers: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; clientCode: string; name: string }>;
  treasuries: Array<{ id: string; name: string; paymentMethod: string; balance: number }>;
}

export function NewConsultationForm({
  lawyers,
  clients,
  treasuries,
}: NewConsultationFormProps) {
  const router = useRouter();

  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [subject, setSubject] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "WALLET" | "INSTAPAY">("CASH");
  const [lawyerId, setLawyerId] = useState(lawyers[0]?.id || "");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");

  // Transfer Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert("حجم الصورة يتجاوز الحد الأقصى (25 ميجابايت)");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectedTreasury = treasuries.find((t) => t.paymentMethod === paymentMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amountPaid > 0 && paymentMethod !== "CASH" && !selectedFile) {
      setError("إدراج صورة إشعار التحويل الإلكتروني إلزامي عند السداد بغير النقد");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("personName", personName);
      formData.append("phone", phone);
      formData.append("date", date);
      formData.append("subject", subject);
      formData.append("amountPaid", amountPaid.toString());
      formData.append("paymentMethod", paymentMethod);
      if (lawyerId) formData.append("lawyerId", lawyerId);
      if (clientId) formData.append("clientId", clientId);
      if (notes) formData.append("notes", notes);
      if (selectedFile) formData.append("transferImage", selectedFile);

      const res = await createConsultationWithProof(formData);

      if (res.success) {
        router.push("/consultations");
        router.refresh();
      } else {
        setError(res.error || "فشل تسجيل الاستشارة");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ أثناء حفظ الاستشارة");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/consultations"
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع لسجل الاستشارات"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-navy-800" />
              <span>تسجيل استشارة قانونية جديدة (صفحة كاملة)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              توثيق بيانات طالب الاستشارة، أتعاب الرأي القانوني وإدراج إشعار السداد
            </p>
          </div>
        </div>
      </div>

      {/* Core Rule Callout */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-start gap-3 text-xs text-slate-700">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-bold">القاعدة المحاسبية المعتمدة: </strong>
          رسوم الاستشارة القانونية غير قابلة للاسترداد تحت أي ظرف، ولا تخصم نهائياً من رسوم أي
          قضية يتم فتحها لاحقاً وتعد إيراداً مستقلاً تماماً.
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

          {/* Section 1: Person Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              بيانات طالب الاستشارة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  اسم طالب الاستشارة بالكامل *
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="الاسم الثلاثي أو الرباعي"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  رقم الهاتف للتواصل *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  تاريخ الاستشارة *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  المحامي المستشار المسؤول
                </label>
                <select
                  value={lawyerId}
                  onChange={(e) => setLawyerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white"
                >
                  <option value="">-- المستشار المناوب --</option>
                  {lawyers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  هل هو موكل مسجل مسبقاً؟
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white"
                >
                  <option value="">-- عميل جديد --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clientCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Subject */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              موضوع وملخص الاستشارة
            </h3>
            <textarea
              rows={4}
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="وصف المشكلة القانونية، تفاصيل النزاع والرأي المقدم من المستشار..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
            />
          </div>

          {/* Section 3: Fees & Safe / Treasury */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              الأتعاب والخزينة وطريقة الدفع
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  المبلغ المسدد (ج.م) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  طريقة السداد *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as any)
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white font-semibold"
                >
                  <option value="CASH">نقداً (خزينة المكتب)</option>
                  <option value="WALLET">محفظة إلكترونية (فودافون كاش / وغيرها)</option>
                  <option value="INSTAPAY">تحويل بنكي / إنستاباي (InstaPay)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1.5">
                  الخزينة المودع بها تلقائياً
                </label>
                <div className="px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold truncate">
                  {selectedTreasury?.name || "الخزينة المقابلة"}
                </div>
              </div>
            </div>

            {/* Image Upload for Non-Cash Transfer Proof */}
            {paymentMethod !== "CASH" && (
              <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-amber-950 text-xs">
                    إدراج صورة إشعار أو إيصال التحويل (إلزامي) *
                  </label>
                  <span className="text-[11px] text-amber-700">
                    JPG, PNG, PDF (حتى 25 ميجابايت)
                  </span>
                </div>

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 rounded-lg p-5 text-center cursor-pointer bg-white hover:bg-amber-50/50 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-amber-800 mx-auto mb-1.5" />
                    <p className="font-bold text-amber-900 text-xs">
                      انقر لاختيار صورة إشعار التحويل أو اسحبها هنا
                    </p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      يتم حفظ الصورة وتوثيقها مباشرة مع إيصال السداد
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-amber-300">
                    <div className="flex items-center gap-3">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="إشعار التحويل"
                          className="w-12 h-12 rounded object-cover border border-slate-200"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-amber-700" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          جاهز للرفع مع المعاملة
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="حذف واختيار صورة أخرى"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              توصيات وملاحظات المكتب
            </h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توصيات قانونية للمستشير، المستندات المطلوب تجهيزها..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href="/consultations"
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
              <span>{isSubmitting ? "جاري الحفظ والتحصيل..." : "تسجيل الاستشارة وإيداع الأتعاب"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

