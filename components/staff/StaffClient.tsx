"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  UserCheck,
  Edit,
  Trash2,
  Shield,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { useApp } from "@/lib/store";

interface StaffItem {
  id: string;
  name: string;
  role: "LAWYER" | "SECRETARY" | "ACCOUNTANT" | "OTHER";
  phone: string;
  email?: string | null;
  hireDate?: Date | string | null;
  barAssociationNumber?: string | null;
  isActive: boolean;
  notes?: string | null;
  _count?: {
    cases: number;
    consultations: number;
  };
}

const ROLE_LABELS: Record<string, string> = {
  LAWYER: "محام",
  SECRETARY: "سكرتارية وإداري",
  ACCOUNTANT: "محاسب مالي",
  OTHER: "خدمات مساندة",
};

interface StaffClientProps {
  initialStaff?: StaffItem[];
  userRole?: string;
}

export function StaffClient({ userRole }: StaffClientProps) {
  const {
    staff: storedStaff,
    deleteStaff: storeDeleteStaff,
    cases,
    consultations,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isAdmin = (userRole || currentUser?.role) === "ADMIN";

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = storeDeleteStaff(deletingId);
      if (res.success) {
        setDeletingId(null);
      } else {
        setDeleteError(res.error || "فشل حذف العضو");
      }
    } catch {
      setDeleteError("حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStaff = storedStaff.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.barAssociationNumber && s.barAssociationNumber.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q));

    const matchesRole = roleFilter === "ALL" || s.role === roleFilter;

    const matchesActive =
      activeFilter === "ALL" ||
      (activeFilter === "ACTIVE" && s.isActive) ||
      (activeFilter === "INACTIVE" && !s.isActive);

    return matchesSearch && matchesRole && matchesActive;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            المحامين وفريق العمل
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة السادة المحامين المقيدين، طاقم السكرتارية، الحسابات والخدمات المساندة
          </p>
        </div>

        {/* Dedicated Full Page Link */}
        <Link
          href="/staff/new"
          prefetch={true}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عضو جديد (صفحة كاملة)</span>
        </Link>
      </div>

      {deleteError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{deleteError}</span>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-red-500 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، رقم الهاتف، أو رقم القيد..."
            className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 font-medium"
          >
            <option value="ALL">جميع الأدوار</option>
            <option value="LAWYER">محامين فقط</option>
            <option value="SECRETARY">سكرتارية وإداريين</option>
            <option value="ACCOUNTANT">محاسبين</option>
            <option value="OTHER">خدمات مساندة</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 font-medium"
          >
            <option value="ALL">الكل (نشط وغير نشط)</option>
            <option value="ACTIVE">النشطين فقط</option>
            <option value="INACTIVE">غير النشطين</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">الاسم</th>
                <th className="py-3 px-4">الدور الوظيفي</th>
                <th className="py-3 px-4">رقم القيد النقابي</th>
                <th className="py-3 px-4">بيانات التواصل</th>
                <th className="py-3 px-4">تاريخ التعيين</th>
                <th className="py-3 px-4 text-center">القضايا المسندة</th>
                <th className="py-3 px-4 text-center">الاستشارات</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا يوجد أعضاء مطابقين للبحث.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const assignedCases = cases.filter((c) => c.lawyerId === staff.id).length;
                  const assignedConsultations = consultations.filter((cn) => cn.lawyerId === staff.id).length;

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {staff.name.slice(0, 1)}
                          </div>
                          <div>
                            <span>{staff.name}</span>
                            {staff.notes && (
                              <span className="text-[10px] text-slate-400 block line-clamp-1 font-normal">
                                {staff.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            staff.role === "LAWYER"
                              ? "bg-navy-50 text-navy-900 border border-navy-200"
                              : staff.role === "SECRETARY"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : staff.role === "ACCOUNTANT"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {ROLE_LABELS[staff.role] || staff.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {staff.barAssociationNumber ? (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-navy-700" />
                            <span>{staff.barAssociationNumber}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5" dir="ltr">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{staff.phone}</span>
                          </div>
                          {staff.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500" dir="ltr">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{staff.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDate(staff.hireDate)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {assignedCases}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {assignedConsultations}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            staff.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {staff.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/staff/${staff.id}/edit`}
                            prefetch={true}
                            className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition-colors"
                            title="تعديل البيانات"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setDeleteError(null);
                                setDeletingId(staff.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="حذف"
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
        title="تأكيد حذف عضو من فريق العمل"
        message="هل أنت متأكد من حذف هذا العضو؟ لن يمكن الحذف إذا كانت هناك قضايا أو استشارات مسندة إليه مباشرة."
        confirmText="تأكيد الحذف"
        isLoading={isDeleting}
      />
    </div>
  );
}
