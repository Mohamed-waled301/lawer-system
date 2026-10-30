"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { softDeleteCase } from "@/actions/cases";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CaseItem {
  id: string;
  caseNumber: string;
  caseYear: number;
  court: string;
  circuit?: string | null;
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  nextHearingDate?: Date | string | null;
  client: {
    id: string;
    clientCode: string;
    name: string;
    phone: string;
  };
  lawyer?: {
    id: string;
    name: string;
  } | null;
  category: {
    id: string;
    code: string;
    name: string;
  };
  status: {
    id: string;
    name: string;
    isClosed: boolean;
  };
  _count?: {
    hearings: number;
    payments: number;
    documents: number;
  };
}

interface CasesClientProps {
  initialCases: CaseItem[];
  clientsList: Array<{ id: string; clientCode: string; name: string; phone: string }>;
  categoriesList: Array<{ id: string; code: string; name: string }>;
  statusesList: Array<{ id: string; name: string; isClosed: boolean }>;
  lawyersList: Array<{ id: string; name: string }>;
  userRole?: string;
}

export function CasesClient({
  initialCases,
  categoriesList,
  statusesList,
  userRole,
}: CasesClientProps) {
  const router = useRouter();
  const [cases, setCases] = useState<CaseItem[]>(initialCases);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isClosedFilter, setIsClosedFilter] = useState("ACTIVE"); // ACTIVE, CLOSED, ALL
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = userRole === "ADMIN";

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await softDeleteCase(deletingId);
      if (res.success) {
        setCases((prev) => prev.filter((c) => c.id !== deletingId));
        setDeletingId(null);
        router.refresh();
      } else {
        alert(res.error || "فشل أرشفة القضية");
      }
    } catch {
      alert("حدث خطأ أثناء العملية");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = cases.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.court.toLowerCase().includes(q) ||
      c.client.name.toLowerCase().includes(q) ||
      c.client.clientCode.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === "ALL" || c.category.id === categoryFilter;

    const matchesStatus = statusFilter === "ALL" || c.status.id === statusFilter;

    const matchesClosed =
      isClosedFilter === "ALL" ||
      (isClosedFilter === "ACTIVE" ? !c.status.isClosed : c.status.isClosed);

    return matchesSearch && matchesCategory && matchesStatus && matchesClosed;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            سجل القضايا والدعاوى
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة الجلسات، مراحل التقاضي، الأتعاب المستحقة والأوراق المرفوعة
          </p>
        </div>

        {/* Link to Full Page Form (Not a Modal) */}
        <Link
          href="/cases/new"
          prefetch={true}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>افتتاح ملف قضية جديد (صفحة كاملة)</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم القضية، المحكمة، أو اسم الموكل..."
            className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={isClosedFilter}
            onChange={(e) => setIsClosedFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white font-medium"
          >
            <option value="ACTIVE">القضايا المتداولة (النشطة)</option>
            <option value="CLOSED">القضايا المنتهية والمغلقة</option>
            <option value="ALL">جميع القضايا (الكل)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700"
          >
            <option value="ALL">جميع التصنيفات</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                [{cat.code}] {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700"
          >
            <option value="ALL">جميع الحالات القضائية</option>
            {statusesList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
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
                <th className="py-3 px-4">رقم القضية</th>
                <th className="py-3 px-4">الموكل</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">المحكمة / الدائرة</th>
                <th className="py-3 px-4">المحامي المسؤول</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">المتبقي</th>
                <th className="py-3 px-4">الجلسة القادمة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا توجد قضايا مطابقة للشروط المحددة.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      <Link
                        href={`/cases/${item.id}`}
                        prefetch={true}
                        className="hover:underline text-navy-900"
                      >
                        {item.caseNumber} / {item.caseYear}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/clients/${item.client.id}`}
                        prefetch={true}
                        className="font-bold text-slate-900 hover:text-navy-800 hover:underline block"
                      >
                        {item.client.name}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.client.clientCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        [{item.category.code}] {item.category.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{item.court}</div>
                      {item.circuit && (
                        <div className="text-[11px] text-slate-400">{item.circuit}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.lawyer?.name || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status.isClosed
                            ? "bg-slate-100 text-slate-600"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {item.status.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-red-700">
                      {formatCurrency(item.remainingAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {item.nextHearingDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-bold">
                            {formatDate(item.nextHearingDate)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/cases/${item.id}`}
                          prefetch={true}
                          className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                          title="فتح ملف القضية والجلسات"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/cases/${item.id}/edit`}
                          prefetch={true}
                          className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                          title="تعديل بيانات القضية"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="أرشفة القضية"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="أرشفة القضية"
        message="هل أنت متأكد من أرشفة هذه القضية؟ سيتم إخفاؤها من القائمة النشطة مع الحفاظ الكامل على كافة الجلسات والإيصالات والمستندات المرتبطة بها."
        confirmText="تأكيد الأرشفة"
        isLoading={isDeleting}
      />
    </div>
  );
}
