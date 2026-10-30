import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/actions/settings";
import { ReceiptPrint } from "@/components/print/ReceiptPrint";
import { ConsultationPrint } from "@/components/print/ConsultationPrint";
import { ClientFilePrint } from "@/components/print/ClientFilePrint";
import { CaseReportPrint } from "@/components/print/CaseReportPrint";
import { PrintToolbar } from "./PrintToolbar";

export const dynamic = "force-dynamic";

export default async function PrintPage({
  params,
}: {
  params: { type: string; id: string };
}) {
  const { type, id } = params;
  const settings = await getSettingsMap();

  let content = null;

  if (type === "receipt") {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        client: true,
        case: true,
        consultation: true,
      },
    });

    if (!payment) notFound();
    content = <ReceiptPrint receipt={payment as any} settings={settings} />;
  } else if (type === "consultation") {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        lawyer: true,
        client: true,
      },
    });

    if (!consultation) notFound();
    content = (
      <ConsultationPrint consultation={consultation as any} settings={settings} />
    );
  } else if (type === "client") {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          where: { isDeleted: false },
          include: {
            category: true,
            status: true,
            lawyer: true,
          },
        },
        consultations: true,
        payments: true,
      },
    });

    if (!client) notFound();
    content = <ClientFilePrint client={client as any} settings={settings} />;
  } else if (type === "case") {
    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        lawyer: true,
        category: true,
        status: true,
        hearings: {
          orderBy: { hearingDate: "asc" },
        },
        payments: {
          orderBy: { paymentDate: "asc" },
        },
      },
    });

    if (!caseItem) notFound();
    content = <CaseReportPrint caseItem={caseItem as any} settings={settings} />;
  } else {
    notFound();
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

