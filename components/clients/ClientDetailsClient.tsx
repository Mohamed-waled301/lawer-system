"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Plus,
  Briefcase,
  Calendar,
  MessageSquare,
  Receipt,
  FileText,
  Phone,
  MapPin,
  ArrowRight,
  Upload,
  Edit,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DocumentList } from "@/components/documents/DocumentList";
import { useApp } from "@/lib/store";

interface ClientDetailsProps {
  clientId: string;
}

export function ClientDetailsClient({ clientId }: ClientDetailsProps) {
  const { clients, cases, consultations, payments, categories, statuses, staff, currentUser, deleteClientDocument } =
    useApp();
  const [activeTab, setActiveTab] = useState<"cases" | "consultations" | "payments" | "documents">(
    "cases"
  );

  const client = clients.find((c) => c.id === clientId) || clients[0];

  if (!client) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        ملف الموكل غير موجود أو تم حذفه.
      </div>
    );
  }

  const clientCases = cases.filter((c) => c.clientId === client.id && !c.isDeleted);
  const clientConsultations = consultations.filter((con) => con.clientId === client.id);
  const clientPayments = payments.filter((p) => p.clientId === client.id);

  const totalAgreed = clientCases.reduce((sum, c) => sum + c.totalFees, 0);
  const totalPaid = clientCases.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalRemaining = clientCases.reduce((sum, c) => sum + c.remainingAmount, 0);

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="p-2 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="رجوع للموكلين"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                {client.clientCode}
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {client.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تاريخ التسجيل: {formatDate(client.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Client Full Page */}
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-600" />
            <span>تعديل بيانات الموكل</span>
          </Link>

          {/* Print Client File */}
          <Link
            href={`/print/client/${client.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة ملف الموكل</span>
          </Link>

          {/* Add Case inside Client Page */}
          <Link
            href={`/cases/new?clientId=${client.id}`}
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>افتتاح قضية جديدة لهذا الموكل (صفحة كاملة)</span>
          </Link>
        </div>
      </div>

      {/* Client Overview Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block font-medium">رقم الهاتف</span>
            <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900 text-sm" dir="ltr">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{client.phone}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block font-medium">الرقم القومي (14 رقم)</span>
            <span className="font-bold font-mono text-slate-900 text-sm">
              {client.nationalId || "غير مسجل"}
            </span>
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-slate-400 block font-medium">العنوان المسجل</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{client.address || "لا يوجد عنوان تفصيلي مسجل"}</span>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <strong>ملاحظات: </strong> {client.notes}
          </div>
        )}
      </div>

      {/* Financial Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي الأتعاب المتفق عليها</p>
          <p className="text-xl font-bold font-mono text-slate-900">
            {formatCurrency(totalAgreed)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي المسدد</p>
          <p className="text-xl font-bold font-mono text-emerald-700">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-500 mb-1">المبلغ المتبقي بذمته</p>
          <p className="text-xl font-bold font-mono text-red-700">
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab("cases")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "cases"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>القضايا المسجلة ({clientCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("consultations")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "consultations"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>الاستشارات السابقة ({clientConsultations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>إيصالات وسندات السداد ({clientPayments.length})</span>
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
          <span>مستندات وأوراق الموكل ({client.documents?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Cases */}
      {activeTab === "cases" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">رقم القضية</th>
                  <th className="py-3 px-4">المحكمة والفرع</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">المحامي المسؤول</th>
                  <th className="py-3 px-4">المتبقي</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      لا توجد قضايا مسجلة لهذا الموكل حتى الآن.
                    </td>
                  </tr>
                ) : (
                  clientCases.map((cs) => {
                    const cat = categories.find((c) => c.id === cs.categoryId);
                    const st = statuses.find((s) => s.id === cs.statusId);
                    const law = staff.find((l) => l.id === cs.lawyerId);

                    return (
                      <tr key={cs.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                          <Link href={`/cases/${cs.id}`} className="hover:underline">
                            {cs.caseNumber} / {cs.caseYear}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{cs.court}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                            {cat?.name || "عام"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              st?.isClosed
                                ? "bg-slate-100 text-slate-600"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {st?.name || "متداولة"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {law?.name || "المستشار المناوب"}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-red-700 text-xs">
                          {formatCurrency(cs.remainingAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/cases/${cs.id}`}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded text-[11px]"
                          >
                            فتح القضية
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Consultations */}
      {activeTab === "consultations" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">تاريخ الاستشارة</th>
                  <th className="py-3 px-4">الموضوع</th>
                  <th className="py-3 px-4">المحامي</th>
                  <th className="py-3 px-4">المبلغ المسدد</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      لا توجد استشارات مسجلة لهذا الموكل.
                    </td>
                  </tr>
                ) : (
                  clientConsultations.map((con) => (
                    <tr key={con.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {formatDate(con.date)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {con.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {staff.find((s) => s.id === con.lawyerId)?.name || "-"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {formatCurrency(con.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{con.paymentMethod}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payments */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
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
                {clientPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      لا توجد مدفوعات مسجلة لهذا الموكل بعد.
                    </td>
                  </tr>
                ) : (
                  clientPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">{p.purpose}</td>
                      <td className="py-3.5 px-4">{p.paymentMethod}</td>
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

      {/* Tab 4: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                أرشيف مستندات وأوراق الموكل
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                صور التوكيلات الرسمية، بطاقات الهوية، والمستندات العامة
              </p>
            </div>
            <Link
              href={`/clients/${client.id}/documents/new`}
              prefetch={true}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded"
            >
              <Upload className="w-4 h-4" />
              <span>رفع مستند جديد</span>
            </Link>
          </div>

          <DocumentList
            documents={client.documents || []}
            canDelete={isAdmin}
            onRefresh={() => {}}
          />
        </div>
      )}
    </div>
  );
}
