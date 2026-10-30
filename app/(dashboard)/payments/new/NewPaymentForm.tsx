"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Receipt,
  Save,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  CreditCard,
  Building,
  Smartphone,
} from "lucide-react";
import { createPaymentWithReceipt } from "@/actions/payments";
import { formatCurrency } from "@/lib/utils";

interface NewPaymentFormProps {
  cases: Array<{
    id: string;
    caseNumber: string;
    caseYear: number;
    court: string;
    totalFees: number;
    paidAmount: number;
    remainingAmount: number;
    client: { id: string; clientCode: string; name: string };
  }>;
  clients: Array<{ id: string; clientCode: string; name: string }>;
  treasuries: Array<{ id: string; name: string; paymentMethod: string; balance: number }>;
  preselectedCaseId?: string;
  preselectedClientId?: string;
}

export function NewPaymentForm({
  cases,
  clients,
  treasuries,
  preselectedCaseId,
  preselectedClientId,
}: NewPaymentFormProps) {
  const router = useRouter();

  const [paymentType, setPaymentType] = useState<"CASE" | "CLIENT_DIRECT">(
    preselectedCaseId ? "CASE" : "CASE"
  );
  const [caseId, setCaseId] = useState(preselectedCaseId || (cases[0]?.id || ""));
  const [clientId, setClientId] = useState(preselectedClientId || (clients[0]?.id || ""));
  const [amount, setAmount] = useState<number>(5000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "WALLET" | "INSTAPAY">("CASH");
  const [purpose, setPurpose] = useState("دفعة أتعاب محاماة");
  const [notes, setNotes] = useState("");

  // Transfer Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Case details
  const selectedCase = cases.find((c) => c.id === caseId);
  const selectedTreasury = treasuries.find((t) => t.paymentMethod === paymentMethod);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError("المبلغ المسدد يجب أن يكون أكبر من الصفر");
      return;
    }

    if (paymentMethod !== "CASH" && !selectedFile) {
      setError("إدراج صورة إشعار التحويل الإلكتروني إلزامي ولا يمكن استكمال العملية بدونه");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("amount", amount.toString());
      formData.append("paymentDate", paymentDate);
      formData.append("paymentMethod", paymentMethod);
      formData.append("purpose", purpose);
      if (notes) formData.append("notes", notes);
      if (paymentType === "CASE" && caseId) {
        formData.append("caseId", caseId);
        if (selectedCase) formData.append("clientId", selectedCase.client.id);
      } else if (clientId) {
        formData.append("clientId", clientId);
      }

      if (selectedFile) {
        formData.append("transferImage", selectedFile);
      }

      const res = await createPaymentWithReceipt(formData);

      if (res.success && res.data) {
        if (caseId) {
          router.push(`/cases/${caseId}`);
        } else {
          router.push("/payments");
        }
        router.refresh();
      } else {
        setError(res.error || "فشل تسجيل الإيصال");
        setIsSubmitting(false);
      }
    } catch {
      setError("حدث خطأ أثناء حفظ الإيصال");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={caseId ? `/cases/${caseId}` : "/payments"}
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-navy-800" />
              <span>تحرير إيصال سداد واستلام نقدية (صفحة كاملة)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              توثيق السداد المالي، إيداعه في الخزينة المحددة، وإدراج صورة إشعار التحويل
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

          {/* Section 1: Target Entity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              توجيه الدفعة المسددة
            </h3>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="ptype"
                  checked={paymentType === "CASE"}
                  onChange={() => setPaymentType("CASE")}
                  className="w-4 h-4 text-navy-800"
                />
                <span>سداد أتعاب على ملف قضية معينة</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="ptype"
                  checked={paymentType === "CLIENT_DIRECT"}
                  onChange={() => setPaymentType("CLIENT_DIRECT")}
                  className="w-4 h-4 text-navy-800"
                />
                <span>سداد مباشر بحساب موكل (أمانات / خدمات عامة)</span>
              </label>
            </div>

            {paymentType === "CASE" ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    اختيار القضية المعنية *
                  </label>
                  <select
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white font-semibold text-slate-900"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        القضية {c.caseNumber}/{c.caseYear} - الموكل: {c.client.name} (المتبقي: {c.remainingAmount} ج.م)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCase && (
                  <div className="grid grid-cols-3 gap-3 text-center pt-2">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[11px] text-slate-400 block">إجمالي أتعاب القضية</span>
                      <span className="font-bold font-mono text-slate-900">
                        {formatCurrency(selectedCase.totalFees)}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[11px] text-slate-400 block">المسدد سابقاً</span>
                      <span className="font-bold font-mono text-emerald-700">
                        {formatCurrency(selectedCase.paidAmount)}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[11px] text-slate-400 block">المتبقي حالياً</span>
                      <span className="font-bold font-mono text-red-700">
                        {formatCurrency(selectedCase.remainingAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1.5">
                  اختيار الموكل *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded bg-white font-semibold text-slate-900"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clientCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 2: Amount & Safe / Method */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              تفاصيل المبلغ والخزينة وطريقة الدفع
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  المبلغ المسدد الآن (ج.م) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  تاريخ التحصيل والسداد *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded font-mono"
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
                  الخزينة المودع بها آلياً
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
                    إدراج صورة إشعار أو إيصال التحويل (إلزامي للتحويلات الإلكترونية) *
                  </label>
                  <span className="text-[11px] text-amber-700">
                    JPG, PNG, PDF (حتى 25 ميجابايت)
                  </span>
                </div>

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center cursor-pointer bg-white hover:bg-amber-50/50 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-amber-800 mx-auto mb-1.5" />
                    <p className="font-bold text-amber-900 text-xs">
                      انقر هنا لاختيار صورة إشعار التحويل البنكي أو إشعار المحفظة
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      سيتم ربط وحفظ صورة الإشعار تلقائياً مع هذا الإيصال
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
                          className="w-14 h-14 rounded object-cover border border-slate-200"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-amber-700" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          جاهز للتخزين في أرشيف المكتب
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

          {/* Section 3: Purpose & Notes */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              البيان والملاحظات
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  بيان السداد (يظهر في الإيصال المطبوع) *
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ملاحظات داخلية للحسابات
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link
              href={caseId ? `/cases/${caseId}` : "/payments"}
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
              <span>{isSubmitting ? "جاري الإيداع والإصدار..." : "إصدار الإيصال وتوريد المبلغ في الخزينة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

