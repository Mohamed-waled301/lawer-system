"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Vault,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Minus,
  ArrowRightLeft,
  Calendar,
  Building,
  Smartphone,
  CreditCard,
  Search,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useApp } from "@/lib/store";

interface TreasuryItem {
  id: string;
  name: string;
  paymentMethod: string;
  balance: number;
  accountNumber?: string | null;
  description?: string | null;
  _count?: {
    transactions: number;
    payments: number;
  };
}

interface TreasuryClientProps {
  treasuries?: TreasuryItem[];
  userRole?: string;
}

export function TreasuryClient({ userRole }: TreasuryClientProps) {
  const {
    treasuries,
    treasuryTransactions,
    addTreasuryTransaction: storeAddTransaction,
    transferBetweenTreasuries: storeTransfer,
    payments,
    currentUser,
  } = useApp();

  const [actionType, setActionType] = useState<"DEPOSIT" | "WITHDRAW" | "TRANSFER" | null>(null);

  // Form State
  const [targetTreasuryId, setTargetTreasuryId] = useState(treasuries[0]?.id || "");
  const [toTreasuryId, setToTreasuryId] = useState(treasuries[1]?.id || "");
  const [amount, setAmount] = useState<number>(1000);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ledger Filter
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState("ALL");

  const totalBalance = treasuries.reduce((sum, t) => sum + t.balance, 0);

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (amount <= 0) {
      setError("المبلغ يجب أن يكون أكبر من الصفر");
      return;
    }

    if (!description.trim()) {
      setError("يرجى كتابة سبب وبيان الحركة المالية");
      return;
    }

    setIsSubmitting(true);

    try {
      if (actionType === "TRANSFER") {
        if (targetTreasuryId === toTreasuryId) {
          setError("لا يمكن التحويل لنفس الخزينة");
          setIsSubmitting(false);
          return;
        }

        const res = storeTransfer(targetTreasuryId, toTreasuryId, amount, description);
        if (res.success) {
          setSuccessMsg("تم التحويل المالي بين الخزائن بنجاح وتحديث الأرصدة.");
          setActionType(null);
          setDescription("");
        } else {
          setError(res.error || "فشل التحويل لعدم كفاية الرصيد");
        }
      } else if (actionType === "DEPOSIT" || actionType === "WITHDRAW") {
        storeAddTransaction(
          targetTreasuryId,
          actionType === "DEPOSIT" ? "DEPOSIT" : "WITHDRAWAL",
          amount,
          description
        );
        setSuccessMsg(
          actionType === "DEPOSIT"
            ? "تم الإيداع المالي في الخزينة بنجاح."
            : "تم تسجيل السحب والمصروفات بنجاح وخصم المبلغ من الرصيد."
        );
        setActionType(null);
        setDescription("");
      }
    } catch {
      setError("حدث خطأ أثناء تنفيذ الحركة المالية");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Filter transactions
  const filteredTransactions = treasuryTransactions.filter((tx) => {
    const q = ledgerSearch.trim().toLowerCase();
    const treasury = treasuries.find((t) => t.id === tx.treasuryId);
    const matchesSearch =
      !q ||
      tx.description.toLowerCase().includes(q) ||
      (treasury?.name && treasury.name.toLowerCase().includes(q)) ||
      (tx.recordedBy && tx.recordedBy.toLowerCase().includes(q));

    const matchesType =
      ledgerTypeFilter === "ALL" ||
      (ledgerTypeFilter === "DEPOSIT" && tx.type === "DEPOSIT") ||
      (ledgerTypeFilter === "WITHDRAWAL" && tx.type === "WITHDRAWAL");

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Vault className="w-5 h-5 text-navy-800" />
            <span>الخزائن المالية وحسابات التحصيل</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الخزينة النقدية، محافظ الكاش، وحسابات إنستاباي مع تتبع الأرصدة والتحويلات البينية
          </p>
        </div>

        {/* Global Total Balance */}
        <div className="bg-white px-5 py-3 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">
            إجمالي السيولة النقدية والبنكية:
          </span>
          <span className="text-xl font-black font-mono text-emerald-800">
            {formatCurrency(totalBalance)}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3 Safes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {treasuries.map((treasury) => {
          let icon = Building;
          let badgeColor = "bg-blue-50 text-blue-800 border-blue-200";
          let label = "خزينة نقدية";

          if (treasury.paymentMethod === "WALLET") {
            icon = Smartphone;
            badgeColor = "bg-purple-50 text-purple-800 border-purple-200";
            label = "محافظ إلكترونية";
          } else if (treasury.paymentMethod === "INSTAPAY") {
            icon = CreditCard;
            badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
            label = "إنستاباي / بنكي";
          }

          const IconComponent = icon;
          const treasuryPaymentsCount = payments.filter(
            (p) => p.treasuryId === treasury.id || p.paymentMethod === treasury.paymentMethod
          ).length;

          return (
            <div
              key={treasury.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${badgeColor}`}>
                    {label}
                  </span>
                  <div className="w-9 h-9 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {treasury.name}
                </h3>
                {treasury.accountNumber && (
                  <p className="text-[11px] text-slate-500 font-mono mt-1" dir="ltr">
                    {treasury.accountNumber}
                  </p>
                )}
                {treasury.description && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {treasury.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">الرصيد المتاح</span>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {formatCurrency(treasury.balance)}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {treasuryPaymentsCount} إيصال
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Buttons for Safe Management */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">العمليات على الخزائن:</span>

          <button
            onClick={() => {
              setError(null);
              setActionType("DEPOSIT");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إيداع مالي مباشر</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setActionType("WITHDRAW");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>سحب / مصروفات مكتبية</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setActionType("TRANSFER");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>تحويل بين الخزائن</span>
          </button>
        </div>

        <Link
          href="/payments/new"
          className="text-xs text-navy-800 hover:underline font-bold"
        >
          + تحرير إيصال سداد جديد
        </Link>
      </div>

      {/* Action Form (Full width container when opened) */}
      {actionType && (
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 space-y-4 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {actionType === "DEPOSIT" && "تسجيل إيداع نقدي أو بنكي في الخزينة"}
              {actionType === "WITHDRAW" && "تسجيل سحب أو مصروفات من الخزينة"}
              {actionType === "TRANSFER" && "تحويل سيولة نقدية بين الخزائن"}
            </h3>
            <button
              onClick={() => setActionType(null)}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              ✕ إلغاء
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {actionType === "TRANSFER" ? "التحويل من خزينة *" : "الخزينة المعنية *"}
                </label>
                <select
                  value={targetTreasuryId}
                  onChange={(e) => setTargetTreasuryId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-semibold"
                >
                  {treasuries.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (رصيدها: {formatCurrency(t.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {actionType === "TRANSFER" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    التحويل إلى خزينة *
                  </label>
                  <select
                    value={toTreasuryId}
                    onChange={(e) => setToTreasuryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-semibold"
                  >
                    {treasuries.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (رصيدها: {formatCurrency(t.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المبلغ (ج.م) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                البيان / سبب الحركة *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: سحب مصروفات انتقال لجلسات المحكمة، توريد نقدية من حساب إنستاباي للخزنة..."
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmitting ? "جاري المعالجة..." : "تأكيد الحركة المالية"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Treasury Ledger History */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              دفتر حركة الخزائن والمعاملات المالية
            </h2>
            <p className="text-xs text-slate-500">
              سجل كامل لكافة الإيداعات، السحوبات، والتحويلات مع تحديث الأرصدة بعد كل حركة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="بحث في البيان أو الخزينة..."
                className="w-64 pl-3 pr-8 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
            </div>

            <select
              value={ledgerTypeFilter}
              onChange={(e) => setLedgerTypeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
            >
              <option value="ALL">جميع الحركات</option>
              <option value="DEPOSIT">إيداعات فقط (+)</option>
              <option value="WITHDRAWAL">سحوبات ومصروفات (-)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">نوع الحركة</th>
                <th className="py-3 px-4">الخزينة</th>
                <th className="py-3 px-4">البيان والتفاصيل</th>
                <th className="py-3 px-4">المسؤول</th>
                <th className="py-3 px-4 text-left">المبلغ</th>
                <th className="py-3 px-4 text-left">الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لا توجد حركات مسجلة تطابق البحث.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const treasury = treasuries.find((t) => t.id === tx.treasuryId);
                  const isDeposit = tx.type === "DEPOSIT";

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isDeposit
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                          }`}
                        >
                          {isDeposit ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>إيداع / توريد</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              <span>سحب / مصروف</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {treasury?.name || "خزينة"}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {tx.recordedBy || "المسؤول"}
                      </td>
                      <td
                        className={`py-3 px-4 text-left font-mono font-bold text-sm whitespace-nowrap ${
                          isDeposit ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {isDeposit ? "+" : "-"} {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-left font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                        {formatCurrency(tx.newBalance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
