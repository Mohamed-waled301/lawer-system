"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  AlertCircle,
  Scan,
  Loader2,
} from "lucide-react";
import { uploadDocumentAction } from "@/actions/documents";
import { formatFileSize } from "@/lib/utils";

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  errorMessage?: string;
}

const CATEGORIES = [
  { value: "POWER_OF_ATTORNEY", label: "توكيل رسمي" },
  { value: "STATEMENT_OF_CLAIM", label: "صحيفة دعوى / عريضة" },
  { value: "JUDGMENT", label: "حكم / قرار محكمة" },
  { value: "EXPERT_REPORT", label: "تقرير خبير" },
  { value: "PAYMENT_PROOF", label: "إيصال سداد / تحويل مالي" },
  { value: "OTHER", label: "مستندات وأوراق أخرى" },
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

interface DocumentUploaderProps {
  caseId?: string;
  clientId?: string;
  onUploadComplete?: () => void;
  isElectron?: boolean; // When ported to Electron, toggles scanner hardware button
}

export function DocumentUploader({
  caseId,
  clientId,
  onUploadComplete,
  isElectron = false,
}: DocumentUploaderProps) {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;

    const newQueued: QueuedFile[] = [];

    Array.from(files).forEach((file) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`الملف ${file.name} حجمه أكبر من الحد الأقصى المسموح (25 ميجابايت).`);
        return;
      }

      // Validate mime type
      const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowed.includes(file.type)) {
        alert(`نوع الملف ${file.name} غير مدعوم. الصيغ المقبولة: PDF, JPG, PNG.`);
        return;
      }

      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "";

      // Default title without extension
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "");

      newQueued.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        title: defaultTitle,
        category: "OTHER",
        status: "pending",
        progress: 0,
      });
    });

    setQueuedFiles((prev) => [...prev, ...newQueued]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setQueuedFiles((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return filtered;
    });
  };

  const updateFileMeta = (
    id: string,
    field: "title" | "category",
    value: string
  ) => {
    setQueuedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const startUpload = async () => {
    if (queuedFiles.length === 0 || isUploading) return;

    setIsUploading(true);

    for (let i = 0; i < queuedFiles.length; i++) {
      const item = queuedFiles[i];
      if (item.status === "success") continue;

      // Update status to uploading
      setQueuedFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 30 } : f))
      );

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("title", item.title);
      formData.append("category", item.category);
      if (caseId) formData.append("caseId", caseId);
      if (clientId) formData.append("clientId", clientId);

      try {
        setQueuedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: 70 } : f))
        );

        const res = await uploadDocumentAction(formData);

        if (res.success) {
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "success", progress: 100 } : f
            )
          );
        } else {
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: "error",
                    progress: 0,
                    errorMessage: res.error || "فشل الرفع",
                  }
                : f
            )
          );
        }
      } catch (err: any) {
        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  errorMessage: err.message || "حدث خطأ غير متوقع",
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-navy-800 bg-navy-50/50"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-white rounded-full border border-slate-200 text-slate-600 shadow-xs">
            <Upload className="w-6 h-6 text-navy-800" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            انقر هنا لاختيار الملفات أو اسحبها وأفلتها مباشرة
          </p>
          <p className="text-xs text-slate-500">
            المستندات المدعومة: PDF، أوراق ممسوحة ضوئياً، صور JPG / PNG (الحد الأقصى لكل ملف: 25 ميجابايت)
          </p>

          {/* Scanner Button (Hardware Scanner: Hidden or disabled in Web version, active in Electron) */}
          <div className="pt-2">
            {isElectron ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("جاري الاتصال بالسكانر المحلي عبر بروتوكول WIA/NAPS2...");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-900 bg-white border border-slate-300 rounded shadow-xs hover:bg-slate-50"
              >
                <Scan className="w-4 h-4 text-navy-800" />
                <span>سحب مباشر من الماسح الضوئي (Scanner)</span>
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-slate-500 bg-white/80 border border-slate-200 px-3 py-1 rounded inline-block cursor-default"
                title="المسح الضوئي المباشر من جهاز السكانر يتطلب تطبيق سطح المكتب (Electron)"
              >
                ⚡ خاصية المسح المباشر من السكانر مجهزة للتفعيل التلقائي عند التحويل لـ Electron
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Files List / Preview */}
      {queuedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <span>الملفات المحددة للرفع ({queuedFiles.length})</span>
            <button
              type="button"
              onClick={() => setQueuedFiles([])}
              className="text-red-600 hover:underline"
            >
              إلغاء الكل
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto p-1">
            {queuedFiles.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-md shadow-xs"
              >
                {/* Thumbnail Preview */}
                <div className="w-12 h-12 rounded border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-red-600" />
                  )}
                </div>

                {/* Metadata Inputs */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">
                      اسم المستند
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      disabled={item.status === "uploading" || item.status === "success"}
                      onChange={(e) => updateFileMeta(item.id, "title", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-navy-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">
                      تصنيف المستند
                    </label>
                    <select
                      value={item.category}
                      disabled={item.status === "uploading" || item.status === "success"}
                      onChange={(e) =>
                        updateFileMeta(item.id, "category", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-navy-800 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* File size & Status */}
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatFileSize(item.file.size)}
                  </span>

                  {item.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {item.status === "uploading" && (
                    <Loader2 className="w-4 h-4 animate-spin text-navy-800" />
                  )}

                  {item.status === "success" && (
                    <span title="تم الرفع">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </span>
                  )}

                  {item.status === "error" && (
                    <span title={item.errorMessage || "فشل الرفع"}>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={startUpload}
              disabled={isUploading || queuedFiles.every((f) => f.status === "success")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ ورفع الملفات...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>بدء حفظ ورفع المستندات المحددة</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

