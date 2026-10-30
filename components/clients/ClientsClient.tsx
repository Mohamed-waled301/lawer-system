"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useApp } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export function ClientsClient() {
  const { clients, deleteClient, cases, consultations, payments, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";

  const activeClients = clients.filter((c) => !c.isDeleted);

  const filteredClients = activeClients.filter((client) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      client.name.toLowerCase().includes(q) ||
      client.clientCode.toLowerCase().includes(q) ||
      client.phone.includes(q) ||
      (client.nationalId && client.nationalId.includes(q))
    );
  });

  const handleDelete = () => {
    if (!deletingId) return;
    setIsDeleting(true);
    deleteClient(deletingId);
    setDeletingId(null);
    setIsDeleting(false);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">سجل الموكلين</h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات الموكلين، أرقام الهويات القومية وملفات القضايا والاستشارات المرتبطة
          </p>
        </div>

        <Link
          href="/clients/new"
          prefetch={true}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موكل جديد</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، كود الموكل (C-0001)، الهاتف، أو الرقم القومي..."
            className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="text-slate-500 text-xs font-semibold">
          إجمالي الموكلين: <span className="font-mono text-slate-900">{filteredClients.length}</span> موكل
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4 w-28">كود الموكل</th>
                <th className="py-3 px-4">اسم الموكل</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">الرقم القومي</th>
                <th className="py-3 px-4 text-center">القضايا</th>
                <th className="py-3 px-4 text-center">الاستشارات</th>
                <th className="py-3 px-4 text-center">المدفوعات</th>
                <th className="py-3 px-4">تاريخ التسجيل</th>
                <th className="py-3 px-4 text-center w-28">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا يوجد موكلين مطابقين لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const clientCases = cases.filter(
                    (c) => c.clientId === client.id && !c.isDeleted
                  ).length;
                  const clientCons = consultations.filter(
                    (con) => con.clientId === client.id
                  ).length;
                  const clientPayments = payments.filter(
                    (p) => p.clientId === client.id
                  ).length;

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {client.clientCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link
                          href={`/clients/${client.id}`}
                          prefetch={true}
                          className="hover:underline text-navy-950 block"
                        >
                          {client.name}
                        </Link>
                        {client.address && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1 font-normal">
                            {client.address}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700" dir="ltr">
                        {client.phone}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {client.nationalId || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {clientCases}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {clientCons}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-800">
                        {clientPayments}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/clients/${client.id}`}
                            prefetch={true}
                            className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                            title="عرض ملف الموكل"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/clients/${client.id}/edit`}
                            prefetch={true}
                            className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                            title="تعديل البيانات"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingId(client.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="حذف وأرشفة"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف وأرشفة ملف الموكل"
        message="هل أنت متأكد من رغبتك في حذف هذا الموكل؟ سيتم أرشفة بياناته مع الاحتفاظ بسجل قضاياه ومدفوعاته السابقة."
        confirmText="تأكيد الحذف"
        isLoading={isDeleting}
      />
    </div>
  );
}
