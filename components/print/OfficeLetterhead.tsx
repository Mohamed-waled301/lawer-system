interface OfficeSettings {
  office_name?: string;
  office_owner?: string;
  office_title?: string;
  office_address?: string;
  office_phones?: string;
  office_email?: string;
  tax_number?: string;
}

interface LetterheadProps {
  settings?: OfficeSettings;
  documentTitle: string;
  referenceNumber?: string;
}

export function OfficeLetterhead({
  settings,
  documentTitle,
  referenceNumber,
}: LetterheadProps) {
  const officeName =
    settings?.office_name || "مجموعة المستشار للمحاماة والاستشارات القانونية";
  const officeOwner = settings?.office_owner || "المستشار / أحمد فهمي";
  const officeTitle =
    settings?.office_title || "محام بالنقض والدستورية والإدارية العليا";
  const officeAddress =
    settings?.office_address || "٤٥ شارع قصر العيني، وسط البلد، القاهرة";
  const officePhones = settings?.office_phones || "01001234567 - 0227954321";
  const taxNumber = settings?.tax_number || "102-394-885";

  return (
    <div className="border-b-2 border-slate-900 pb-4 mb-6 text-slate-900">
      <div className="flex justify-between items-start">
        {/* Office Info Right */}
        <div className="text-right">
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            {officeName}
          </h1>
          <p className="text-sm font-semibold text-slate-800 mt-1">{officeOwner}</p>
          <p className="text-xs text-slate-600">{officeTitle}</p>
        </div>

        {/* Office Contact Left */}
        <div className="text-left text-xs space-y-1 text-slate-600 font-medium">
          <p>
            <span className="text-slate-400">العنوان: </span>
            {officeAddress}
          </p>
          <p>
            <span className="text-slate-400">هاتف: </span>
            <span dir="ltr">{officePhones}</span>
          </p>
          {taxNumber && (
            <p>
              <span className="text-slate-400">بطاقة ضريبية: </span>
              <span dir="ltr">{taxNumber}</span>
            </p>
          )}
        </div>
      </div>

      {/* Document Subtitle Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center bg-slate-50 px-4 py-2 rounded">
        <h2 className="text-base font-extrabold text-slate-900">{documentTitle}</h2>
        {referenceNumber && (
          <div className="text-xs font-mono font-bold text-slate-700">
            رقم القيد / الإيصال: {referenceNumber}
          </div>
        )}
      </div>
    </div>
  );
}

