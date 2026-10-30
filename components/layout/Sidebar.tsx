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
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, resetToDefaultData } = useApp();

  const effectiveRole = currentUser?.role || userRole || "ADMIN";
  const effectiveName = currentUser?.name || userName || "الأستاذ / محمد وليد";
  const isAdmin = effectiveRole === "ADMIN";

  const links = [
    {
      label: "لوحة التحكم",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      label: "الموكلين",
      href: "/clients",
      icon: Users,
      active: pathname.startsWith("/clients"),
    },
    {
      label: "القضايا والجلسات",
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
            label: "الخزائن وحسابات الدفع",
            href: "/treasury",
            icon: Vault,
            active: pathname.startsWith("/treasury"),
          },
          {
            label: "سجل المدفوعات والإيصالات",
            href: "/payments",
            icon: Receipt,
            active: pathname.startsWith("/payments"),
          },
        ]
      : []),
    {
      label: "المحامين وفريق العمل",
      href: "/staff",
      icon: UserCheck,
      active: pathname.startsWith("/staff"),
    },
    {
      label: "الإعدادات والنسخ الاحتياطي",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-100 flex flex-col z-30 border-l border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-navy-700 flex items-center justify-center text-white shrink-0 shadow-sm border border-slate-700">
          <Scale className="w-6 h-6 text-slate-200" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-base font-bold text-white leading-tight truncate">
            نظام إدارة مكتب المحاماة
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">منظومة القضايا والاستشارات</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition-colors ${
                link.active
                  ? "bg-navy-800 text-white font-semibold border-r-4 border-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${link.active ? "text-white" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Demo Reset + User Information in Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
        {/* Quick Demo Reset Button for testing on Vercel */}
        <button
          onClick={resetToDefaultData}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-semibold border border-slate-700 transition-colors"
          title="إعادة تعيين كافة البيانات إلى بيانات التجربة الأصلية"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط بيانات التجربة (Reset Demo)</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">{effectiveName}</p>
            <span
              className={`inline-block px-2 py-0.5 mt-1 text-[11px] font-medium rounded ${
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
  );
}
