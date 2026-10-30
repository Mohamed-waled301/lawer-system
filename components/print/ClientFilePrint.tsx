import { OfficeLetterhead } from "./OfficeLetterhead";
import { formatDateArabicWords, formatCurrency, formatDate } from "@/lib/utils";

interface ClientFilePrintProps {
  client: {
    clientCode: string;
    name: string;
    nationalId?: string | null;
    phone: string;
    address?: string | null;
    notes?: string | null;
    cases: Array<{
      id: string;
      caseNumber: string;
      caseYear: number;
      court: string;
      circuit?: string | null;
      category: { name: string; code: string };
      status: { name: string; isClosed: boolean };
      lawyer?: { name: string } | null;
      totalFees: number;
      paidAmount: number;
      remainingAmount: number;
      nextHearingDate?: Date | string | null;
    }>;
    consultations?: Array<{
      id: string;
      date: Date | string;
      subject: string;
      amountPaid: number;
    }>;
    payments?: Array<{
      receiptNumber: string;
      paymentDate: Date | string;
      amount: number;
      purpose?: string | null;
    }>;
  };
  settings?: Record<string, string>;
}

export function ClientFilePrint({ client, settings }: ClientFilePrintProps) {
  const totalAgreed = client.cases.reduce((acc, c) => acc + c.totalFees, 0);
  const totalPaid = client.cases.reduce((acc, c) => acc + c.paidAmount, 0);
  const totalRemaining = client.cases.reduce((acc, c) => acc + c.remainingAmount, 0);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-slate-900 font-sans print:p-0 print:max-w-none">
      <OfficeLetterhead
        settings={settings}
        documentTitle={`ملف الموكل الشامل: ${client.name}`}
        referenceNumber={client.clientCode}
      />

      {/* Client Overview Card */}
      <div className="border border-slate-300 rounded-md p-4 mb-6 bg-slate-50 text-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-200 pb-2">
          البيانات الأساسية للموكل
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-500 block">كود الموكل:</span>
            <span className="font-bold font-mono text-slate-900 text-sm">
              {client.clientCode}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">الاسم بالكامل:</span>
            <span className="font-bold text-slate-900">{client.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">الرقم القومي:</span>
            <span className="font-bold font-mono text-slate-900">
              {client.nationalId || "غير مسجل"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">رقم الهاتف:</span>
            <span className="font-bold font-mono text-slate-900" dir="ltr">
              {client.phone}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block">العنوان:</span>
            <span className="font-medium text-slate-800">
              {client.address || "غير مسجل"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block">ملاحظات عامة:</span>
            <span className="font-medium text-slate-800">{client.notes || "-"}</span>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
          <h3 className="font-bold text-slate-900 text-sm">
            بيان القضايا الموكلة للمكتب ({client.cases.length})
          </h3>
          <span className="text-xs text-slate-500">
            مفتوحة: {client.cases.filter((c) => !c.status.isClosed).length} • مغلقة:{" "}
            {client.cases.filter((c) => c.status.isClosed).length}
          </span>
        </div>

        {client.cases.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 border border-slate-200 rounded">
            لا توجد قضايا مسجلة لهذا الموكل حتى الآن.
          </p>
        ) : (
          <table className="w-full text-xs text-right border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-300 p-2">رقم القضية</th>
                <th className="border border-slate-300 p-2">المحكمة / الدائرة</th>
                <th className="border border-slate-300 p-2">التصنيف</th>
                <th className="border border-slate-300 p-2">المحامي المسؤول</th>
                <th className="border border-slate-300 p-2">الحالة الحالية</th>
                <th className="border border-slate-300 p-2">الجلسة القادمة</th>
                <th className="border border-slate-300 p-2 text-left">المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {client.cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-bold font-mono">
                    {c.caseNumber} / {c.caseYear}
                  </td>
                  <td className="border border-slate-300 p-2">
                    {c.court} {c.circuit ? `- ${c.circuit}` : ""}
                  </td>
                  <td className="border border-slate-300 p-2">{c.category.name}</td>
                  <td className="border border-slate-300 p-2">
                    {c.lawyer?.name || "-"}
                  </td>
                  <td className="border border-slate-300 p-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        c.status.isClosed
                          ? "bg-slate-100 text-slate-600"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {c.status.name}
                    </span>
                  </td>
                  <td className="border border-slate-300 p-2">
                    {c.nextHearingDate ? formatDate(c.nextHearingDate) : "لا توجد"}
                  </td>
                  <td className="border border-slate-300 p-2 text-left font-mono font-bold text-red-700">
                    {formatCurrency(c.remainingAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Financial Summary */}
      <div className="border border-slate-300 rounded p-4 bg-slate-50/50 mb-6">
        <h4 className="text-xs font-bold text-slate-800 mb-2">
          الملخص المالي العام لقضايا الموكل
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 text-[11px] block">إجمالي الأتعاب</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatCurrency(totalAgreed)}
            </span>
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 text-[11px] block">إجمالي المسدد</span>
            <span className="font-bold text-emerald-700 text-sm">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 text-[11px] block">إجمالي المتبقي</span>
            <span className="font-bold text-red-700 text-sm">
              {formatCurrency(totalRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-500 pt-6 border-t border-slate-200">
        <span>تاريخ طباعة التقرير: {formatDateArabicWords(new Date())}</span>
        <span>اعتماد الإدارة القانونية للمكتب</span>
      </div>
    </div>
  );
}

