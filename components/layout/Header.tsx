"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  LogOut,
  Calendar,
  Shield,
  Menu,
  Scale,
  LayoutDashboard,
  Users,
  Briefcase,
} from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

export function Header({ userName, userRole }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, toggleMobileMenu } = useApp();
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
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Right side: Sandwich Menu Button + Office Branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* The Universal Sandwich Menu Button (for ALL devices) */}
        <button
          onClick={toggleMobileMenu}
          className="flex items-center gap-1.5 p-2 px-2.5 sm:px-3 text-slate-800 hover:text-navy-950 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-2xs"
          title="فتح القائمة الرئيسية"
          aria-label="القائمة الرئيسية"
        >
          <Menu className="w-5 h-5 text-navy-900" />
          <span className="font-bold text-xs">القائمة</span>
        </button>

        {/* Office Logo & Title */}
        <Link
          href="/"
          className="flex items-center gap-2 pr-1 border-r border-slate-200 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Scale className="w-4 h-4 text-slate-200" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-slate-900 leading-none block">
              نظام إدارة مكتب المحاماة
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-none block mt-0.5">
              منظومة القضايا والاستشارات
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Quick navigation pills on larger screens */}
      <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
        <Link
          href="/"
          className={`px-3 py-1.5 rounded transition-colors ${
            pathname === "/"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          لوحة التحكم
        </Link>
        <Link
          href="/clients"
          className={`px-3 py-1.5 rounded transition-colors ${
            pathname.startsWith("/clients")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          الموكلين
        </Link>
        <Link
          href="/cases"
          className={`px-3 py-1.5 rounded transition-colors ${
            pathname.startsWith("/cases")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          القضايا
        </Link>
        <Link
          href="/consultations"
          className={`px-3 py-1.5 rounded transition-colors ${
            pathname.startsWith("/consultations")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          الاستشارات
        </Link>
        <Link
          href="/treasury"
          className={`px-3 py-1.5 rounded transition-colors ${
            pathname.startsWith("/treasury")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          الخزائن
        </Link>
      </nav>

      {/* Left side: Date + User badge + Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium">{todayStr}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-navy-700 shrink-0" />
          <span className="font-semibold text-slate-800 truncate max-w-[100px] sm:max-w-none">
            {effectiveName}
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-700 hidden sm:inline text-[11px]">
            {effectiveRole === "ADMIN" ? "مدير النظام" : "موظف / سكرتارية"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 transition-colors shrink-0"
          title="تسجيل الخروج"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{loggingOut ? "..." : "خروج"}</span>
        </button>
      </div>
    </header>
  );
}
