"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserCheck, Phone, Upload, FileText, CheckCircle, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";

export function ClientDocumentsUploadClient({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { clients, addClientDocument, currentUser } = useApp();
  const client = clients.find((c) => c.id === clientId);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("POWER_OF_ATTORNEY");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!client) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        الموكل غير موجود.
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, ""));
    }
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !title) return;

    setIsUploading(true);
    try {
      addClientDocument(client.id, {
        title: title || file?.name || "مستند موكل",
        originalName: file?.name || "document.pdf",
        filePath: previewUrl || "documents/sample.pdf",
        fileSize: file?.size || 1024 * 250,
        mimeType: file?.type || "application/pdf",
        category,
        uploadedBy: currentUser?.name || "الموظف المسؤول",
      });
      router.push(`/clients/${client.id}`);
    } catch {
      alert("حدث خطأ أثناء حفظ المستند");
      setIsUploading(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              تسمية أو عنوان المستند <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: توكيل رسمي عام قضايا 2026، صورة بطاقة الرقم القومي..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تصنيف المستند</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-semibold"
            >
              <option value="POWER_OF_ATTORNEY">توكيل رسمي عام / خاص</option>
              <option value="NATIONAL_ID">صورة بطاقة الرقم القومي / إثبات شخصية</option>
              <option value="OTHER">مستندات ثبوتية أخرى</option>
            </select>
          </div>

          {/* File Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              اختر الملف من الجهاز (PDF / صور JPG / PNG)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-lg p-6 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">اضغط هنا لاختيار الملف من الجهاز</p>
              <p className="text-[11px] text-slate-400 mt-1">الحد الأقصى 25 ميجابايت (PDF, JPG, PNG)</p>
            </div>
          </div>

          {/* Preview if image */}
          {previewUrl && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded border border-slate-300"
                />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">{file?.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round((file?.size || 0) / 1024)} KB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href={`/clients/${client.id}`}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-semibold"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
            >
              {isUploading ? "جاري الحفظ..." : "حفظ وإدراج المستند"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
