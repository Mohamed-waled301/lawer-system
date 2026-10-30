"use client";

import { Printer, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function PrintToolbar() {
  const router = useRouter();

  return (
    <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between bg-white px-5 py-3 rounded-lg border border-slate-300 shadow-xs">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>رجوع للنظام</span>
      </button>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          ورق قياسي مقاس A4 • ترويسة معتمدة
        </span>
        <button
          onClick={() => window.print()}
          className="allow-print flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة المستند (Ctrl + P)</span>
        </button>
      </div>
    </div>
  );
}

