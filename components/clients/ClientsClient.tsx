"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { softDeleteClient } from "@/actions/clients";
import { useRouter } from "next/navigation";

interface ClientItem {
  id: string;
  clientCode: string;
  name: string;
  nationalId?: string | null;
  phone: string;
  address?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  _count?: {
    cases: number;
    consultations: number;
    payments: number;
  };
}

interface ClientsClientProps {
  initialClients: ClientItem[];
  totalPages: number;
  currentPage: number;
  userRole?: string;
}

export function ClientsClient({
  initialClients,
  totalPages,
  currentPage,
  userRole,
}: ClientsClientProps) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = userRole === "ADMIN";

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await softDeleteClient(deletingId);
      if (res.success) {
        setClients((prev) => prev.filter((c) => c.id !== deletingId));
        setDeletingId(null);
        router.refresh();
      } else {
        alert(res.error || "فشل أرشفة الموكل");
      }
    } catch {
      alert("حدث خطأ أثناء العملية");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.clientCode.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.nationalId && c.nationalId.includes(q))
    );
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            سجل الموكلين
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات الموكلين، ملفاتهم وقضاياهم السارية والسابقة
          </p>
        </div>

        {/* Link to Full Page Form (Not a Modal) */}
        <Link
          href="/clients/new"
          prefetch={true}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موكل جديد (صفحة كاملة)</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between text-xs">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بكود الموكل (C-0001)، بالاسم، رقم الهاتف، أو الرقم القومي..."
            className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          إجمالي الموكلين: <span className="font-bold font-mono">{filtered.length}</span>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">كود الموكل</th>
                <th className="py-3 px-4">اسم الموكل</th>
                <th className="py-3 px-4">الرقم القومي</th>
                <th className="py-3 px-4">الهاتف</th>
                <th className="py-3 px-4">العنوان</th>
                <th className="py-3 px-4">القضايا</th>
                <th className="py-3 px-4">الاستشارات</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    لا يوجد موكلين مسجلين يطابقون البحث.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {client.clientCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/clients/${client.id}`}
                        prefetch={true}
                        className="font-bold text-slate-900 hover:text-navy-800 hover:underline"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {client.nationalId || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700" dir="ltr">
                      {client.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {client.address || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold font-mono text-slate-800">
                        {client._count?.cases || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold font-mono text-slate-800">
                        {client._count?.consultations || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/clients/${client.id}`}
                          prefetch={true}
                          className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                          title="فتح ملف الموكل"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/clients/${client.id}/edit`}
                          prefetch={true}
                          className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                          title="تعديل البيانات (صفحة كاملة)"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingId(client.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="أرشفة / حذف آمن"
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

      {/* Soft Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="أرشفة الموكل"
        message="هل أنت متأكد من أرشفة هذا الموكل؟ سيتم إخفاؤه من القائمة النشطة مع الحفاظ على سجلاته، ولا يمكن حذفه إذا كانت لديه قضايا جارية."
        confirmText="تأكيد الأرشفة"
        isLoading={isDeleting}
      />
    </div>
  );
}
