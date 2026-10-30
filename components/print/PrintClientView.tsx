"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { ReceiptPrint } from "@/components/print/ReceiptPrint";
import { ConsultationPrint } from "@/components/print/ConsultationPrint";
import { ClientFilePrint } from "@/components/print/ClientFilePrint";
import { CaseReportPrint } from "@/components/print/CaseReportPrint";
import { PrintToolbar } from "@/app/print/[type]/[id]/PrintToolbar";

interface PrintClientViewProps {
  type: string;
  id: string;
}

export function PrintClientView({ type, id }: PrintClientViewProps) {
  const {
    settings,
    payments,
    consultations,
    clients,
    cases,
    staff,
    categories,
    statuses,
    isLoaded,
  } = useApp();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="text-slate-500 font-bold text-sm">جاري تجهيز مستند الطباعة...</div>
      </div>
    );
  }

  let content = null;

  if (type === "receipt") {
    const payment = payments.find((p) => p.id === id);
    if (payment) {
      const linkedCase = payment.caseId ? cases.find((c) => c.id === payment.caseId) : null;
      const linkedClient = payment.clientId
        ? clients.find((c) => c.id === payment.clientId)
        : linkedCase
        ? clients.find((c) => c.id === linkedCase.clientId)
        : null;
      const linkedConsultation = payment.consultationId
        ? consultations.find((cn) => cn.id === payment.consultationId)
        : null;

      const formattedReceipt = {
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        purpose: payment.purpose,
        notes: payment.notes,
        recordedByName: payment.recordedByName,
        client: linkedClient
          ? {
              name: linkedClient.name,
              clientCode: linkedClient.clientCode,
              phone: linkedClient.phone,
              nationalId: linkedClient.nationalId,
            }
          : null,
        case: linkedCase
          ? {
              caseNumber: linkedCase.caseNumber,
              caseYear: linkedCase.caseYear,
              court: linkedCase.court,
            }
          : null,
        consultation: linkedConsultation
          ? {
              personName: linkedConsultation.personName,
              subject: linkedConsultation.subject,
            }
          : null,
      };

      content = <ReceiptPrint receipt={formattedReceipt} settings={settings as any} />;
    }
  } else if (type === "consultation") {
    const consultation = consultations.find((c) => c.id === id);
    if (consultation) {
      const lawyer = staff.find((s) => s.id === consultation.lawyerId);
      const formattedConsultation = {
        ...consultation,
        lawyer: lawyer ? { name: lawyer.name, role: lawyer.role } : null,
      };
      content = <ConsultationPrint consultation={formattedConsultation} settings={settings as any} />;
    }
  } else if (type === "client") {
    const client = clients.find((c) => c.id === id);
    if (client) {
      const clientCases = cases
        .filter((c) => c.clientId === client.id && !c.isDeleted)
        .map((c) => {
          const category = categories.find((cat) => cat.id === c.categoryId) || {
            code: "1",
            name: "عام",
          };
          const status = statuses.find((st) => st.id === c.statusId) || {
            name: "متداولة",
            isClosed: false,
          };
          const lawyer = staff.find((s) => s.id === c.lawyerId);

          return {
            ...c,
            category: { name: category.name, code: category.code },
            status: { name: status.name, isClosed: status.isClosed },
            lawyer: lawyer ? { name: lawyer.name } : null,
          };
        });

      const clientConsultations = consultations
        .filter((cn) => cn.clientId === client.id)
        .map((cn) => ({
          id: cn.id,
          date: cn.date,
          subject: cn.subject,
          amountPaid: cn.amountPaid,
        }));

      const clientPayments = payments
        .filter((p) => p.clientId === client.id)
        .map((p) => ({
          receiptNumber: p.receiptNumber,
          paymentDate: p.paymentDate,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          purpose: p.purpose,
        }));

      const formattedClient = {
        ...client,
        cases: clientCases,
        consultations: clientConsultations,
        payments: clientPayments,
      };

      content = <ClientFilePrint client={formattedClient} settings={settings as any} />;
    }
  } else if (type === "case") {
    const c = cases.find((cs) => cs.id === id);
    if (c) {
      const client = clients.find((cl) => cl.id === c.clientId) || {
        id: "",
        name: "موكل غير محدد",
        clientCode: "-",
        phone: "-",
        nationalId: "",
        createdAt: "",
        documents: [],
        isDeleted: false,
      };
      const lawyer = staff.find((s) => s.id === c.lawyerId);
      const category = categories.find((cat) => cat.id === c.categoryId) || {
        code: "1",
        name: "عام",
      };
      const status = statuses.find((st) => st.id === c.statusId) || {
        name: "متداولة",
        isClosed: false,
      };
      const casePayments = payments
        .filter((p) => p.caseId === c.id)
        .map((p) => ({
          id: p.id,
          receiptNumber: p.receiptNumber,
          paymentDate: p.paymentDate,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          purpose: p.purpose,
          recordedByName: p.recordedByName,
        }));

      const formattedCase = {
        caseNumber: c.caseNumber,
        caseYear: c.caseYear,
        court: c.court,
        circuit: c.circuit,
        totalFees: c.totalFees,
        paidAmount: c.paidAmount,
        remainingAmount: c.remainingAmount,
        nextHearingDate: c.nextHearingDate,
        notes: c.notes,
        createdAt: c.createdAt,
        client: {
          name: client.name,
          clientCode: client.clientCode,
          phone: client.phone,
          nationalId: client.nationalId,
        },
        lawyer: lawyer
          ? {
              name: lawyer.name,
              barAssociationNumber: lawyer.barAssociationNumber,
            }
          : null,
        category: {
          code: category.code,
          name: category.name,
        },
        status: {
          name: status.name,
          isClosed: status.isClosed,
        },
        hearings: c.hearings || [],
        payments: casePayments,
      };

      content = <CaseReportPrint caseItem={formattedCase} settings={settings as any} />;
    }
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg border border-slate-300 text-center space-y-4 max-w-md shadow-xs">
          <p className="text-slate-800 font-bold">لم يتم العثور على هذا السجل المطبوع</p>
          <p className="text-xs text-slate-500">
            قد يكون تم حذفه أو أن المعرف المطلوب غير صحيح.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/60 p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Floating Toolbar (hidden in print) */}
      <PrintToolbar />

      {/* Printable Sheet */}
      <div className="bg-white rounded-lg shadow-md border border-slate-300 print:shadow-none print:border-none print:rounded-none">
        {content}
      </div>
    </div>
  );
}

