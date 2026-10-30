"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { LogOut, Calendar, Shield } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

export function Header({ userName, userRole }: HeaderProps) {
  const router = useRouter();
  const { currentUser, logout } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);

  const effectiveName = currentUser?.name || userName || "الأستاذ / محمد وليد";
  const effectiveRole = currentUser?.role || userRole || "ADMIN";

  const handleLogout = () => {
    if (confirm("هل ترغب بالفعل في تسجيل الخروج؟")) {
      setLoggingOut(true);
      logout();
      router.push("/login");
    }
  };

  const todayStr = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Date display */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="font-medium">{todayStr}</span>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-navy-700" />
          <span>المستخدم:</span>
          <span className="font-semibold text-slate-800">{effectiveName}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-700">
            {effectiveRole === "ADMIN" ? "مدير النظام" : "موظف / سكرتارية"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loggingOut ? "جاري الخروج..." : "خروج"}</span>
        </button>
      </div>
    </header>
  );
}
