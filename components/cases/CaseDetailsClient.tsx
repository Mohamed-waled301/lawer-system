"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  Trash2,
  Upload,
  Edit,
  History,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DocumentList } from "@/components/documents/DocumentList";
import { useApp } from "@/lib/store";

interface CaseDetailsClientProps {
  caseId: string;
}

export function CaseDetailsClient({ caseId }: CaseDetailsClientProps) {
  const { cases, clients, categories, statuses, staff, payments, deleteCaseHearing, currentUser } =
    useApp();
  const [activeTab, setActiveTab] = useState<"hearings" | "payments" | "documents" | "history">(
    "hearings"
  );
  const [deletingHearingId, setDeletingHearingId] = useState<string | null>(null);

  const caseItem = cases.find((c) => c.id === caseId) || cases[0];

  if (!caseItem) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        القضية غير موجودة أو تم حذفها.
      </div>
    );
  }

  const client = clients.find((c) => c.id === caseItem.clientId);
  const category = categories.find((cat) => cat.id === caseItem.categoryId);
  const status = statuses.find((st) => st.id === caseItem.statusId);
  const lawyer = staff.find((l) => l.id === caseItem.lawyerId);
  const casePayments = payments.filter((p) => p.caseId === caseItem.id);

  const isAdmin = currentUser?.role === "ADMIN";

  const handleDeleteHearing = () => {
    if (!deletingHearingId) return;
    deleteCaseHearing(caseItem.id, deletingHearingId);
    setDeletingHearingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cases"
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع لقائمة القضايا"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                {caseItem.caseNumber} / {caseItem.caseYear}
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {caseItem.court}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              الموكل: {client?.name} ({client?.clientCode})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Case */}
          <Link
            href={`/cases/${caseItem.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-slate-600" />
            <span>تعديل بيانات القضية</span>
          </Link>

          {/* Change Status */}
          <Link
            href={`/cases/${caseItem.id}/status`}
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>تغيير الحالة: {status?.name || "متداولة"}</span>
          </Link>

          {/* Print Case Report */}
          <Link
            href={`/print/case/${caseItem.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة تقرير القضية</span>
          </Link>

          {/* Add Session (Hearing) Button */}
          <Link
            href={`/cases/${caseItem.id}/hearings/new`}
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة جلسة جديدة (صفحة كاملة)</span>
          </Link>
        </div>
      </div>

      {/* Case Overview Summary Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">تصنيف الدعوى</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              [{category?.code || "-"}] {category?.name || "غير مصنف"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">المحامي المسؤول</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {lawyer?.name || "المستشار المناوب"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">الدائرة المختصة</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {caseItem.circuit || "غير محدد"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">الحالة الحالية</span>
            <span
              className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[11px] font-semibold ${
                status?.isClosed
                  ? "bg-slate-100 text-slate-700"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {status?.name || "متداولة"}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-400 block font-medium">الخصم ومحاميه</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {caseItem.opponentName || "غير محدد"}{" "}
              {caseItem.opponentLawyer ? `(المحامي: ${caseItem.opponentLawyer})` : ""}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-400 block font-medium">موضوع الدعوى</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {caseItem.subject || "لا يوجد بيان مختصر"}
            </span>
          </div>
        </div>

        {caseItem.notes && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <strong>ملاحظات القضية: </strong> {caseItem.notes}
          </div>
        )}
      </div>

      {/* Financial Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي الأتعاب المتفق عليها</p>
          <p className="text-xl font-bold font-mono text-slate-900">
            {formatCurrency(caseItem.totalFees)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 mb-1">المسدد حتى الآن</p>
          <p className="text-xl font-bold font-mono text-emerald-700">
            {formatCurrency(caseItem.paidAmount)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 mb-1">المبلغ المتبقي</p>
          <p className="text-xl font-bold font-mono text-rose-700">
            {formatCurrency(caseItem.remainingAmount)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab("hearings")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "hearings"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>جدول الجلسات والأحكام ({caseItem.hearings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>المدفوعات والأتعاب ({casePayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "documents"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>مستندات القضية ({caseItem.documents?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "history"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>تاريخ المراحل والحالة ({caseItem.statusHistory?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Hearings */}
      {activeTab === "hearings" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                سجل جلسات المحكمة والقرارات الصادرة
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                توثيق تواريخ الجلسات، طلبات الدفاع، والقرارات التمهيدية والقطعية
              </p>
            </div>
            <Link
              href={`/cases/${caseItem.id}/hearings/new`}
              prefetch={true}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة جلسة جديدة</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 w-32">تاريخ الجلسة</th>
                  <th className="py-3 px-4">قرار المحكمة / ما تم بالجلسة</th>
                  <th className="py-3 px-4">ملاحظات وطلبات الجلسة</th>
                  <th className="py-3 px-4 w-28 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caseItem.hearings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      لا توجد جلسات مسجلة لهذه القضية حتى الآن.
                    </td>
                  </tr>
                ) : (
                  caseItem.hearings.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-950 whitespace-nowrap">
                        {formatDate(h.hearingDate)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {h.decision || "جلسة قادمة (لم يحدد القرار)"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{h.notes || "-"}</td>
                      <td className="py-3.5 px-4 text-center">
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingHearingId(h.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="حذف الجلسة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payments */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800">سجل سداد أتعاب القضية</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                إيصالات السداد المقبوضة من الموكل عن هذه القضية
              </p>
            </div>
            <Link
              href={`/payments/new?caseId=${caseItem.id}&clientId=${caseItem.clientId}`}
              prefetch={true}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إيصال سداد جديد</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">رقم الإيصال</th>
                  <th className="py-3 px-4">تاريخ السداد</th>
                  <th className="py-3 px-4">البيان</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">المحصل</th>
                  <th className="py-3 px-4 text-left">المبلغ</th>
                  <th className="py-3 px-4 text-center">طباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {casePayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      لم يتم تسجيل أي إيصالات سداد بعد.
                    </td>
                  </tr>
                ) : (
                  casePayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">{p.purpose}</td>
                      <td className="py-3.5 px-4 font-medium">{p.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.recordedByName}</td>
                      <td className="py-3.5 px-4 text-left font-mono font-bold text-emerald-800">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/print/receipt/${p.id}`}
                          target="_blank"
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-800 font-semibold text-[11px]"
                        >
                          طباعة
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                مستندات وأوراق القضية (مرفوعة وممسوحة ضوئياً)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                صحف الدعاوى، المذكرات، أحكام المحاكم وتقارير الخبراء
              </p>
            </div>
            <Link
              href={`/cases/${caseItem.id}/documents/new`}
              prefetch={true}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع أوراق جديدة</span>
            </Link>
          </div>

          <DocumentList
            documents={caseItem.documents || []}
            canDelete={isAdmin}
            onRefresh={() => {}}
          />
        </div>
      )}

      {/* Tab 4: Status History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
            سجل المراحل القضائية والتغيير في الحالة
          </h3>
          {caseItem.statusHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              لا يوجد سجل تغيير حالات بعد.
            </p>
          ) : (
            <div className="relative border-r-2 border-slate-200 mr-2 space-y-4 pr-4">
              {caseItem.statusHistory.map((item) => (
                <div key={item.id} className="relative text-xs">
                  <div className="w-2.5 h-2.5 bg-navy-800 rounded-full absolute -right-[21px] top-1.5"></div>
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                    <span>{formatDate(item.changeDate, true)}</span>
                    <span>بواسطة: {item.changedBy}</span>
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    من <span className="text-slate-600">[{item.fromStatus}]</span> إلى{" "}
                    <span className="text-navy-900">[{item.toStatus}]</span>
                  </div>
                  {item.notes && (
                    <p className="text-slate-600 text-[11px] mt-0.5 bg-slate-50 p-2 rounded">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Hearing Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingHearingId}
        onClose={() => setDeletingHearingId(null)}
        onConfirm={handleDeleteHearing}
        title="حذف الجلسة"
        message="هل أنت متأكد من حذف هذه الجلسة من جدول القضية؟"
        confirmText="تأكيد الحذف"
      />
    </div>
  );
}
