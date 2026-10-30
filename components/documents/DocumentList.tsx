"use client";

import { useState } from "react";
import { FileText, ExternalLink, Trash2, Download } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import { deleteDocumentAction } from "@/actions/documents";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DocItem {
  id: string;
  title: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  createdAt: Date | string;
  uploadedBy?: string | null;
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  POWER_OF_ATTORNEY: { label: "توكيل رسمي", color: "bg-blue-50 text-blue-700 border-blue-200" },
  STATEMENT_OF_CLAIM: { label: "صحيفة دعوى", color: "bg-purple-50 text-purple-700 border-purple-200" },
  JUDGMENT: { label: "حكم قضائي", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EXPERT_REPORT: { label: "تقرير خبير", color: "bg-amber-50 text-amber-700 border-amber-200" },
  PAYMENT_PROOF: { label: "إيصال سداد / تحويل", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  OTHER: { label: "أخرى", color: "bg-slate-50 text-slate-700 border-slate-200" },
};

interface DocumentListProps {
  documents: DocItem[];
  canDelete?: boolean;
  onRefresh?: () => void;
}

export function DocumentList({
  documents,
  canDelete = true,
  onRefresh,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteDocumentAction(deletingId);
      if (res.success) {
        setDeletingId(null);
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || "فشل حذف المستند");
      }
    } catch {
      alert("حدث خطأ أثناء حذف المستند");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        لا توجد مستندات أو أوراق مرفوعة حتى الآن.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
        {documents.map((doc) => {
          const catInfo = CATEGORY_MAP[doc.category] || CATEGORY_MAP.OTHER;
          const isPdf = doc.mimeType === "application/pdf";

          return (
            <div
              key={doc.id}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <FileText className={`w-5 h-5 ${isPdf ? "text-red-600" : "text-navy-800"}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="font-mono text-slate-400">{doc.originalName}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.createdAt)}</span>
                    {doc.uploadedBy && (
                      <>
                        <span>•</span>
                        <span>بواسطة: {doc.uploadedBy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[11px] font-medium rounded border ${catInfo.color}`}
                >
                  {catInfo.label}
                </span>

                {/* View / Download */}
                <a
                  href={`/api/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                  title="عرض المستند"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setDeletingId(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="حذف المستند"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="حذف المستند"
        message="هل أنت متأكد من حذف هذا المستند؟ سيتم حذفه نهائياً من القرص الصلب وقاعدة البيانات."
        confirmText="نعم، حذف"
        isLoading={isDeleting}
      />
    </div>
  );
}

