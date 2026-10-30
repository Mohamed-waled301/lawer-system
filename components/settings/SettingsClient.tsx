"use client";

import { useState } from "react";
import {
  Building2,
  ListOrdered,
  Layers,
  Archive,
  Save,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  updateOfficeSettings,
  createCategory,
  updateCategory,
  deleteCategory,
  createStatus,
  updateStatus,
  deleteStatus,
} from "@/actions/settings";

interface CategoryItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  _count?: { cases: number };
}

interface StatusItem {
  id: string;
  name: string;
  isClosed: boolean;
  color?: string | null;
  sortOrder: number;
  _count?: { cases: number };
}

interface SettingsClientProps {
  settings: Record<string, string>;
  categories: CategoryItem[];
  statuses: StatusItem[];
  userRole?: string;
}

export function SettingsClient({
  settings,
  categories: initialCategories,
  statuses: initialStatuses,
  userRole,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<
    "office" | "categories" | "statuses" | "backup"
  >("office");

  // Office Form
  const [officeForm, setOfficeForm] = useState({
    office_name: settings.office_name || "",
    office_owner: settings.office_owner || "",
    office_title: settings.office_title || "",
    office_address: settings.office_address || "",
    office_phones: settings.office_phones || "",
    office_email: settings.office_email || "",
    tax_number: settings.tax_number || "",
    letterhead_notes: settings.letterhead_notes || "",
  });
  const [officeSaved, setOfficeSaved] = useState(false);
  const [isSavingOffice, setIsSavingOffice] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [catForm, setCatForm] = useState({ code: "", name: "", description: "" });
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Statuses State
  const [statuses, setStatuses] = useState<StatusItem[]>(initialStatuses);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusItem | null>(null);
  const [statusForm, setStatusForm] = useState({
    name: "",
    isClosed: false,
    color: "blue",
    sortOrder: 1,
  });
  const [deletingStatusId, setDeletingStatusId] = useState<string | null>(null);

  // Backup State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";

  // Handle Office Save
  const handleOfficeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOffice(true);
    setOfficeSaved(false);
    try {
      const res = await updateOfficeSettings(officeForm);
      if (res.success) {
        setOfficeSaved(true);
        setTimeout(() => setOfficeSaved(false), 3000);
      } else {
        alert(res.error || "فشل حفظ الإعدادات");
      }
    } catch {
      alert("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSavingOffice(false);
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        const res = await updateCategory(editingCat.id, catForm);
        if (res.success && res.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCat.id ? (res.data as any) : c))
          );
          setShowCatForm(false);
        } else {
          alert(res.error || "فشل تعديل التصنيف");
        }
      } else {
        const res = await createCategory(catForm);
        if (res.success && res.data) {
          setCategories((prev) => [...prev, res.data as any]);
          setShowCatForm(false);
        } else {
          alert(res.error || "فشل إضافة التصنيف");
        }
      }
    } catch {
      alert("حدث خطأ أثناء حفظ التصنيف");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCatId) return;
    try {
      const res = await deleteCategory(deletingCatId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deletingCatId));
        setDeletingCatId(null);
      } else {
        alert(res.error || "فشل حذف التصنيف");
      }
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // Status Actions
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStatus) {
        const res = await updateStatus(editingStatus.id, statusForm);
        if (res.success && res.data) {
          setStatuses((prev) =>
            prev.map((s) => (s.id === editingStatus.id ? (res.data as any) : s))
          );
          setShowStatusForm(false);
        } else {
          alert(res.error || "فشل تعديل الحالة");
        }
      } else {
        const res = await createStatus(statusForm);
        if (res.success && res.data) {
          setStatuses((prev) => [...prev, res.data as any]);
          setShowStatusForm(false);
        } else {
          alert(res.error || "فشل إضافة الحالة");
        }
      }
    } catch {
      alert("حدث خطأ أثناء حفظ الحالة");
    }
  };

  const handleDeleteStatus = async () => {
    if (!deletingStatusId) return;
    try {
      const res = await deleteStatus(deletingStatusId);
      if (res.success) {
        setStatuses((prev) => prev.filter((s) => s.id !== deletingStatusId));
        setDeletingStatusId(null);
      } else {
        alert(res.error || "فشل حذف الحالة");
      }
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // Handle Restore Backup File Upload
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        "تحذير هام: استعادة النسخة الاحتياطية ستقوم باستبدال قاعدة البيانات الحالية والمستندات ببيانات الملف المرفوع. هل ترغب في المتابعة؟"
      )
    ) {
      e.target.value = "";
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);
    setRestoreMessage(null);

    const formData = new FormData();
    formData.append("backupFile", file);

    try {
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRestoreMessage(json.message || "تمت استعادة النسخة الاحتياطية بنجاح.");
      } else {
        setRestoreError(json.error || "فشل استعادة النسخة الاحتياطية");
      }
    } catch {
      setRestoreError("حدث خطأ أثناء الاتصال بالخادم لرفع النسخة الاحتياطية");
    } finally {
      setIsRestoring(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          إعدادات النظام والنسخ الاحتياطي
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          تخصيص بيانات المكتب والمطبوعات، ترقيم وتصنيف القضايا، والحفظ الاحتياطي الشامل
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab("office")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "office"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>بيانات المكتب وترويسة المطبوعات</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "categories"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>تصنيفات القضايا وأكوادها ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("statuses")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "statuses"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>حالات القضايا ({statuses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("backup")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "backup"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>النسخ الاحتياطي والاستعادة (ZIP)</span>
        </button>
      </div>

      {/* Tab 1: Office Settings */}
      {activeTab === "office" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 max-w-3xl">
          <form onSubmit={handleOfficeSubmit} className="space-y-4 text-xs">
            {officeSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>تم حفظ وتحديث بيانات المكتب وترويسة المطبوعات بنجاح.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المكتب / المؤسسة القانونية *
                </label>
                <input
                  type="text"
                  required
                  value={officeForm.office_name}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, office_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المستشار / رئيس المكتب *
                </label>
                <input
                  type="text"
                  required
                  value={officeForm.office_owner}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, office_owner: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اللقب والدرجة المهنية (يظهر في ترويسة التقارير)
              </label>
              <input
                type="text"
                value={officeForm.office_title}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, office_title: e.target.value })
                }
                placeholder="مثال: محام بالنقض والدستورية والإدارية العليا"
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                عنوان المقر الرئيسي للمكتب
              </label>
              <input
                type="text"
                value={officeForm.office_address}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, office_address: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  أرقام الهواتف (للمطبوعات)
                </label>
                <input
                  type="text"
                  value={officeForm.office_phones}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, office_phones: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={officeForm.office_email}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, office_email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الرقم الضريبي أو القيد
                </label>
                <input
                  type="text"
                  value={officeForm.tax_number}
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, tax_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                تذييل وملاحظات المطبوعات الرسمية والإيصالات
              </label>
              <textarea
                rows={2}
                value={officeForm.letterhead_notes}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, letterhead_notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            {isAdmin && (
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingOffice}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingOffice ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 2: Case Categories with Custom Codes */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                قائمة تصنيفات القضايا وترقيمها
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                يمكنك تحديد كود/رقم مخصص لكل تصنيف (مثل 1 = جنح، 2 = جنايات، 3 = أحوال شخصية، 4 = مدني...)
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingCat(null);
                  setCatForm({ code: (categories.length + 1).toString(), name: "", description: "" });
                  setShowCatForm(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة تصنيف جديد</span>
              </button>
            )}
          </div>

          {/* Inline Category Form */}
          {showCatForm && (
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {editingCat ? "تعديل تصنيف القضايا" : "إضافة تصنيف قضائي جديد"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCatForm(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-medium"
                >
                  إغلاق النموذج
                </button>
              </div>
              <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      كود / رقم التصنيف (مثال: 1, 2, 3) *
                    </label>
                    <input
                      type="text"
                      required
                      value={catForm.code}
                      onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      اسم التصنيف القضائي *
                    </label>
                    <input
                      type="text"
                      required
                      value={catForm.name}
                      onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                      placeholder="مثال: قضايا الملكية الفكرية"
                      className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وصف التصنيف</label>
                  <textarea
                    rows={2}
                    value={catForm.description}
                    onChange={(e) =>
                      setCatForm({ ...catForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCatForm(false)}
                    className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
                  >
                    حفظ التصنيف
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 w-28">كود / رقم التصنيف</th>
                  <th className="py-3 px-4">اسم التصنيف</th>
                  <th className="py-3 px-4">الوصف أو الاختصاص</th>
                  <th className="py-3 px-4 w-32">القضايا المسجلة</th>
                  {isAdmin && <th className="py-3 px-4 text-center w-28">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {cat.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-3 px-4 text-slate-600">{cat.description || "-"}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {cat._count?.cases || 0} قضية
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCat(cat);
                              setCatForm({
                                code: cat.code,
                                name: cat.name,
                                description: cat.description || "",
                              });
                              setShowCatForm(true);
                            }}
                            className="p-1 text-slate-600 hover:text-navy-900"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCatId(cat.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Case Statuses */}
      {activeTab === "statuses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                قائمة مراحل وحالات القضايا القابلة للتعديل
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                إدارة الحالات المتاحة عند تسجيل وتحديث سير الدعاوى (تحقيق، أول درجة، استئناف، نقض، منتهية، مشطوبة...)
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingStatus(null);
                  setStatusForm({
                    name: "",
                    isClosed: false,
                    color: "blue",
                    sortOrder: statuses.length + 1,
                  });
                  setShowStatusForm(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة حالة جديدة</span>
              </button>
            )}
          </div>

          {/* Inline Status Form */}
          {showStatusForm && (
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {editingStatus ? "تعديل حالة القضية" : "إضافة حالة قضائية جديدة"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowStatusForm(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-medium"
                >
                  إغلاق النموذج
                </button>
              </div>
              <form onSubmit={handleSaveStatus} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الحالة *</label>
                  <input
                    type="text"
                    required
                    value={statusForm.name}
                    onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                    placeholder="مثال: فحص طعون النقض"
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ترتيب العرض
                    </label>
                    <input
                      type="number"
                      value={statusForm.sortOrder}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          sortOrder: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      نوع انتهاء القضية
                    </label>
                    <select
                      value={statusForm.isClosed ? "true" : "false"}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          isClosed: e.target.value === "true",
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
                    >
                      <option value="false">قضية متداولة (نشطة)</option>
                      <option value="true">قضية مغلقة / منتهية</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowStatusForm(false)}
                    className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
                  >
                    حفظ الحالة
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 w-24">الترتيب</th>
                  <th className="py-3 px-4">مسمى الحالة</th>
                  <th className="py-3 px-4">نوع الحالة</th>
                  <th className="py-3 px-4 w-32">القضايا المسجلة</th>
                  {isAdmin && <th className="py-3 px-4 text-center w-28">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statuses.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {st.sortOrder}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          st.isClosed
                            ? "bg-slate-100 text-slate-700"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {st.isClosed ? "قضية مغلقة / منتهية" : "قضية جارية / متداولة"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {st._count?.cases || 0} قضية
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingStatus(st);
                              setStatusForm({
                                name: st.name,
                                isClosed: st.isClosed,
                                color: st.color || "blue",
                                sortOrder: st.sortOrder,
                              });
                              setShowStatusForm(true);
                            }}
                            className="p-1 text-slate-600 hover:text-navy-900"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStatusId(st.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Backup and Restore */}
      {activeTab === "backup" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 max-w-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              النسخ الاحتياطي الشامل واستعادة النظام
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              النسخة الاحتياطية تتضمن ملف قاعدة البيانات كاملاً (SQLite) ومجلد كافة المستندات
              والإيصالات المرفوعة في ملف ZIP مضغوط واحد.
            </p>
          </div>

          {restoreMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {restoreError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Export Backup Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">تصدير وتنزيل نسخة احتياطية الآن</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تنزيل ملف ZIP يحتوي على قاعدة البيانات وكافة الملفات
              </p>
            </div>
            <a
              href="/api/backup/export"
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل النسخة (ZIP)</span>
            </a>
          </div>

          {/* Restore Backup Card */}
          {isAdmin && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  استعادة نسخة احتياطية سابقة من ملف ZIP
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  حدد ملف ZIP تم تصديره مسبقاً من هذا النظام لاستعادة كافة البيانات والأوراق
                </p>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded cursor-pointer">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>
                    {isRestoring ? "جاري فك وضغط واستعادة البيانات..." : "اختيار ملف ZIP للاستعادة"}
                  </span>
                  <input
                    type="file"
                    accept=".zip"
                    disabled={isRestoring}
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCatId}
        onClose={() => setDeletingCatId(null)}
        onConfirm={handleDeleteCategory}
        title="حذف تصنيف قضايا"
        message="هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن حذفه إذا كانت هناك قضايا مسجلة تحته."
        confirmText="تأكيد الحذف"
      />

      {/* Delete Status Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingStatusId}
        onClose={() => setDeletingStatusId(null)}
        onConfirm={handleDeleteStatus}
        title="حذف حالة قضائية"
        message="هل أنت متأكد من حذف هذه الحالة؟ لا يمكن حذفها إذا كانت هناك قضايا مسجلة بها حالياً."
        confirmText="تأكيد الحذف"
      />
    </div>
  );
}

