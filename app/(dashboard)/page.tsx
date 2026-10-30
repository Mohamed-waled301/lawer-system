import Link from "next/link";
import { getDashboardData } from "@/actions/dashboard";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

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
              {data.activeCasesCount}
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
              {data.nextWeekHearingsCount}
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
            {data.isAdmin ? (
              <h3 className="text-2xl font-black text-emerald-700 font-mono">
                {formatCurrency(data.thisMonthRevenue)}
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

        {/* Card 4: Remaining fees owed by clients (Admin Only) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">مستحقات أتعاب طرف الموكلين</p>
            {data.isAdmin ? (
              <h3 className="text-2xl font-black text-red-700 font-mono">
                {formatCurrency(data.remainingFeesOwed)}
              </h3>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>صلاحية المدير فقط</span>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">مبالغ متبقية على القضايا المتداولة</p>
          </div>
          <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center text-red-700 border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Hearings & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Hearings Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                جدول الجلسات القادمة (أجندة المحاكم)
              </h2>
            </div>
            <Link
              href="/cases"
              className="text-xs text-navy-800 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>عرض كل القضايا</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.upcomingHearings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              لا توجد جلسات مجدولة خلال الـ 7 أيام القادمة.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3">القضية</th>
                    <th className="py-2.5 px-3">المحكمة / الدائرة</th>
                    <th className="py-2.5 px-3">الموكل</th>
                    <th className="py-2.5 px-3">القرار / المطلوب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.upcomingHearings.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatDate(h.hearingDate)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <Link
                          href={`/cases/${h.case.id}`}
                          className="hover:underline text-navy-900"
                        >
                          {h.case.caseNumber} / {h.case.caseYear}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {h.court || h.case.court}
                        {h.circuit || h.case.circuit ? ` - ${h.circuit || h.case.circuit}` : ""}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {h.case.client.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        {h.decision || h.requirements || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Log (1 col) */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">سجل النشاطات الأخير</h2>
          </div>

          <div className="space-y-3">
            {data.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                لا توجد نشاطات مسجلة بعد
              </p>
            ) : (
              data.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded bg-slate-50/70 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-semibold text-slate-700">{act.userName}</span>
                    <span>{formatDate(act.createdAt, true)}</span>
                  </div>
                  <p className="text-slate-800 leading-snug font-medium">
                    {act.details || `${act.action} ${act.entityType}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

