"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Receipt,
  UserCheck,
  Settings,
  Scale,
  Vault,
  RotateCcw,
  X,
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const {
    currentUser,
    resetToDefaultData,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useApp();

  const effectiveRole = currentUser?.role || userRole || "ADMIN";
  const effectiveName = currentUser?.name || userName || "الأستاذ / محمد وليد";
  const isAdmin = effectiveRole === "ADMIN";

  const links = [
    {
      label: "لوحة التحكم الرئيسية",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      label: "سجل الموكلين",
      href: "/clients",
      icon: Users,
      active: pathname.startsWith("/clients"),
    },
    {
      label: "ملفات القضايا والجلسات",
      href: "/cases",
      icon: Briefcase,
      active: pathname.startsWith("/cases"),
    },
    {
      label: "الاستشارات القانونية",
      href: "/consultations",
      icon: MessageSquare,
      active: pathname.startsWith("/consultations"),
    },
    ...(isAdmin
      ? [
          {
            label: "الخزائن المالية وحسابات الدفع",
            href: "/treasury",
            icon: Vault,
            active: pathname.startsWith("/treasury"),
          },
          {
            label: "سجل إيصالات السداد والمدفوعات",
            href: "/payments",
            icon: Receipt,
            active: pathname.startsWith("/payments"),
          },
        ]
      : []),
    {
      label: "المحامين وطاقم العمل",
      href: "/staff",
      icon: UserCheck,
      active: pathname.startsWith("/staff"),
    },
    {
      label: "إعدادات النظام والنسخ الاحتياطي",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <>
      {/* Dimmed Backdrop Overlay (Closes drawer on tap/click) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 backdrop-blur-2xs"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer Panel (Controlled by Sandwich Menu on ALL screen sizes) */}
      <aside
        className={`fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 text-slate-100 flex flex-col z-50 shadow-2xl border-l border-slate-800 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded bg-navy-800 flex items-center justify-center text-white shrink-0 shadow-sm border border-slate-700">
              <Scale className="w-5 h-5 text-slate-200" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white leading-tight truncate">
                نظام إدارة مكتب المحاماة
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">القائمة العامة للتنقل</p>
            </div>
          </div>

          {/* Close button (✕) */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  link.active
                    ? "bg-slate-800 text-white font-bold border-r-4 border-amber-400 shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    link.active ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area: Quick Reset + User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 space-y-3">
          {/* Quick Demo Reset Button for testing on Vercel */}
          <button
            onClick={() => {
              if (
                confirm("هل ترغب في إعادة تعيين كافة البيانات إلى بيانات التجربة الأصلية؟")
              ) {
                resetToDefaultData();
                setMobileMenuOpen(false);
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs font-semibold border border-slate-700 transition-colors shadow-2xs"
            title="إعادة تعيين كافة البيانات إلى بيانات التجربة الأصلية"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>إعادة ضبط بيانات التجربة (Reset Demo)</span>
          </button>

          <div className="pt-1 flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{effectiveName}</p>
              <span
                className={`inline-block px-2 py-0.5 mt-1 text-[10px] font-bold rounded ${
                  isAdmin
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                {isAdmin ? "مدير النظام (كامل الصلاحيات)" : "موظف / سكرتارية"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
