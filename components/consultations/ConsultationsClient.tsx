"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ArrowRightLeft,
  Printer,
  CheckCircle,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ConsultationItem {
  id: string;
  personName: string;
  phone: string;
  date: Date | string;
  subject: string;
  amountPaid: number;
  paymentMethod: string;
  transferProofPath?: string | null;
  notes?: string | null;
  isConvertedToCase: boolean;
  convertedCaseId?: string | null;
  lawyer?: {
    id: string;
    name: string;
  } | null;
  client?: {
    id: string;
    clientCode: string;
    name: string;
  } | null;
}

interface ConsultationsClientProps {
  initialConsultations: ConsultationItem[];
  userRole?: string;
}

export function ConsultationsClient({
  initialConsultations,
  userRole,
}: ConsultationsClientProps) {
  const [consultations] = useState<ConsultationItem[]>(initialConsultations);
  const [search, setSearch] = useState("");

  const filtered = consultations.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.personName.toLowerCase().includes(q) ||
      item.phone.includes(q) ||
      item.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            الاستشارات القانونية
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل الاستشارات، الأتعاب المسددة، وإمكانية التحويل المباشر لملف قضية
          </p>
        </div>

        {/* Link to Full Page Form */}
        <Link
          href="/consultations/new"
          prefetch={true}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل استشارة جديدة (صفحة كاملة مع صورة الإشعار)</span>
        </Link>
      </div>

      {/* Core Rule Callout */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex items-start gap-3 text-xs text-slate-700">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">القاعدة المحاسبية الأساسية: </strong>
          رسوم الاستشارة القانونية إيراد مستقل تماماً لا يسترد تحت أي ظرف، ولا يخصم من أتعاب
          القضية في حال المضي قدماً وفتح دعوى قضائية.
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between text-xs">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الشخص، رقم الهاتف، أو موضوع الاستشارة..."
            className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          إجمالي الاستشارات: <span className="font-bold font-mono">{filtered.length}</span>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">طالب الاستشارة</th>
                <th className="py-3 px-4">الهاتف</th>
                <th className="py-3 px-4">المحامي المستشار</th>
                <th className="py-3 px-4">موضوع الاستشارة</th>
                <th className="py-3 px-4">المبلغ المسدد</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا توجد استشارات مطابقة.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {item.personName}
                      </span>
                      {item.client && (
                        <span className="text-[10px] text-navy-800 font-mono">
                          (موكل: {item.client.clientCode})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700" dir="ltr">
                      {item.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.lawyer?.name || "المستشار المناوب"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {formatCurrency(item.amountPaid)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{item.paymentMethod}</div>
                      {item.transferProofPath && (
                        <a
                          href={`/api/documents/proof?path=${encodeURIComponent(item.transferProofPath)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-1 py-0.5 rounded border border-emerald-200 block mt-0.5 underline"
                        >
                          عرض صورة التحويل
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isConvertedToCase ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>حُولت لقضية</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                          استشارة فقط
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Convert to Case Button -> Link to Full Page */}
                        {!item.isConvertedToCase && (
                          <Link
                            href={`/consultations/${item.id}/convert`}
                            prefetch={true}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-[11px] flex items-center gap-1 transition-colors"
                            title="تحويل هذه الاستشارة إلى ملف قضية وموكل رسمي (صفحة كاملة)"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>تحويل لقضية</span>
                          </Link>
                        )}

                        {item.isConvertedToCase && item.convertedCaseId && (
                          <Link
                            href={`/cases/${item.convertedCaseId}`}
                            prefetch={true}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold rounded text-[11px] flex items-center gap-1"
                          >
                            <Briefcase className="w-3 h-3" />
                            <span>عرض القضية</span>
                          </Link>
                        )}

                        {/* Print Receipt */}
                        <Link
                          href={`/print/consultation/${item.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                          title="طباعة إيصال الاستشارة والرأي"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
