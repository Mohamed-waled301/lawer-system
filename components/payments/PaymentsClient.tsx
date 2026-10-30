"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Search,
  Receipt,
  Trash2,
  Calendar,
  CreditCard,
  Building,
  CheckCircle,
  Plus,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useApp } from "@/lib/store";

interface PaymentItem {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentDate: Date | string;
  paymentMethod: string;
  transferProofPath?: string | null;
  purpose?: string | null;
  notes?: string | null;
  recordedByName: string;
  treasury?: {
    id: string;
    name: string;
    paymentMethod: string;
  } | null;
  case?: {
    id: string;
    caseNumber: string;
    caseYear: number;
    court: string;
  } | null;
  client?: {
    id: string;
    clientCode: string;
    name: string;
  } | null;
  consultation?: {
    id: string;
    personName: string;
    subject: string;
  } | null;
}

interface PaymentsClientProps {
  initialPayments?: PaymentItem[];
  userRole?: string;
}

export function PaymentsClient({ initialPayments, userRole }: PaymentsClientProps) {
  const {
    payments: storedPayments,
    deletePayment: storeDeletePayment,
    cases,
    clients,
    treasuries,
    consultations,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const isAdmin = (userRole || currentUser?.role) === "ADMIN";

  // Merge stored payments with related entities
  const displayPayments = storedPayments.map((p) => {
    const linkedCase = p.caseId ? cases.find((c) => c.id === p.caseId) : null;
    const linkedClient = p.clientId
      ? clients.find((c) => c.id === p.clientId)
      : linkedCase?.clientId
      ? clients.find((c) => c.id === linkedCase.clientId)
      : null;
    const linkedConsultation = p.consultationId
      ? consultations.find((cn) => cn.id === p.consultationId)
      : null;
    const linkedTreasury = p.treasuryId
      ? treasuries.find((t) => t.id === p.treasuryId)
      : treasuries.find((t) => t.paymentMethod === p.paymentMethod);

    return {
      ...p,
      client: linkedClient
        ? {
            id: linkedClient.id,
            clientCode: linkedClient.clientCode,
            name: linkedClient.name,
          }
        : null,
      case: linkedCase
        ? {
            id: linkedCase.id,
            caseNumber: linkedCase.caseNumber,
            caseYear: linkedCase.caseYear,
            court: linkedCase.court,
          }
        : null,
      consultation: linkedConsultation
        ? {
            id: linkedConsultation.id,
            personName: linkedConsultation.personName,
            subject: linkedConsultation.subject,
          }
        : null,
      treasury: linkedTreasury
        ? {
            id: linkedTreasury.id,
            name: linkedTreasury.name,
            paymentMethod: linkedTreasury.paymentMethod,
          }
        : null,
    };
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      storeDeletePayment(deletingId);
      setDeletingId(null);
    } catch {
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = displayPayments.filter((p) => {
    const q = search.trim().toLowerCase();
    const payer = p.client?.name || p.consultation?.personName || "";
    const matchesSearch =
      !q ||
      p.receiptNumber.toLowerCase().includes(q) ||
      payer.toLowerCase().includes(q) ||
      (p.purpose && p.purpose.toLowerCase().includes(q));

    const matchesMethod =
      methodFilter === "ALL" || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalSum = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            سجل المدفوعات وإيصالات السداد
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل التدفقات المالية والمقبوضات الصادرة من المكتب لكافة القضايا والاستشارات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">إجمالي المعروض:</span>
            <span className="text-base font-black font-mono text-emerald-800">
              {formatCurrency(totalSum)}
            </span>
          </div>

          <Link
            href="/payments/new"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل إيصال سداد جديد (صفحة كاملة)</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الإيصال (REC-0001)، اسم الموكل، أو البيان..."
            className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 font-medium"
          >
            <option value="ALL">جميع طرق الدفع</option>
            <option value="CASH">نقداً بالخزينة</option>
            <option value="WALLET">محافظ إلكترونية</option>
            <option value="INSTAPAY">تحويل إنستاباي</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">رقم الإيصال</th>
                <th className="py-3 px-4">تاريخ السداد</th>
                <th className="py-3 px-4">المسدد منه</th>
                <th className="py-3 px-4">البيان / الغرض</th>
                <th className="py-3 px-4">القضية المرتبطة</th>
                <th className="py-3 px-4">طريقة الدفع والخزينة</th>
                <th className="py-3 px-4">المحصل</th>
                <th className="py-3 px-4 text-left">المبلغ</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا توجد إيصالات سداد مسجلة تطابق البحث.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {item.receiptNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {formatDate(item.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.client ? (
                        <div>
                          <Link
                            href={`/clients/${item.client.id}`}
                            className="font-bold text-slate-900 hover:underline"
                          >
                            {item.client.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.client.clientCode}
                          </span>
                        </div>
                      ) : item.consultation ? (
                        <div>
                          <span className="font-bold text-slate-900">
                            {item.consultation.personName}
                          </span>
                          <span className="text-[10px] text-purple-700 block">
                            (استشارة قانونية)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">عميل مباشر</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {item.purpose || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {item.case ? (
                        <Link
                          href={`/cases/${item.case.id}`}
                          className="hover:underline text-navy-900 font-bold"
                        >
                          {item.case.caseNumber} / {item.case.caseYear}
                        </Link>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.paymentMethod === "CASH"
                              ? "bg-slate-100 text-slate-800 border border-slate-200"
                              : item.paymentMethod === "INSTAPAY"
                              ? "bg-purple-50 text-purple-800 border border-purple-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {item.paymentMethod === "CASH"
                            ? "نقداً بالخزينة"
                            : item.paymentMethod === "INSTAPAY"
                            ? "إنستاباي / بنكي"
                            : "محفظة إلكترونية"}
                        </span>

                        {item.treasury && (
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {item.treasury.name}
                          </span>
                        )}

                        {item.transferProofPath && (
                          <button
                            type="button"
                            onClick={() => setViewingImage(item.transferProofPath || null)}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline mt-0.5"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>عرض إشعار التحويل المرفق</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.recordedByName}
                    </td>
                    <td className="py-3.5 px-4 text-left font-mono font-bold text-emerald-800 text-sm whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/print/receipt/${item.id}`}
                          target="_blank"
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded text-[11px] flex items-center gap-1"
                          title="طباعة إيصال السداد الرسمي"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span>طباعة</span>
                        </Link>

                        {isAdmin && (
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="إلغاء وحذف الإيصال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[90vh] overflow-auto space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">صورة إشعار / إيصال التحويل المرفق</h3>
              <button
                onClick={() => setViewingImage(null)}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm"
              >
                ✕ إغلاق
              </button>
            </div>
            <div className="flex justify-center bg-slate-50 p-2 rounded border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingImage}
                alt="إشعار التحويل"
                className="max-h-[70vh] object-contain rounded"
              />
            </div>
            <div className="text-right">
              <a
                href={viewingImage}
                download="transfer-proof.png"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح بحجم كامل / تحميل</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="إلغاء وحذف إيصال السداد"
        message="هل أنت متأكد من إلغاء هذا الإيصال؟ سيتم خصم هذا المبلغ فوراً من رصيد القضية وإعادة احتساب المتبقي على الموكل."
        confirmText="تأكيد الحذف"
        isLoading={isDeleting}
      />
    </div>
  );
}
