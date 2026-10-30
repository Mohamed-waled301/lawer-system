"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  Vault,
} from "lucide-react";

export function DashboardClient() {
  const { cases, statuses, staff, clients, payments, treasuries, activities, currentUser } =
    useApp();

  const isAdmin = currentUser?.role === "ADMIN";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeekEnd = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Active cases (not deleted, status not closed)
  const activeCases = cases.filter((c) => {
    if (c.isDeleted) return false;
    const st = statuses.find((s) => s.id === c.statusId);
    return st ? !st.isClosed : true;
  });

  // Upcoming hearings
  const allUpcomingHearings: Array<{
    id: string;
    hearingDate: string;
    decision?: string;
    notes?: string;
    caseItem: any;
  }> = [];

  cases
    .filter((c) => !c.isDeleted)
    .forEach((c) => {
      c.hearings.forEach((h) => {
        const hDate = new Date(h.hearingDate);
        if (hDate >= startOfToday && hDate <= nextWeekEnd) {
          allUpcomingHearings.push({
            id: h.id,
            hearingDate: h.hearingDate,
            decision: h.decision,
            notes: h.notes,
            caseItem: c,
          });
        }
      });
    });

  allUpcomingHearings.sort(
    (a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime()
  );

  // Financial calculations
  const thisMonthRevenue = payments
    .filter((p) => new Date(p.paymentDate) >= startOfMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const remainingFeesOwed = activeCases.reduce((sum, c) => sum + c.remainingAmount, 0);

  const totalTreasuriesBalance = treasuries.reduce((sum, t) => sum + t.balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            لوحة متابعة المكتب
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ملخص الجلسات القادمة، حركة القضايا النشطة والمؤشرات المالية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cases/new"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>قضية جديدة</span>
          </Link>
          <Link
            href="/consultations/new"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل استشارة</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cases */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">القضايا المتداولة (النشطة)</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              {activeCases.length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">قضية قيد النظر بالدوائر</p>
          </div>
          <div className="w-12 h-12 rounded bg-navy-50 flex items-center justify-center text-navy-800 border border-navy-100">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Hearings next week */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">جلسات الأسبوع القادم</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              {allUpcomingHearings.length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">خلال الـ 7 أيام القادمة</p>
          </div>
          <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: This month revenue (Admin Only) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">مقبوضات الشهر الحالي</p>
            {isAdmin ? (
              <h3 className="text-2xl font-black text-emerald-700 font-mono">
                {formatCurrency(thisMonthRevenue)}
              </h3>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>صلاحية المدير فقط</span>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">إجمالي سداد الأتعاب والاستشارات</p>
          </div>
          <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-100">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Remaining Fees (Admin Only) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">أتعاب متبقية على الموكلين</p>
            {isAdmin ? (
              <h3 className="text-2xl font-black text-rose-700 font-mono">
                {formatCurrency(remainingFeesOwed)}
              </h3>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>صلاحية المدير فقط</span>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">مستحقات واجبة التحصيل</p>
          </div>
          <div className="w-12 h-12 rounded bg-rose-50 flex items-center justify-center text-rose-700 border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Hearings + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hearings Table: Left 2 Cols */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-navy-800" />
              <h2 className="text-sm font-bold text-slate-900">
                أجندة الجلسات القادمة (الـ 7 أيام القادمة)
              </h2>
            </div>
            <Link
              href="/cases"
              className="text-xs text-navy-800 hover:text-navy-950 font-semibold flex items-center gap-1"
            >
              <span>عرض كل القضايا</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {allUpcomingHearings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                لا توجد جلسات محددة خلال الأيام السبعة القادمة.
              </div>
            ) : (
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">تاريخ الجلسة</th>
                    <th className="py-2.5 px-3">رقم القضية</th>
                    <th className="py-2.5 px-3">الموكل</th>
                    <th className="py-2.5 px-3">المحكمة والقرار المطلوب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUpcomingHearings.map((h) => {
                    const client = clients.find((c) => c.id === h.caseItem.clientId);
                    return (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-navy-950 whitespace-nowrap">
                          {formatDate(h.hearingDate)}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium">
                          <Link
                            href={`/cases/${h.caseItem.id}`}
                            className="hover:underline text-slate-900 font-bold"
                          >
                            {h.caseItem.caseNumber} / {h.caseItem.caseYear}
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {client ? (
                            <Link href={`/clients/${client.id}`} className="hover:underline">
                              {client.name}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                          <span className="font-semibold text-slate-700 block">
                            {h.caseItem.court}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {h.decision || "جلسة مرافعة ونظر مستندات"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Col: Treasuries Quick Overview + Activity Feed */}
        <div className="space-y-6">
          {/* Treasury Balances Card */}
          {isAdmin && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Vault className="w-4 h-4 text-emerald-800" />
                  <h2 className="text-xs font-bold text-slate-900">
                    أرصدة الخزائن وحسابات الدفع
                  </h2>
                </div>
                <Link
                  href="/treasury"
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  إدارة الخزائن
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                {treasuries.map((tr) => (
                  <div
                    key={tr.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {tr.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tr.accountNumber || tr.paymentMethod}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      {formatCurrency(tr.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
              <Clock className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-bold text-slate-900">سجل النشاط والعمليات الأخيرة</h2>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 6).map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-semibold font-sans">
                      {log.action}
                    </span>
                    <span>{formatDate(log.createdAt, true)}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

