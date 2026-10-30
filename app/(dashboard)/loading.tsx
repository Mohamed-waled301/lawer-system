import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded"></div>
          <div className="h-3 w-72 bg-slate-100 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-slate-200 rounded"></div>
          <div className="h-8 w-28 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 w-28 bg-slate-200 rounded"></div>
              <div className="h-7 w-16 bg-slate-300 rounded font-mono"></div>
              <div className="h-2 w-20 bg-slate-100 rounded"></div>
            </div>
            <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200"></div>
          </div>
        ))}
      </div>

      {/* Table / Content Skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="h-4 w-40 bg-slate-200 rounded"></div>
          <div className="h-8 w-60 bg-slate-100 rounded"></div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-10 w-full bg-slate-50 border border-slate-100 rounded flex items-center px-4 justify-between"
            >
              <div className="h-3 w-1/4 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/6 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/5 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

