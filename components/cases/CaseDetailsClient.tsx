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
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteHearing } from "@/actions/cases";
import { DocumentList } from "@/components/documents/DocumentList";
import { useRouter } from "next/navigation";

interface CaseDetailsClientProps {
  caseItem: any;
  statuses: Array<{ id: string; name: string; isClosed: boolean }>;
  userRole?: string;
  userName?: string;
}

export function CaseDetailsClient({
  caseItem,
  statuses,
  userRole,
}: CaseDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "hearings" | "payments" | "documents" | "history"
  >("hearings");

  const [deletingHearingId, setDeletingHearingId] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";

  const handleDeleteHearing = async () => {
    if (!deletingHearingId) return;
    try {
      const res = await deleteHearing(deletingHearingId);
      if (res.success) {
        setDeletingHearingId(null);
        router.refresh();
      } else {
        alert(res.error || "فشل حذف الجلسة");
      }
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cases"
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع للقضايا"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                [{caseItem.category.code}] {caseItem.category.name}
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                القضية رقم {caseItem.caseNumber} لسنة {caseItem.caseYear}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {caseItem.court} {caseItem.circuit ? `- ${caseItem.circuit}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Case Full Page */}
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
            <span>تغيير الحالة: {caseItem.status.name}</span>
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

          {/* Add Hearing Full Page Link */}
          <Link
            href={`/cases/${caseItem.id}/hearings/new`}
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة جلسة (صفحة كاملة)</span>
          </Link>
        </div>
      </div>

      {/* Case Details Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Client Info Card */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
          <span className="text-slate-400 block font-medium">الموكل صاحب القضية</span>
          <Link
            href={`/clients/${caseItem.client.id}`}
            className="font-bold text-slate-900 text-sm hover:underline hover:text-navy-900 block"
          >
            {caseItem.client.name}
          </Link>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
            <span>كود: {caseItem.client.clientCode}</span>
            <span dir="ltr">{caseItem.client.phone}</span>
          </div>
        </div>

        {/* Lawyer & Status Card */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
          <span className="text-slate-400 block font-medium">المحامي المشرف</span>
          <p className="font-bold text-slate-900 text-sm">
            {caseItem.lawyer?.name || "المكتب مباشرة"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-slate-400">الحالة:</span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              {caseItem.status.name}
            </span>
          </div>
        </div>

        {/* Next Hearing Card */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
          <span className="text-slate-400 block font-medium">الجلسة القادمة</span>
          <p className="font-bold font-mono text-slate-900 text-sm">
            {caseItem.nextHearingDate
              ? formatDate(caseItem.nextHearingDate)
              : "غير محددة حالياً"}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {caseItem.hearings[0]?.requirements || "لا توجد طلبات مسجلة"}
          </p>
        </div>

        {/* Financial Balance Card */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 font-medium">
            <span>الأتعاب: {formatCurrency(caseItem.totalFees)}</span>
            <span className="text-emerald-700">مسدد: {formatCurrency(caseItem.paidAmount)}</span>
          </div>
          <div className="pt-1 flex items-baseline justify-between">
            <span className="text-slate-700 font-bold">المتبقي:</span>
            <span className="text-lg font-black font-mono text-red-700">
              {formatCurrency(caseItem.remainingAmount)}
            </span>
          </div>
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
          <span>سجل الجلسات ({caseItem.hearings.length})</span>
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
          <span>سجل الأتعاب والدفعات ({caseItem.payments.length})</span>
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
          <span>أوراق ومستندات القضية ({caseItem.documents.length})</span>
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
          <span>تاريخ تغيير الحالات ({caseItem.statusHistory?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Hearings */}
      {activeTab === "hearings" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800">
              سجل جلسات المحكمة والقرارات الصادرة
            </h3>
            {/* Link to Dedicated Full Page */}
            <Link
              href={`/cases/${caseItem.id}/hearings/new`}
              prefetch={true}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة جلسة جديدة (صفحة كاملة)</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4 w-32">تاريخ الجلسة</th>
                    <th className="py-3 px-4">قرار المحكمة</th>
                    <th className="py-3 px-4">المطلوب للجلسة القادمة</th>
                    <th className="py-3 px-4 w-36">المحامي الحاضر</th>
                    {isAdmin && <th className="py-3 px-4 text-center w-16">حذف</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseItem.hearings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        لا توجد جلسات مسجلة لهذه القضية حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    caseItem.hearings.map((h: any) => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatDate(h.hearingDate)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {h.decision || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {h.requirements || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {h.attendedBy || "-"}
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setDeletingHearingId(h.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="حذف الجلسة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payments */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                سجل سداد الأتعاب والإيصالات
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                المسدد: {formatCurrency(caseItem.paidAmount)} • المتبقي:{" "}
                <span className="font-bold text-red-700 font-mono">
                  {formatCurrency(caseItem.remainingAmount)}
                </span>
              </p>
            </div>
            {/* Link to Full Page Form with preselected case */}
            <Link
              href={`/payments/new?caseId=${caseItem.id}&clientId=${caseItem.clientId}`}
              prefetch={true}
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تحرير إيصال سداد (صفحة كاملة مع صورة التحويل)</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">رقم الإيصال</th>
                    <th className="py-3 px-4">تاريخ السداد</th>
                    <th className="py-3 px-4">طريقة الدفع والخزينة</th>
                    <th className="py-3 px-4">البيان</th>
                    <th className="py-3 px-4">المحصل</th>
                    <th className="py-3 px-4 text-left">المبلغ</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseItem.payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        لا توجد دفعات مسجلة لهذه القضية.
                      </td>
                    </tr>
                  ) : (
                    caseItem.payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          <div>{p.paymentMethod}</div>
                          {p.transferProofPath && (
                            <a
                              href={`/api/documents/${p.id}`}
                              target="_blank"
                              className="inline-block mt-0.5 text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold hover:underline"
                            >
                              عرض صورة الإشعار
                            </a>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{p.purpose || "-"}</td>
                        <td className="py-3.5 px-4 text-slate-600">{p.recordedByName}</td>
                        <td className="py-3.5 px-4 text-left font-mono font-bold text-emerald-800">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/print/receipt/${p.id}`}
                            target="_blank"
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded text-[11px]"
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
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-slate-200">
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
            documents={caseItem.documents}
            canDelete={isAdmin}
            onRefresh={() => router.refresh()}
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
              {caseItem.statusHistory.map((item: any) => (
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
        message="هل أنت متأكد من حذف هذه الجلسة؟ سيتم حذفها من السجل وإعادة تعيين موعد الجلسة القادمة تلقائياً."
        confirmText="تأكيد الحذف"
      />
    </div>
  );
}
