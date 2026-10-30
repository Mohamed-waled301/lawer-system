import { OfficeLetterhead } from "./OfficeLetterhead";
import { formatDateArabicWords, formatCurrency } from "@/lib/utils";

interface ReceiptPrintProps {
  receipt: {
    receiptNumber: string;
    amount: number;
    paymentDate: Date | string;
    paymentMethod: string;
    purpose?: string | null;
    notes?: string | null;
    recordedByName: string;
    client?: {
      name: string;
      clientCode: string;
      phone: string;
      nationalId?: string | null;
    } | null;
    case?: {
      caseNumber: string;
      caseYear: number;
      court: string;
    } | null;
    consultation?: {
      personName: string;
      subject: string;
    } | null;
  };
  settings?: Record<string, string>;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "نقداً (خزينة المكتب)",
  WALLET: "محفظة إلكترونية (فودافون كاش / أورانج / اتصالات)",
  INSTAPAY: "تحويل بنكي / إنستاباي (InstaPay)",
};

export function ReceiptPrint({ receipt, settings }: ReceiptPrintProps) {
  const payerName =
    receipt.client?.name ||
    receipt.consultation?.personName ||
    "المستلم منه";

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto text-slate-900 font-sans print:p-0 print:max-w-none">
      <OfficeLetterhead
        settings={settings}
        documentTitle="إيصال استلام نقدية وسداد أتعاب"
        referenceNumber={receipt.receiptNumber}
      />

      {/* Main Receipt Content */}
      <div className="border border-slate-300 rounded-md p-6 space-y-5 bg-slate-50/40">
        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
          <div>
            <span className="text-slate-500 font-medium">تاريخ السداد: </span>
            <span className="font-bold text-slate-900">
              {formatDateArabicWords(receipt.paymentDate)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">طريقة الدفع: </span>
            <span className="font-bold text-slate-900">
              {METHOD_LABELS[receipt.paymentMethod] || receipt.paymentMethod}
            </span>
          </div>
        </div>

        <div className="text-base leading-loose space-y-3">
          <p>
            استلمنا من السيد / السيدة:{" "}
            <span className="font-extrabold text-slate-950 underline underline-offset-4 decoration-slate-400">
              {payerName}
            </span>
            {receipt.client?.clientCode && (
              <span className="text-xs text-slate-500 font-mono mr-2">
                (كود الموكل: {receipt.client.clientCode})
              </span>
            )}
          </p>

          <div className="flex items-center gap-4 bg-white p-3 border border-slate-300 rounded">
            <span className="text-sm font-semibold text-slate-700">المبلغ وقدره:</span>
            <span className="text-lg font-black text-slate-950 px-3 py-0.5 bg-slate-100 rounded border border-slate-200">
              {formatCurrency(receipt.amount)}
            </span>
          </div>

          <p>
            وذلك نظير:{" "}
            <span className="font-semibold text-slate-900">
              {receipt.purpose || "سداد دفعة أتعاب قانونية"}
            </span>
          </p>

          {receipt.case && (
            <p className="text-sm text-slate-700 bg-slate-100/70 p-2.5 rounded border border-slate-200">
              الخاص بالقضية رقم:{" "}
              <span className="font-bold text-slate-900">
                {receipt.case.caseNumber} لسنة {receipt.case.caseYear}
              </span>{" "}
              - المنظورة أمام:{" "}
              <span className="font-semibold">{receipt.case.court}</span>
            </p>
          )}

          {receipt.notes && (
            <p className="text-xs text-slate-600 italic">
              ملاحظات: {receipt.notes}
            </p>
          )}
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-300 text-center text-xs">
          <div>
            <p className="font-semibold text-slate-700">توقيع المستلم / المودع</p>
            <div className="h-14"></div>
            <p className="text-slate-400">....................................</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">المسؤول عن التحرير / الحسابات</p>
            <p className="text-slate-900 font-bold mt-1">{receipt.recordedByName}</p>
            <div className="h-8"></div>
            <p className="text-slate-400">خاتم الإدارة المالية للمكتب</p>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-400 mt-6 print:fixed print:bottom-4 print:left-0 print:right-0">
        هذا الإيصال معتمد ومولد آلياً من نظام إدارة مكتب المحاماة • لا يعتد بأي كشط أو تعديل يدوي
      </div>
    </div>
  );
}

