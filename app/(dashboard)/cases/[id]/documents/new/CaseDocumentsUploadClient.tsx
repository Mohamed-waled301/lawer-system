"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileText, Briefcase, UserCheck } from "lucide-react";
import { DocumentUploader } from "@/components/documents/DocumentUploader";

export function CaseDocumentsUploadClient({ caseItem }: { caseItem: any }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseItem.id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="رجوع لملف القضية"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              رفع وتصنيف مستندات القضية
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono font-bold text-navy-900">
                <Briefcase className="w-3.5 h-3.5" />
                <span>رقم: {caseItem.caseNumber} لسنة {caseItem.caseYear}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>الموكل: {caseItem.client.name}</span>
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/cases/${caseItem.id}`}
          className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
        >
          عودة للقضية
        </Link>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
        <div className="mb-4 pb-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            إرفاق أوراق الدعوى، الأحكام، تقارير الخبراء، والتوكيلات
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            يمكنك سحب وإفلات عدة ملفات (PDF / JPG / PNG) أو اختيارها من الجهاز، مع تحديد نوع وتسمية كل مستند
          </p>
        </div>

        <DocumentUploader
          caseId={caseItem.id}
          clientId={caseItem.clientId}
          onUploadComplete={() => {
            router.push(`/cases/${caseItem.id}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}

