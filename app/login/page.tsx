"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Scale, Lock, User, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = login(username, password);
      if (success) {
        router.push("/");
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: "admin" | "employee") => {
    if (role === "admin") {
      setUsername("admin");
      setPassword("admin123");
      login("admin", "admin123");
    } else {
      setUsername("employee");
      setPassword("emp123");
      login("employee", "emp123");
    }
    router.push("/");
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
            تسجيل الدخول للمستشارين وفريق العمل (نسخة التجربة Vercel Demo)
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Login Buttons */}
        <div className="mb-6 p-3 bg-navy-50/50 border border-navy-100 rounded-lg space-y-2">
          <span className="text-[11px] font-bold text-navy-900 block text-center">
            تجربة فورية بدون كتابة (نقرة واحدة):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>دخول كمدير نظام</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("employee")}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>دخول كموظف</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                placeholder="admin أو employee"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <span>{isLoading ? "جاري الدخول..." : "تسجيل الدخول للنظام"}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
