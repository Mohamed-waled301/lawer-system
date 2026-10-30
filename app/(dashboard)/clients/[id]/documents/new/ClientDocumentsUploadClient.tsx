"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserCheck, Phone } from "lucide-react";
import { DocumentUploader } from "@/components/documents/DocumentUploader";

export function ClientDocumentsUploadClient({ client }: { client: any }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/clients/${client.id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="رجوع لملف الموكل"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              إضافة وثيقة أو مستند للموكل
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>{client.name}</span>
              </span>
              <span className="font-mono text-navy-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {client.clientCode}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-slate-600" dir="ltr">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{client.phone}</span>
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/clients/${client.id}`}
          className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
        >
          عودة لملف الموكل
        </Link>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
        <div className="mb-4 pb-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            إرفاق صورة الرقم القومي، التوكيلات العامة، أو المستندات الثبوتية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            يتم حفظ المستندات بصورة آمنة ومحمية بالخادم في مجلد الملفات
          </p>
        </div>

        <DocumentUploader
          clientId={client.id}
          onUploadComplete={() => {
            router.push(`/clients/${client.id}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}

