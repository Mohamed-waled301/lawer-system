import { OfficeLetterhead } from "./OfficeLetterhead";
import { formatDateArabicWords, formatCurrency, formatDate } from "@/lib/utils";

interface CaseReportPrintProps {
  caseItem: {
    caseNumber: string;
    caseYear: number;
    court: string;
    circuit?: string | null;
    totalFees: number;
    paidAmount: number;
    remainingAmount: number;
    nextHearingDate?: Date | string | null;
    notes?: string | null;
    createdAt: Date | string;
    client: {
      name: string;
      clientCode: string;
      phone: string;
      nationalId?: string | null;
    };
    lawyer?: {
      name: string;
      barAssociationNumber?: string | null;
    } | null;
    category: {
      code: string;
      name: string;
    };
    status: {
      name: string;
      isClosed: boolean;
    };
    hearings: Array<{
      id: string;
      hearingDate: Date | string;
      court?: string | null;
      decision?: string | null;
      requirements?: string | null;
      attendedBy?: string | null;
    }>;
    payments: Array<{
      id: string;
      receiptNumber: string;
      paymentDate: Date | string;
      amount: number;
      paymentMethod: string;
      purpose?: string | null;
    }>;
  };
  settings?: Record<string, string>;
}

export function CaseReportPrint({ caseItem, settings }: CaseReportPrintProps) {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-slate-900 font-sans print:p-0 print:max-w-none">
      <OfficeLetterhead
        settings={settings}
        documentTitle={`تقرير ملف القضية رقم ${caseItem.caseNumber} لسنة ${caseItem.caseYear}`}
        referenceNumber={`${caseItem.caseNumber}/${caseItem.caseYear}`}
      />

      {/* Case Overview Information */}
      <div className="border border-slate-300 rounded-md p-4 mb-6 bg-slate-50 text-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-200 pb-2">
          بيانات الدعوى والأطراف
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="text-slate-500 block">الموكل:</span>
            <span className="font-bold text-slate-900 text-sm">
              {caseItem.client.name}
            </span>
            <span className="text-slate-400 block font-mono">
              (كود: {caseItem.client.clientCode})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">المحكمة والدائرة:</span>
            <span className="font-bold text-slate-900">
              {caseItem.court} {caseItem.circuit ? `- ${caseItem.circuit}` : ""}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">تصنيف القضية:</span>
            <span className="font-bold text-slate-900">
              [{caseItem.category.code}] {caseItem.category.name}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">المحامي المسؤول:</span>
            <span className="font-bold text-slate-900">
              {caseItem.lawyer?.name || "مكتب المحاماة"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">الحالة القضائية:</span>
            <span className="font-bold text-navy-900 text-sm">
              {caseItem.status.name}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">الجلسة القادمة:</span>
            <span className="font-bold text-slate-900">
              {caseItem.nextHearingDate
                ? formatDate(caseItem.nextHearingDate)
                : "غير محددة حالياً"}
            </span>
          </div>
        </div>

        {caseItem.notes && (
          <div className="mt-3 pt-2 border-t border-slate-200 text-slate-700">
            <strong>ملاحظات القضية: </strong> {caseItem.notes}
          </div>
        )}
      </div>

      {/* Financial Status Summary */}
      <div className="border border-slate-300 rounded-md p-4 mb-6 bg-white text-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3">الموقف المالي للأتعاب</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-1">الأتعاب المتفق عليها</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatCurrency(caseItem.totalFees)}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded">
            <span className="text-emerald-700 block mb-1">المسدد حتى تاريخه</span>
            <span className="font-bold text-emerald-800 text-sm">
              {formatCurrency(caseItem.paidAmount)}
            </span>
          </div>
          <div className="p-2.5 bg-red-50 border border-red-200 rounded">
            <span className="text-red-700 block mb-1">المبلغ المتبقي</span>
            <span className="font-bold text-red-800 text-sm">
              {formatCurrency(caseItem.remainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Hearings Chronology */}
      <div className="mb-6 space-y-2">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
          سجل الجلسات والقرارات ({caseItem.hearings.length})
        </h3>
        {caseItem.hearings.length === 0 ? (
          <p className="text-xs text-slate-500 py-2 text-center bg-slate-50 rounded">
            لم تسجل أي جلسات بعد.
          </p>
        ) : (
          <table className="w-full text-xs text-right border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 p-2 w-28">تاريخ الجلسة</th>
                <th className="border border-slate-300 p-2">قرار المحكمة</th>
                <th className="border border-slate-300 p-2">المطلوب للجلسة القادمة</th>
                <th className="border border-slate-300 p-2 w-32">المحامي الحاضر</th>
              </tr>
            </thead>
            <tbody>
              {caseItem.hearings.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono font-semibold">
                    {formatDate(h.hearingDate)}
                  </td>
                  <td className="border border-slate-300 p-2 font-medium">
                    {h.decision || "-"}
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-700">
                    {h.requirements || "-"}
                  </td>
                  <td className="border border-slate-300 p-2">{h.attendedBy || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payments History */}
      <div className="mb-6 space-y-2">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
          سجل الدفعات والإيصالات المسددة ({caseItem.payments.length})
        </h3>
        {caseItem.payments.length === 0 ? (
          <p className="text-xs text-slate-500 py-2 text-center bg-slate-50 rounded">
            لم تسجل أي دفعات مسددة حتى الآن.
          </p>
        ) : (
          <table className="w-full text-xs text-right border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 p-2 w-28">رقم الإيصال</th>
                <th className="border border-slate-300 p-2 w-28">تاريخ السداد</th>
                <th className="border border-slate-300 p-2">طريقة الدفع</th>
                <th className="border border-slate-300 p-2">الغرض / البيان</th>
                <th className="border border-slate-300 p-2 text-left w-32">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {caseItem.payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono font-bold text-navy-900">
                    {p.receiptNumber}
                  </td>
                  <td className="border border-slate-300 p-2 font-mono">
                    {formatDate(p.paymentDate)}
                  </td>
                  <td className="border border-slate-300 p-2">{p.paymentMethod}</td>
                  <td className="border border-slate-300 p-2 text-slate-700">
                    {p.purpose || "دفعة أتعاب"}
                  </td>
                  <td className="border border-slate-300 p-2 text-left font-mono font-bold text-emerald-800">
                    {formatCurrency(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-500 pt-6 border-t border-slate-200">
        <span>تحريراً في: {formatDateArabicWords(new Date())}</span>
        <span>توقيع وختم المحامي المشرف</span>
      </div>
    </div>
  );
}

