import { OfficeLetterhead } from "./OfficeLetterhead";
import { formatDateArabicWords, formatCurrency } from "@/lib/utils";

interface ConsultationPrintProps {
  consultation: {
    id: string;
    personName: string;
    phone: string;
    date: Date | string;
    subject: string;
    amountPaid: number;
    paymentMethod: string;
    notes?: string | null;
    lawyer?: {
      name: string;
      role: string;
    } | null;
  };
  settings?: Record<string, string>;
}

export function ConsultationPrint({
  consultation,
  settings,
}: ConsultationPrintProps) {
  return (
    <div className="bg-white p-8 max-w-3xl mx-auto text-slate-900 font-sans print:p-0 print:max-w-none">
      <OfficeLetterhead
        settings={settings}
        documentTitle="إيصال استشارة قانونية ورأي معتمد"
      />

      <div className="border border-slate-300 rounded-md p-6 space-y-5 bg-slate-50/30">
        <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
          <div>
            <span className="text-slate-500 font-medium">اسم طالب الاستشارة: </span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">
              {consultation.personName}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">رقم الهاتف: </span>
            <span className="font-bold text-slate-900 block mt-0.5" dir="ltr">
              {consultation.phone}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">تاريخ الاستشارة: </span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {formatDateArabicWords(consultation.date)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">المحامي المستشار: </span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {consultation.lawyer?.name || "المستشار المناوب"}
            </span>
          </div>
        </div>

        {/* Consultation Subject */}
        <div className="bg-white p-4 border border-slate-200 rounded">
          <h4 className="text-xs font-bold text-slate-700 mb-1">
            موضوع وملخص الاستشارة القانونية:
          </h4>
          <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
            {consultation.subject}
          </p>
        </div>

        {/* Financial */}
        <div className="flex items-center justify-between bg-slate-100 p-3.5 border border-slate-300 rounded">
          <span className="text-xs font-bold text-slate-700">
            أتعاب تقديم الرأي القانوني:
          </span>
          <span className="text-base font-extrabold text-slate-950">
            {formatCurrency(consultation.amountPaid)}
          </span>
        </div>

        {/* Core rule note */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] rounded leading-relaxed">
          <strong>تنويه نظامي:</strong> أتعاب الاستشارة القانونية غير قابلة للاسترداد تحت أي ظرف
          سواء تم إقامة دعوى قضائية لاحقاً أو لم يتم، وتعد إيراداً مستقلاً عن أي قضايا مستقبلية.
        </div>

        {consultation.notes && (
          <div className="text-xs text-slate-600 bg-white p-3 border border-slate-200 rounded">
            <strong>توصيات المكتب:</strong> {consultation.notes}
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-300 text-center text-xs">
          <div>
            <p className="font-semibold text-slate-700">توقيع المستشير بالعلم</p>
            <div className="h-12"></div>
            <p className="text-slate-400">....................................</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">المحامي المسؤول</p>
            <p className="text-slate-900 font-bold mt-1">
              {consultation.lawyer?.name || "المستشار القانوني"}
            </p>
            <div className="h-6"></div>
            <p className="text-slate-400">اعتماد المكتب</p>
          </div>
        </div>
      </div>
    </div>
  );
}

