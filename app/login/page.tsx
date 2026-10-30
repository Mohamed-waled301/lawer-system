"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Scale, Lock, User, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginAction({ username, password });
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        {/* Office Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Scale className="w-8 h-8 text-slate-200" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            نظام إدارة مكتب المحاماة
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل الدخول للمستشارين وفريق العمل
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span>جاري التحقق من البيانات...</span>
            ) : (
              <>
                <span>دخول النظام</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-[11px] font-bold text-slate-600 mb-2">
            حسابات تجريبية مهيأة مسبقاً:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setUsername("admin");
                setPassword("admin123");
              }}
              className="p-2 text-right bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-700"
            >
              <span className="font-bold block text-slate-900">مدير النظام (Admin)</span>
              <span>admin / admin123</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUsername("employee");
                setPassword("emp123");
              }}
              className="p-2 text-right bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-700"
            >
              <span className="font-bold block text-slate-900">موظف سكرتارية</span>
              <span>employee / emp123</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6">
        نظام آمن • متوافق مع بيئة الويب وتطبيق سطح المكتب (Electron)
      </p>
    </div>
  );
}

