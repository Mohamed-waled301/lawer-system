"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  INITIAL_DATA,
  StoredUser,
  StoredStaff,
  StoredClient,
  StoredCase,
  StoredConsultation,
  StoredPayment,
  StoredTreasury,
  StoredTreasuryTransaction,
  StoredCategory,
  StoredStatus,
  StoredActivity,
  StoredSettings,
  StoredDocument,
  StoredHearing,
  StoredCaseStatusHistory,
} from "./initialData";

const STORAGE_KEY = "law_office_db_v2";

interface AppContextType {
  isLoaded: boolean;
  currentUser: StoredUser | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;

  // Settings
  settings: StoredSettings;
  updateSettings: (newSettings: Partial<StoredSettings>) => void;

  // Staff
  staff: StoredStaff[];
  addStaff: (data: Omit<StoredStaff, "id">) => StoredStaff;
  updateStaff: (id: string, data: Partial<StoredStaff>) => void;
  deleteStaff: (id: string) => { success: boolean; error?: string };

  // Clients
  clients: StoredClient[];
  generateNextClientCode: () => string;
  addClient: (data: Omit<StoredClient, "id" | "clientCode" | "createdAt" | "documents" | "isDeleted">) => StoredClient;
  updateClient: (id: string, data: Partial<StoredClient>) => void;
  deleteClient: (id: string) => void;
  addClientDocument: (clientId: string, doc: Omit<StoredDocument, "id" | "createdAt">) => void;
  deleteClientDocument: (clientId: string, docId: string) => void;

  // Cases
  cases: StoredCase[];
  addCase: (data: any) => StoredCase;
  updateCase: (id: string, data: Partial<StoredCase>) => void;
  deleteCase: (id: string) => void;
  changeCaseStatus: (caseId: string, newStatusId: string, notes?: string) => void;
  addCaseHearing: (caseId: string, hearing: Omit<StoredHearing, "id" | "caseId" | "createdAt">) => void;
  deleteCaseHearing: (caseId: string, hearingId: string) => void;
  addCaseDocument: (caseId: string, doc: Omit<StoredDocument, "id" | "createdAt">) => void;
  deleteCaseDocument: (caseId: string, docId: string) => void;

  // Consultations
  consultations: StoredConsultation[];
  addConsultation: (data: any) => StoredConsultation;
  convertConsultationToCase: (consultationId: string, caseData: any) => StoredCase;

  // Payments & Treasuries
  payments: StoredPayment[];
  treasuries: StoredTreasury[];
  treasuryTransactions: StoredTreasuryTransaction[];
  addPayment: (data: any) => StoredPayment;
  deletePayment: (id: string) => void;
  addTreasuryTransaction: (
    treasuryId: string,
    type: "DEPOSIT" | "WITHDRAWAL",
    amount: number,
    description: string
  ) => void;
  transferBetweenTreasuries: (
    fromId: string,
    toId: string,
    amount: number,
    notes?: string
  ) => { success: boolean; error?: string };

  // Categories & Statuses
  categories: StoredCategory[];
  addCategory: (data: Omit<StoredCategory, "id">) => StoredCategory;
  updateCategory: (id: string, data: Partial<StoredCategory>) => void;
  deleteCategory: (id: string) => { success: boolean; error?: string };

  statuses: StoredStatus[];
  addStatus: (data: Omit<StoredStatus, "id">) => StoredStatus;
  updateStatus: (id: string, data: Partial<StoredStatus>) => void;
  deleteStatus: (id: string) => { success: boolean; error?: string };

