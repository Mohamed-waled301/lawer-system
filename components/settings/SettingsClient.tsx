"use client";

import { useState, useRef } from "react";
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
  RotateCcw,
  Shield,
  FileJson,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useApp } from "@/lib/store";

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
  settings?: Record<string, string>;
  categories?: CategoryItem[];
  statuses?: StatusItem[];
  userRole?: string;
}

export function SettingsClient({ userRole }: SettingsClientProps) {
  const {
    settings,
    updateSettings,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    statuses,
    addStatus,
    updateStatus,
    deleteStatus,
    cases,
    resetToDefaultData,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "office" | "categories" | "statuses" | "backup"
  >("office");

  // Office Form
  const [officeForm, setOfficeForm] = useState({
    office_name: settings.office_name || "مجموعة الشريف للمحاماة والاستشارات القانونية",
    office_owner: settings.office_owner || "الأستاذ / عبد الحميد الشريف",
    office_title: settings.office_title || "محام بالنقض والدستورية والإدارية العليا",
    office_address: settings.office_address || "١٤ شارع مراد - ميدان الجيزة - الدور الخامس - محافظة الجيزة",
    office_phones: settings.office_phones || "01000000001 - 0235700000",
    office_email: settings.office_email || "contact@elsharif-law.com",
    tax_number: settings.tax_number || "100-245-890",
    letterhead_notes: settings.letterhead_notes || "جميع المواعيد القانونية والطعون مسجلة وموثقة رسمياً",
  });
  const [officeSaved, setOfficeSaved] = useState(false);

  // Categories State
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [catForm, setCatForm] = useState({ code: "", name: "", description: "" });
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [catError, setCatError] = useState<string | null>(null);

  // Statuses State
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusItem | null>(null);
  const [statusForm, setStatusForm] = useState({
    name: "",
    isClosed: false,
    color: "blue",
    sortOrder: 1,
  });
  const [deletingStatusId, setDeletingStatusId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Backup State
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const isAdmin = (userRole || currentUser?.role) === "ADMIN";

  // Handle Office Save
  const handleOfficeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(officeForm);
    setOfficeSaved(true);
    setTimeout(() => setOfficeSaved(false), 3000);
  };

  // Category Actions
  const handleOpenCatForm = (cat?: CategoryItem) => {
    setCatError(null);
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        code: cat.code,
        name: cat.name,
        description: cat.description || "",
      });
    } else {
      setEditingCat(null);
      setCatForm({
        code: (categories.length + 1).toString(),
        name: "",
        description: "",
      });
    }
    setShowCatForm(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);

    if (!catForm.code.trim() || !catForm.name.trim()) {
      setCatError("كود واسم التصنيف مطلوبان");
      return;
    }

    try {
      if (editingCat) {
        updateCategory(editingCat.id, {
          code: catForm.code.trim(),
          name: catForm.name.trim(),
          description: catForm.description.trim() || undefined,
        });
      } else {
        addCategory({
          code: catForm.code.trim(),
          name: catForm.name.trim(),
          description: catForm.description.trim() || undefined,
        });
      }
      setShowCatForm(false);
    } catch {
      setCatError("حدث خطأ أثناء حفظ التصنيف");
    }
  };

  const handleDeleteCategory = () => {
    if (!deletingCatId) return;
    const res = deleteCategory(deletingCatId);
    if (res.success) {
      setDeletingCatId(null);
    } else {
      alert(res.error || "فشل حذف التصنيف");
    }
  };

  // Status Actions
  const handleOpenStatusForm = (st?: StatusItem) => {
    setStatusError(null);
    if (st) {
      setEditingStatus(st);
      setStatusForm({
        name: st.name,
        isClosed: st.isClosed,
        color: st.color || "blue",
        sortOrder: st.sortOrder || 1,
      });
    } else {
      setEditingStatus(null);
      setStatusForm({
        name: "",
        isClosed: false,
        color: "blue",
        sortOrder: statuses.length + 1,
      });
    }
    setShowStatusForm(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);

    if (!statusForm.name.trim()) {
      setStatusError("اسم حالة القضية مطلوب");
      return;
    }

    try {
      if (editingStatus) {
        updateStatus(editingStatus.id, {
          name: statusForm.name.trim(),
          isClosed: statusForm.isClosed,
          color: statusForm.color,
          sortOrder: statusForm.sortOrder,
        });
      } else {
        addStatus({
          name: statusForm.name.trim(),
          isClosed: statusForm.isClosed,
          color: statusForm.color,
          sortOrder: statusForm.sortOrder,
        });
      }
      setShowStatusForm(false);
    } catch {
      setStatusError("حدث خطأ أثناء حفظ الحالة");
    }
  };

  const handleDeleteStatus = () => {
    if (!deletingStatusId) return;
    const res = deleteStatus(deletingStatusId);
    if (res.success) {
      setDeletingStatusId(null);
    } else {
      alert(res.error || "فشل حذف الحالة");
    }
  };

  // Export Local JSON Backup
  const handleExportJson = () => {
    try {
      const dataStr = localStorage.getItem("law_office_db_v2");
      if (!dataStr) {
        alert("لا توجد بيانات محلية للتصدير");
        return;
      }
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `law_office_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("فشل تصدير النسخة الاحتياطية");
    }
  };

  // Import Local JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          localStorage.setItem("law_office_db_v2", content);
          setBackupMessage("تمت استعادة النسخة الاحتياطية بنجاح! جاري تحديث الصفحة...");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setBackupError("صيغة الملف غير متطابقة مع قاعدة بيانات النظام");
        }
      } catch {
        setBackupError("حدث خطأ في قراءة وتحليل ملف النسخة الاحتياطية");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab("office")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
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
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
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
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
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
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "backup"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>النسخ الاحتياطي والاستعادة</span>
        </button>
      </div>

      {/* Tab 1: Office Settings */}
      {activeTab === "office" && (
        <form
          onSubmit={handleOfficeSubmit}
          className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-5 text-xs"
        >
          {officeSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ بيانات المكتب وترويسة المطبوعات بنجاح.</span>
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
                صاحب المكتب / مدير المؤسسة *
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الصفة القانونية ودرجة القيد *
              </label>
              <input
                type="text"
                required
                value={officeForm.office_title}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, office_title: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                أرقام الهواتف والتواصل *
              </label>
              <input
                type="text"
                required
                value={officeForm.office_phones}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, office_phones: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                عنوان المقر الرئيسي *
              </label>
              <input
                type="text"
                required
                value={officeForm.office_address}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, office_address: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                البريد الإلكتروني الرسمي
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
                الرقم الضريبي أو السجل
              </label>
              <input
                type="text"
                value={officeForm.tax_number}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, tax_number: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                ملاحظات أو تنويه أسفل الترويسة المطبوعة (A4)
              </label>
              <input
                type="text"
                value={officeForm.letterhead_notes}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, letterhead_notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ إعدادات المكتب</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Categories */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              يمكنك تخصيص كود أو رقم محدد لكل تصنيف (مثال: 1 = جنح، 2 = جنايات، 3 = أسرة...)
            </p>
            <button
              onClick={() => handleOpenCatForm()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تصنيف جديد</span>
            </button>
          </div>

          {showCatForm && (
            <form
              onSubmit={handleSaveCategory}
              className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3 text-xs"
            >
              <h4 className="font-bold text-slate-800">
                {editingCat ? "تعديل تصنيف قضية" : "إضافة تصنيف قضية جديد"}
              </h4>

              {catError && (
                <div className="p-2 bg-red-50 text-red-700 rounded border border-red-200">
                  {catError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    كود / رقم التصنيف *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.code}
                    onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                    placeholder="مثال: 1"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم التصنيف *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    placeholder="مثال: قضايا الجنح والمخالفات"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الوصف (اختياري)
                  </label>
                  <input
                    type="text"
                    value={catForm.description}
                    onChange={(e) =>
                      setCatForm({ ...catForm, description: e.target.value })
                    }
                    placeholder="وصف مختصر..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatForm(false)}
                  className="px-3 py-1 border border-slate-300 rounded hover:bg-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-slate-900 text-white rounded font-bold"
                >
                  حفظ التصنيف
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="py-2.5 px-4">رقم / كود التصنيف</th>
                  <th className="py-2.5 px-4">اسم التصنيف</th>
                  <th className="py-2.5 px-4">الوصف</th>
                  <th className="py-2.5 px-4 text-center">عدد القضايا</th>
                  <th className="py-2.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => {
                  const casesCount = cases.filter((cs) => cs.categoryId === c.id).length;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-navy-900">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border">
                          {c.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">{c.description || "-"}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold">
                        {casesCount}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenCatForm(c)}
                            className="p-1 text-slate-500 hover:text-navy-900"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingCatId(c.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Statuses */}
      {activeTab === "statuses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              قائمة مراحل وسير الدعاوى القضائية (متداولة، حكم تمهيدي، محكومة، صلح...)
            </p>
            <button
              onClick={() => handleOpenStatusForm()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حالة جديدة</span>
            </button>
          </div>

          {showStatusForm && (
            <form
              onSubmit={handleSaveStatus}
              className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3 text-xs"
            >
              <h4 className="font-bold text-slate-800">
                {editingStatus ? "تعديل حالة قضية" : "إضافة حالة قضية جديدة"}
              </h4>

              {statusError && (
                <div className="p-2 bg-red-50 text-red-700 rounded border border-red-200">
                  {statusError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم الحالة *
                  </label>
                  <input
                    type="text"
                    required
                    value={statusForm.name}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, name: e.target.value })
                    }
                    placeholder="مثال: حجز للحكم"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الترتيب التسلسلي
                  </label>
                  <input
                    type="number"
                    value={statusForm.sortOrder}
                    onChange={(e) =>
                      setStatusForm({
                        ...statusForm,
                        sortOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>

                <div className="pt-6">
                  <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusForm.isClosed}
                      onChange={(e) =>
                        setStatusForm({ ...statusForm, isClosed: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-slate-900"
                    />
                    <span>تعتبر القضية منتهية / مغلقة بهذه الحالة</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusForm(false)}
                  className="px-3 py-1 border border-slate-300 rounded hover:bg-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-slate-900 text-white rounded font-bold"
                >
                  حفظ الحالة
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="py-2.5 px-4">الترتيب</th>
                  <th className="py-2.5 px-4">اسم الحالة</th>
                  <th className="py-2.5 px-4">طبيعة الحالة</th>
                  <th className="py-2.5 px-4 text-center">القضايا المسجلة بها</th>
                  <th className="py-2.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statuses.map((s) => {
                  const casesCount = cases.filter((cs) => cs.statusId === s.id).length;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {s.sortOrder}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            s.isClosed
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {s.isClosed ? "قضية منتهية" : "قضية متداولة / نشطة"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold">
                        {casesCount}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenStatusForm(s)}
                            className="p-1 text-slate-500 hover:text-navy-900"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingStatusId(s.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Backup & Restore */}
      {activeTab === "backup" && (
        <div className="space-y-6 text-xs">
          {backupMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{backupMessage}</span>
            </div>
          )}

          {backupError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{backupError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Export JSON Backup */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded bg-navy-50 border border-navy-200 flex items-center justify-center text-navy-800">
                <FileJson className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                تصدير نسخة احتياطية كاملة (JSON)
              </h3>
              <p className="text-slate-500">
                تحميل نسخة من كامل بيانات المكتب (الموكلين، القضايا، الجلسات، إيصالات السداد،
                الخزائن، والمستندات) في ملف JSON يمكن حفظه واستعادته في أي وقت.
              </p>
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded"
              >
                <Download className="w-4 h-4" />
                <span>تصدير وتحميل النسخة الآن</span>
              </button>
            </div>

            {/* Import JSON Backup */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                استعادة نسخة احتياطية من ملف (JSON)
              </h3>
              <p className="text-slate-500">
                رفع واستعادة نسخة سابقة تم تصديرها من السيستم لاسترجاع كافة السجلات والأرصدة
                وحالات القضايا فوراً.
              </p>
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded"
              >
                <Upload className="w-4 h-4" />
                <span>اختيار ملف النسخة واستعادتها</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">
                إعادة ضبط قاعدة البيانات للبيانات الافتراضية
              </h4>
              <p className="text-slate-500 mt-0.5">
                إعادة تحميل بيانات التجربة الرسمية (قضايا جاهزة، موكلين، جلسات قادمة، وخزن متوازنة)
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("هل ترغب في إعادة ضبط كافة البيانات إلى الحالة الافتراضية للتجربة؟")) {
                  resetToDefaultData();
                  alert("تمت إعادة ضبط البيانات بنجاح!");
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الضبط</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCatId}
        onClose={() => setDeletingCatId(null)}
        onConfirm={handleDeleteCategory}
        title="تأكيد حذف تصنيف قضية"
        message="هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن الحذف إذا كانت هناك قضايا مسجلة بهذا التصنيف."
        confirmText="تأكيد الحذف"
      />

      {/* Delete Status Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingStatusId}
        onClose={() => setDeletingStatusId(null)}
        onConfirm={handleDeleteStatus}
        title="تأكيد حذف حالة قضية"
        message="هل أنت متأكد من حذف هذه الحالة؟ لا يمكن الحذف إذا كانت هناك قضايا مسجلة بهذه الحالة."
        confirmText="تأكيد الحذف"
      />
    </div>
  );
}
