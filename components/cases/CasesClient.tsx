"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Calendar, Briefcase } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useApp } from "@/lib/store";

export function CasesClient() {
  const { cases, clients, categories, statuses, staff, deleteCase, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";

  const activeCases = cases.filter((c) => !c.isDeleted);

  const filteredCases = activeCases.filter((c) => {
    const q = search.trim().toLowerCase();
    const client = clients.find((cl) => cl.id === c.clientId);
    const clientName = client?.name || "";
    const clientCode = client?.clientCode || "";

    const matchesSearch =
      !q ||
      c.caseNumber.includes(q) ||
      c.caseYear.toString().includes(q) ||
      clientName.toLowerCase().includes(q) ||
      clientCode.toLowerCase().includes(q) ||
      c.court.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === "ALL" || c.categoryId === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || c.statusId === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = () => {
    if (!deletingId) return;
    setIsDeleting(true);
    deleteCase(deletingId);
    setDeletingId(null);
    setIsDeleting(false);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            ملفات القضايا وسجل الجلسات
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الدعاوى المنظورة والمحكومة بالدوائر، الجلسات، الأحكام والأتعاب
          </p>
        </div>

        <Link
          href="/cases/new"
          prefetch={true}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>قيد قضية جديدة</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم القضية، السنة، اسم الموكل، أو المحكمة..."
            className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 font-medium"
          >
            <option value="ALL">جميع التصنيفات</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.code} - {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 font-medium"
          >
            <option value="ALL">جميع المراحل والحالات</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} {st.isClosed ? "(مغلقة)" : "(متداولة)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">رقم القضية / السنة</th>
                <th className="py-3 px-4">الموكل</th>
                <th className="py-3 px-4">المحكمة والفرع</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">المرحلة / الحالة</th>
                <th className="py-3 px-4">المحامي المسؤول</th>
                <th className="py-3 px-4">الجلسة القادمة</th>
                <th className="py-3 px-4">المتبقي من الأتعاب</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا توجد قضايا مسجلة مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => {
                  const client = clients.find((cl) => cl.id === caseItem.clientId);
                  const cat = categories.find((c) => c.id === caseItem.categoryId);
                  const st = statuses.find((s) => s.id === caseItem.statusId);
                  const lawyer = staff.find((l) => l.id === caseItem.lawyerId);

                  const nextHearing = caseItem.hearings?.[0];

                  return (
                    <tr key={caseItem.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                        <Link
                          href={`/cases/${caseItem.id}`}
                          prefetch={true}
                          className="hover:underline text-navy-900"
                        >
                          {caseItem.caseNumber} / {caseItem.caseYear}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        {client ? (
                          <div>
                            <Link
                              href={`/clients/${client.id}`}
                              className="font-bold text-slate-900 hover:underline"
                            >
                              {client.name}
                            </Link>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {client.clientCode}
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>
                          <span className="font-semibold">{caseItem.court}</span>
                          {caseItem.circuit && (
                            <span className="text-[10px] text-slate-500 block">
                              {caseItem.circuit}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {cat?.code ? `[${cat.code}] ` : ""}
                          {cat?.name || "غير مصنف"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            st?.isClosed
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {st?.name || "متداولة"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {lawyer?.name || "المستشار المناوب"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {nextHearing ? (
                          <span className="flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>{formatDate(nextHearing.hearingDate)}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">لا توجد جلسة محددة</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs whitespace-nowrap">
                        {caseItem.remainingAmount > 0 ? (
                          <span className="text-red-700">
                            {formatCurrency(caseItem.remainingAmount)}
                          </span>
                        ) : (
                          <span className="text-emerald-700">خالص الأتعاب</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/cases/${caseItem.id}`}
                            prefetch={true}
                            className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                            title="عرض تفاصيل القضية"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/cases/${caseItem.id}/edit`}
                            prefetch={true}
                            className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                            title="تعديل بيانات القضية"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingId(caseItem.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="حذف القضية"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Case Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف وأرشفة ملف القضية"
        message="هل أنت متأكد من حذف هذه القضية؟ سيتم الاحتفاظ بالسجل المالي والجلسات كأرشيف مع استبعادها من القضايا النشطة."
        confirmText="تأكيد الحذف"
        isLoading={isDeleting}
      />
    </div>
  );
}