  // Activities & Utilities
  activities: StoredActivity[];
  logActivity: (action: string, entityType: string, details: string) => void;
  resetToDefaultData: () => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(INITIAL_DATA.users[0]);
  const [settings, setSettings] = useState<StoredSettings>(INITIAL_DATA.settings);
  const [staff, setStaff] = useState<StoredStaff[]>(INITIAL_DATA.staff);
  const [clients, setClients] = useState<StoredClient[]>(INITIAL_DATA.clients);
  const [cases, setCases] = useState<StoredCase[]>(INITIAL_DATA.cases);
  const [consultations, setConsultations] = useState<StoredConsultation[]>(INITIAL_DATA.consultations);
  const [payments, setPayments] = useState<StoredPayment[]>(INITIAL_DATA.payments);
  const [treasuries, setTreasuries] = useState<StoredTreasury[]>(INITIAL_DATA.treasuries);
  const [treasuryTransactions, setTreasuryTransactions] = useState<StoredTreasuryTransaction[]>(
    INITIAL_DATA.treasuryTransactions
  );
  const [categories, setCategories] = useState<StoredCategory[]>(INITIAL_DATA.categories);
  const [statuses, setStatuses] = useState<StoredStatus[]>(INITIAL_DATA.statuses);
  const [activities, setActivities] = useState<StoredActivity[]>(INITIAL_DATA.activities);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.staff) setStaff(parsed.staff);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.cases) setCases(parsed.cases);
        if (parsed.consultations) setConsultations(parsed.consultations);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.treasuries) setTreasuries(parsed.treasuries);
        if (parsed.treasuryTransactions) setTreasuryTransactions(parsed.treasuryTransactions);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.statuses) setStatuses(parsed.statuses);
        if (parsed.activities) setActivities(parsed.activities);

        const savedUser = localStorage.getItem("law_office_user_v2");
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const fullState = {
        settings,
        staff,
        clients,
        cases,
        consultations,
        payments,
        treasuries,
        treasuryTransactions,
        categories,
        statuses,
        activities,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [
    isLoaded,
    settings,
    staff,
    clients,
    cases,
    consultations,
    payments,
    treasuries,
    treasuryTransactions,
    categories,
    statuses,
    activities,
  ]);

  const login = (username: string, pass: string): boolean => {
    const u = INITIAL_DATA.users.find(
      (user) => user.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (u) {
      setCurrentUser(u);
      localStorage.setItem("law_office_user_v2", JSON.stringify(u));
      return true;
    }
    // Also accept any username as employee if not matched
    const guestUser: StoredUser = {
      id: "u-guest",
      username: username || "user",
      name: `الأستاذ / ${username || "المستخدم"}`,
      role: username === "admin" ? "ADMIN" : "EMPLOYEE",
    };
    setCurrentUser(guestUser);
    localStorage.setItem("law_office_user_v2", JSON.stringify(guestUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("law_office_user_v2");
  };

  const logActivity = (action: string, entityType: string, details: string) => {
    const act: StoredActivity = {
      id: "act-" + Math.random().toString(36).substring(2, 9),
      action,
      entityType,
      details,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);
  };

  const updateSettings = (newSettings: Partial<StoredSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity("UPDATE", "SETTINGS", `تعديل بيانات وإعدادات المكتب بواسطة ${currentUser?.name}`);
  };

  // Staff
  const addStaff = (data: Omit<StoredStaff, "id">) => {
    const newStaff: StoredStaff = {
      ...data,
      id: "stf-" + Math.random().toString(36).substring(2, 9),
    };
    setStaff((prev) => [...prev, newStaff]);
    logActivity("CREATE", "STAFF", `إضافة عضو جديد: ${newStaff.name} (${newStaff.role})`);
    return newStaff;
  };

  const updateStaff = (id: string, data: Partial<StoredStaff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logActivity("UPDATE", "STAFF", `تعديل بيانات العضو كود ${id}`);
  };

  const deleteStaff = (id: string) => {
    const count = cases.filter((c) => c.lawyerId === id).length;
    if (count > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذا العضو لوجود ${count} قضية مسندة إليه. يمكنك تعطيل حسابه بدلاً من الحذف.`,
      };
    }
    setStaff((prev) => prev.filter((s) => s.id !== id));
    logActivity("DELETE", "STAFF", `حذف عضو من فريق العمل كود ${id}`);
    return { success: true };
  };

  // Clients
  const generateNextClientCode = () => {
    const activeClients = clients.filter((c) => !c.isDeleted);
    const count = activeClients.length + 1;
    return `C-${count.toString().padStart(4, "0")}`;
  };

  const addClient = (data: Omit<StoredClient, "id" | "clientCode" | "createdAt" | "documents" | "isDeleted">) => {
    const newClient: StoredClient = {
      ...data,
      id: "cl-" + Math.random().toString(36).substring(2, 9),
      clientCode: generateNextClientCode(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
      documents: [],
    };
    setClients((prev) => [...prev, newClient]);
    logActivity("CREATE", "CLIENT", `تسجيل موكل جديد: ${newClient.name} (${newClient.clientCode})`);
    return newClient;
  };

  const updateClient = (id: string, data: Partial<StoredClient>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    logActivity("UPDATE", "CLIENT", `تعديل بيانات الموكل كود ${id}`);
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c)));
    logActivity("DELETE", "CLIENT", `حذف ملف الموكل كود ${id}`);
  };

  const addClientDocument = (clientId: string, doc: Omit<StoredDocument, "id" | "createdAt">) => {
    const newDoc: StoredDocument = {
      ...doc,
      id: "doc-" + Math.random().toString(36).substring(2, 9),
      clientId,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, documents: [...c.documents, newDoc] } : c))
    );
    logActivity("UPLOAD", "DOCUMENT", `رفع مستند جديد للموكل: ${newDoc.title}`);
  };

  const deleteClientDocument = (clientId: string, docId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, documents: c.documents.filter((d) => d.id !== docId) } : c
      )
    );
  };

  // Cases
  const addCase = (data: any) => {
    const totalFees = parseFloat(data.totalFees) || 0;
    const paidAmount = parseFloat(data.paidAmount) || 0;
    const remainingAmount = Math.max(0, totalFees - paidAmount);

    const newCase: StoredCase = {
      id: "cs-" + Math.random().toString(36).substring(2, 9),
      caseNumber: data.caseNumber,
      caseYear: parseInt(data.caseYear, 10) || new Date().getFullYear(),
      court: data.court,
      circuit: data.circuit || "",
      clientId: data.clientId,
      lawyerId: data.lawyerId || undefined,
      categoryId: data.categoryId,
      statusId: data.statusId,
      subject: data.subject || "",
      opponentName: data.opponentName || "",
      opponentLawyer: data.opponentLawyer || "",
      totalFees,
      paidAmount,
      remainingAmount,
      notes: data.notes || "",
      isDeleted: false,
      createdAt: new Date().toISOString(),
      hearings: [],
      documents: [],
      statusHistory: [],
    };

    // If an initial hearing was provided
    if (data.firstHearingDate) {
      newCase.hearings.push({
        id: "hr-" + Math.random().toString(36).substring(2, 9),
        caseId: newCase.id,
        hearingDate: new Date(data.firstHearingDate).toISOString(),
        decision: data.firstHearingDecision || "أول جلسة لنظر الدعوى",
        createdAt: new Date().toISOString(),
      });
    }

    setCases((prev) => [...prev, newCase]);
    logActivity("CREATE", "CASE", `قيد قضية جديدة رقم: ${newCase.caseNumber} لسنة ${newCase.caseYear}`);
    return newCase;
  };

  const updateCase = (id: string, data: Partial<StoredCase>) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...data };
          if (data.totalFees !== undefined || data.paidAmount !== undefined) {
            updated.remainingAmount = Math.max(0, updated.totalFees - updated.paidAmount);
          }
          return updated;
        }
        return c;
      })
    );
    logActivity("UPDATE", "CASE", `تعديل بيانات القضية كود ${id}`);
  };

  const deleteCase = (id: string) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c)));
    logActivity("DELETE", "CASE", `حذف ملف القضية كود ${id}`);
  };

  const changeCaseStatus = (caseId: string, newStatusId: string, notes?: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const oldStatusObj = statuses.find((s) => s.id === targetCase.statusId);
    const newStatusObj = statuses.find((s) => s.id === newStatusId);

    const historyEntry: StoredCaseStatusHistory = {
      id: "sh-" + Math.random().toString(36).substring(2, 9),
      caseId,
      fromStatus: oldStatusObj?.name || "بداية القيد",
      toStatus: newStatusObj?.name || "مرحلة جديدة",
      changeDate: new Date().toISOString(),
      changedBy: currentUser?.name || "المستشار المناوب",
      notes: notes || "",
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              statusId: newStatusId,
              statusHistory: [historyEntry, ...c.statusHistory],
            }
          : c
      )
    );
    logActivity("UPDATE", "CASE_STATUS", `تغيير حالة القضية إلى: ${newStatusObj?.name}`);
  };

  const addCaseHearing = (caseId: string, hearing: Omit<StoredHearing, "id" | "caseId" | "createdAt">) => {
    const newHearing: StoredHearing = {
      ...hearing,
      id: "hr-" + Math.random().toString(36).substring(2, 9),
      caseId,
      createdAt: new Date().toISOString(),
    };
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, hearings: [newHearing, ...c.hearings] } : c
      )
    );
    logActivity("CREATE", "HEARING", `تسجيل جلسة محكمة جديدة بتاريخ ${hearing.hearingDate}`);
  };

  const deleteCaseHearing = (caseId: string, hearingId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, hearings: c.hearings.filter((h) => h.id !== hearingId) } : c
      )
    );
  };

  const addCaseDocument = (caseId: string, doc: Omit<StoredDocument, "id" | "createdAt">) => {
    const newDoc: StoredDocument = {
      ...doc,
      id: "doc-" + Math.random().toString(36).substring(2, 9),
      caseId,
      createdAt: new Date().toISOString(),
    };
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, documents: [...c.documents, newDoc] } : c
      )
    );
    logActivity("UPLOAD", "DOCUMENT", `رفع أوراق ومستندات جديدة للقضية: ${newDoc.title}`);
  };

  const deleteCaseDocument = (caseId: string, docId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, documents: c.documents.filter((d) => d.id !== docId) } : c
      )
    );
  };

  // Consultations
  const addConsultation = (data: any) => {
    const amount = parseFloat(data.amountPaid) || 0;
    const paymentMethod = data.paymentMethod || "CASH";

    const newCon: StoredConsultation = {
      id: "con-" + Math.random().toString(36).substring(2, 9),
      personName: data.personName,
      phone: data.phone,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      lawyerId: data.lawyerId || undefined,
      subject: data.subject,
      amountPaid: amount,
      paymentMethod,
      transferProofPath: data.transferProofPath || undefined,
      notes: data.notes || "",
      isConvertedToCase: false,
      createdAt: new Date().toISOString(),
    };

    // Deposit consultation fee into target treasury
    const targetTreasury = treasuries.find((t) => t.paymentMethod === paymentMethod);
    if (targetTreasury && amount > 0) {
      const prevBal = targetTreasury.balance;
      const newBal = prevBal + amount;
      setTreasuries((prev) =>
        prev.map((t) => (t.id === targetTreasury.id ? { ...t, balance: newBal } : t))
      );
      setTreasuryTransactions((prev) => [
        {
          id: "tx-" + Math.random().toString(36).substring(2, 9),
          treasuryId: targetTreasury.id,
          type: "DEPOSIT",
          amount,
          previousBalance: prevBal,
          newBalance: newBal,
          description: `إيداع رسوم استشارة قانونية: ${newCon.personName}`,
          recordedBy: currentUser?.name || "المحصل",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setConsultations((prev) => [newCon, ...prev]);
    logActivity("CREATE", "CONSULTATION", `حجز استشارة قانونية للأستاذ/ة: ${newCon.personName}`);
    return newCon;
  };

  const convertConsultationToCase = (consultationId: string, caseData: any) => {
    const consultation = consultations.find((c) => c.id === consultationId);
    if (!consultation) throw new Error("الاستشارة غير موجودة");

    let clientId = caseData.clientId;
    if (!clientId) {
      // Create new client
      const newClient = addClient({
        name: consultation.personName,
        phone: consultation.phone,
        address: caseData.clientAddress || "",
        nationalId: caseData.clientNationalId || "",
        notes: `تم فتح الملف عبر تحويل استشارة قانونية سابقة (${consultation.subject})`,
      });
      clientId = newClient.id;
    }

    // Open new case (CORE RULE: Consultation fee is NEVER deducted from case fees!)
    const openedCase = addCase({
      ...caseData,
      clientId,
      subject: caseData.subject || consultation.subject,
    });

    // Mark consultation as converted
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              isConvertedToCase: true,
              convertedCaseId: openedCase.id,
              clientId,
            }
          : c
      )
    );

    logActivity(
      "CONVERT",
      "CONSULTATION",
      `تحويل استشارة ${consultation.personName} إلى قضية برقم ${openedCase.caseNumber}`
    );
    return openedCase;
  };

  // Payments
  const addPayment = (data: any) => {
    const amount = parseFloat(data.amount) || 0;
    const paymentMethod = data.paymentMethod || "CASH";

    // Auto-generate receipt number
    const nextReceiptNum = `REC-${(payments.length + 1).toString().padStart(4, "0")}`;

    const targetTreasury =
      treasuries.find((t) => t.id === data.treasuryId) ||
      treasuries.find((t) => t.paymentMethod === paymentMethod) ||
      treasuries[0];

    const newPayment: StoredPayment = {
      id: "pay-" + Math.random().toString(36).substring(2, 9),
      receiptNumber: nextReceiptNum,
      amount,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString(),
      paymentMethod,
      treasuryId: targetTreasury.id,
      transferProofPath: data.transferProofPath || undefined,
      purpose: data.purpose || "سداد أتعاب ومصروفات قضائية",
      notes: data.notes || "",
      recordedByName: currentUser?.name || "مسؤول الخزينة",
      caseId: data.caseId || undefined,
      clientId: data.clientId || undefined,
      consultationId: data.consultationId || undefined,
      createdAt: new Date().toISOString(),
    };

    // Update case paid amount & remaining
    if (data.caseId) {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === data.caseId) {
            const newPaid = c.paidAmount + amount;
            const newRem = Math.max(0, c.totalFees - newPaid);
            return { ...c, paidAmount: newPaid, remainingAmount: newRem };
          }
          return c;
        })
      );
    }

    // Update treasury balance
    if (amount > 0 && targetTreasury) {
      const prevBal = targetTreasury.balance;
      const newBal = prevBal + amount;
      setTreasuries((prev) =>
        prev.map((t) => (t.id === targetTreasury.id ? { ...t, balance: newBal } : t))
      );
      setTreasuryTransactions((prev) => [
        {
          id: "tx-" + Math.random().toString(36).substring(2, 9),
          treasuryId: targetTreasury.id,
          type: "DEPOSIT",
          amount,
          previousBalance: prevBal,
          newBalance: newBal,
          relatedPaymentId: newPayment.id,
          description: `إيداع إيصال سداد ${newPayment.receiptNumber} - ${newPayment.purpose}`,
          recordedBy: currentUser?.name || "المحصل",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setPayments((prev) => [newPayment, ...prev]);
    logActivity("CREATE", "PAYMENT", `تسجيل إيصال سداد ${newPayment.receiptNumber} بمبلغ ${amount} ج.م`);
    return newPayment;
  };

  const deletePayment = (id: string) => {
    const pay = payments.find((p) => p.id === id);
    if (!pay) return;

    // Deduct from case paid amount if linked
    if (pay.caseId) {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === pay.caseId) {
            const newPaid = Math.max(0, c.paidAmount - pay.amount);
            const newRem = Math.max(0, c.totalFees - newPaid);
            return { ...c, paidAmount: newPaid, remainingAmount: newRem };
          }
          return c;
        })
      );
    }

    // Deduct from treasury
    if (pay.treasuryId) {
      setTreasuries((prev) =>
        prev.map((t) =>
          t.id === pay.treasuryId ? { ...t, balance: Math.max(0, t.balance - pay.amount) } : t
        )
      );
    }

    setPayments((prev) => prev.filter((p) => p.id !== id));
    logActivity("DELETE", "PAYMENT", `إلغاء وحذف إيصال السداد ${pay.receiptNumber}`);
  };

  const addTreasuryTransaction = (
    treasuryId: string,
    type: "DEPOSIT" | "WITHDRAWAL",
    amount: number,
    description: string
  ) => {
    const target = treasuries.find((t) => t.id === treasuryId);
    if (!target) return;

    const prevBal = target.balance;
    const newBal = type === "DEPOSIT" ? prevBal + amount : Math.max(0, prevBal - amount);

    setTreasuries((prev) =>
      prev.map((t) => (t.id === treasuryId ? { ...t, balance: newBal } : t))
    );

    setTreasuryTransactions((prev) => [
      {
        id: "tx-" + Math.random().toString(36).substring(2, 9),
        treasuryId,
        type,
        amount,
        previousBalance: prevBal,
        newBalance: newBal,
        description,
        recordedBy: currentUser?.name || "مسؤول الخزينة",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    logActivity("TREASURY", type, `${description} بمبلغ ${amount} ج.م`);
  };

  const transferBetweenTreasuries = (
    fromId: string,
    toId: string,
    amount: number,
    notes?: string
  ) => {
    const fromSafe = treasuries.find((t) => t.id === fromId);
    const toSafe = treasuries.find((t) => t.id === toId);

    if (!fromSafe || !toSafe) return { success: false, error: "الخزينة المحددة غير موجودة" };
    if (fromSafe.balance < amount) {
      return {
        success: false,
        error: `الرصيد في (${fromSafe.name}) لا يكفي للتحويل. الرصيد الحالي: ${fromSafe.balance} ج.م`,
      };
    }

    const fromPrev = fromSafe.balance;
    const fromNew = fromPrev - amount;
    const toPrev = toSafe.balance;
    const toNew = toPrev + amount;

    setTreasuries((prev) =>
      prev.map((t) => {
        if (t.id === fromId) return { ...t, balance: fromNew };
        if (t.id === toId) return { ...t, balance: toNew };
        return t;
      })
    );

    const txDate = new Date().toISOString();
    setTreasuryTransactions((prev) => [
      {
        id: "tx-" + Math.random().toString(36).substring(2, 9),
        treasuryId: fromId,
        type: "TRANSFER_OUT",
        amount,
        previousBalance: fromPrev,
        newBalance: fromNew,
        relatedTreasuryId: toId,
        description: `تحويل صادر إلى (${toSafe.name}) ${notes ? "- " + notes : ""}`,
        recordedBy: currentUser?.name || "مسؤول الخزينة",
        createdAt: txDate,
      },
      {
        id: "tx-" + Math.random().toString(36).substring(2, 9),
        treasuryId: toId,
        type: "TRANSFER_IN",
        amount,
        previousBalance: toPrev,
        newBalance: toNew,
        relatedTreasuryId: fromId,
        description: `تحويل وارد من (${fromSafe.name}) ${notes ? "- " + notes : ""}`,
        recordedBy: currentUser?.name || "مسؤول الخزينة",
        createdAt: txDate,
      },
      ...prev,
    ]);

    logActivity(
      "TRANSFER",
      "TREASURY",
      `تحويل مبلغ ${amount} ج.م من ${fromSafe.name} إلى ${toSafe.name}`
    );
    return { success: true };
  };

  // Categories & Statuses
  const addCategory = (data: Omit<StoredCategory, "id">) => {
    const newCat: StoredCategory = {
      ...data,
      id: "cat-" + Math.random().toString(36).substring(2, 9),
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, data: Partial<StoredCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCategory = (id: string) => {
    const count = cases.filter((c) => c.categoryId === id).length;
    if (count > 0) return { success: false, error: "لا يمكن حذف تصنيف به قضايا مسجلة" };
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  const addStatus = (data: Omit<StoredStatus, "id">) => {
    const newStatus: StoredStatus = {
      ...data,
      id: "st-" + Math.random().toString(36).substring(2, 9),
    };
    setStatuses((prev) => [...prev, newStatus]);
    return newStatus;
  };

  const updateStatus = (id: string, data: Partial<StoredStatus>) => {
    setStatuses((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteStatus = (id: string) => {
    const count = cases.filter((c) => c.statusId === id).length;
    if (count > 0) return { success: false, error: "لا يمكن حذف مرحلة قضائية بها قضايا حالية" };
    setStatuses((prev) => prev.filter((s) => s.id !== id));
    return { success: true };
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(INITIAL_DATA.settings);
    setStaff(INITIAL_DATA.staff);
    setClients(INITIAL_DATA.clients);
    setCases(INITIAL_DATA.cases);
    setConsultations(INITIAL_DATA.consultations);
    setPayments(INITIAL_DATA.payments);
    setTreasuries(INITIAL_DATA.treasuries);
    setTreasuryTransactions(INITIAL_DATA.treasuryTransactions);
    setCategories(INITIAL_DATA.categories);
    setStatuses(INITIAL_DATA.statuses);
    setActivities(INITIAL_DATA.activities);
    setCurrentUser(INITIAL_DATA.users[0]);
    localStorage.setItem("law_office_user_v2", JSON.stringify(INITIAL_DATA.users[0]));
    alert("تمت إعادة ضبط البيانات الافتراضية بنجاح!");
  };

  return (
    <AppContext.Provider
      value={{
        isLoaded,
        currentUser,
        login,
        logout,
        settings,
        updateSettings,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        clients,
        generateNextClientCode,
        addClient,
        updateClient,
        deleteClient,
        addClientDocument,
        deleteClientDocument,
        cases,
        addCase,
        updateCase,
        deleteCase,
        changeCaseStatus,
        addCaseHearing,
        deleteCaseHearing,
        addCaseDocument,
        deleteCaseDocument,
        consultations,
        addConsultation,
        convertConsultationToCase,
        payments,
        treasuries,
        treasuryTransactions,
        addPayment,
        deletePayment,
        addTreasuryTransaction,
        transferBetweenTreasuries,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        statuses,
        addStatus,
        updateStatus,
        deleteStatus,
        activities,
        logActivity,
        resetToDefaultData,
        isMobileMenuOpen,
        setMobileMenuOpen,
        toggleMobileMenu,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

