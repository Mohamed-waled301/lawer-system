"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { saveUploadedFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { generateClientCode } from "./clients";
import { generateReceiptNumber } from "./payments";

export async function getConsultations(params?: {
  query?: string;
  lawyerId?: string;
  page?: number;
  limit?: number;
}) {
  await requireAuth();

  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.lawyerId && params.lawyerId !== "ALL") {
    where.lawyerId = params.lawyerId;
  }

  if (params?.query && params.query.trim()) {
    const q = params.query.trim();
    where.OR = [
      { personName: { contains: q } },
      { phone: { contains: q } },
      { subject: { contains: q } },
    ];
  }

  const [total, consultations] = await Promise.all([
    prisma.consultation.count({ where }),
    prisma.consultation.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      include: {
        lawyer: true,
        client: true,
      },
    }),
  ]);

  return {
    consultations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createConsultationWithProof(formData: FormData) {
  const user = await requireAuth();

  const personName = (formData.get("personName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const date = (formData.get("date") as string) || new Date().toISOString().slice(0, 10);
  const subject = (formData.get("subject") as string)?.trim();
  const amountPaid = parseFloat(formData.get("amountPaid") as string) || 0;
  const paymentMethod = (formData.get("paymentMethod") as string) || "CASH";
  const lawyerId = (formData.get("lawyerId") as string) || null;
  const clientId = (formData.get("clientId") as string) || null;
  const notes = (formData.get("notes") as string) || "";
  const imageFile = formData.get("transferImage") as File | null;

  if (!personName || personName.length < 2) {
    return { success: false, error: "اسم الشخص مطلوب ويجب ألا يقل عن حرفين" };
  }
  if (!phone || phone.length < 8) {
    return { success: false, error: "رقم الهاتف غير صحيح" };
  }
  if (!subject) {
    return { success: false, error: "موضوع الاستشارة مطلوب" };
  }

  let transferProofPath: string | null = null;

  // Enforce image proof if payment method is not cash
  if (amountPaid > 0 && paymentMethod !== "CASH") {
    if (!imageFile || imageFile.size === 0) {
      return {
        success: false,
        error: "إدراج صورة إشعار التحويل الإلكتروني إلزامي عند السداد بالمحفظة أو إنستاباي",
      };
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const saved = await saveUploadedFile({
      buffer,
      originalName: imageFile.name,
      mimeType: imageFile.type,
    });
    transferProofPath = saved.filePath;
  }

  // Find treasury
  const treasury = await prisma.treasury.findUnique({
    where: { paymentMethod },
  });

  const receiptNumber = await generateReceiptNumber();

  // Create consultation and payment and update treasury
  const consultation = await prisma.$transaction(async (tx) => {
    const cons = await tx.consultation.create({
      data: {
        personName,
        phone,
        date: new Date(date),
        subject,
        amountPaid,
        paymentMethod,
        transferProofPath,
        lawyerId,
        clientId,
        notes: notes || null,
      },
      include: {
        lawyer: true,
      },
    });

    if (amountPaid > 0) {
      const p = await tx.payment.create({
        data: {
          receiptNumber,
          amount: amountPaid,
          paymentDate: new Date(date),
          paymentMethod,
          transferProofPath,
          purpose: `رسوم استشارة قانونية: ${subject.substring(0, 50)}`,
          recordedByName: user.name,
          recordedById: user.id,
          consultationId: cons.id,
          clientId,
          treasuryId: treasury?.id || null,
        },
      });

      if (treasury) {
        const newBal = treasury.balance + amountPaid;
        await tx.treasury.update({
          where: { id: treasury.id },
          data: { balance: newBal },
        });

        await tx.treasuryTransaction.create({
          data: {
            treasuryId: treasury.id,
            type: "DEPOSIT",
            amount: amountPaid,
            balanceAfter: newBal,
            description: `رسوم استشارة قانونية (REC: ${receiptNumber}) - ${personName}`,
            paymentId: p.id,
            recordedBy: user.name,
          },
        });
      }
    }

    return cons;
  });

  await logActivity({
    action: "CREATE",
    entityType: "CONSULTATION",
    entityId: consultation.id,
    details: `تسجيل استشارة للأستاذ/ة ${personName} بمبلغ ${amountPaid} ج.م في [${treasury?.name || paymentMethod}] بواسطة ${user.name}`,
  });

  revalidatePath("/consultations");
  revalidatePath("/payments");
  revalidatePath("/treasury");

  return { success: true, data: consultation };
}

export async function convertConsultationToCase({
  consultationId,
  caseNumber,
  caseYear,
  court,
  circuit,
  categoryId,
  statusId,
  totalFees,
  paidAmount = 0,
  nextHearingDate,
  notes,
}: {
  consultationId: string;
  caseNumber: string;
  caseYear: number;
  court: string;
  circuit?: string;
  categoryId: string;
  statusId: string;
  totalFees: number;
  paidAmount?: number;
  nextHearingDate?: string;
  notes?: string;
}) {
  const user = await requireAuth();

  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });

  if (!consultation) {
    return { success: false, error: "الاستشارة غير موجودة" };
  }

  if (consultation.isConvertedToCase) {
    return { success: false, error: "تم تحويل هذه الاستشارة إلى قضية مسبقاً" };
  }

  let clientId = consultation.clientId;

  // 1. If not an existing client, create client
  if (!clientId) {
    const clientCode = await generateClientCode();
    const newClient = await prisma.client.create({
      data: {
        clientCode,
        name: consultation.personName,
        phone: consultation.phone,
        notes: `تم إنشاء الموكل تلقائياً بتحويل الاستشارة: "${consultation.subject}"`,
      },
    });
    clientId = newClient.id;

    await prisma.consultation.update({
      where: { id: consultationId },
      data: { clientId },
    });
  }

  // 2. Create the case (Note: consultation fee is NEVER deducted from totalFees)
  const remaining = Math.max(0, totalFees - (paidAmount || 0));

  const status = await prisma.caseStatus.findUnique({
    where: { id: statusId },
  });

  const newCase = await prisma.case.create({
    data: {
      caseNumber,
      caseYear,
      court,
      circuit: circuit || null,
      clientId,
      lawyerId: consultation.lawyerId || null,
      categoryId,
      statusId,
      totalFees,
      paidAmount: paidAmount || 0,
      remainingAmount: remaining,
      nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
      notes: notes
        ? `${notes}\n(محولة من استشارة سابقة: ${consultation.subject})`
        : `محولة من استشارة سابقة: ${consultation.subject}`,
    },
  });

  // 3. Mark consultation converted
  await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      isConvertedToCase: true,
      convertedCaseId: newCase.id,
    },
  });

  // 4. Initial status history
  if (status) {
    await prisma.caseStatusHistory.create({
      data: {
        caseId: newCase.id,
        fromStatus: "تحويل من استشارة",
        toStatus: status.name,
        changedBy: user.name,
        notes: `تم فتح القضية بناءً على استشارة سابقة بتاريخ ${consultation.date.toLocaleDateString("ar-EG")}`,
      },
    });
  }

  // 5. If initial payment provided for the case, deposit into Cash safe
  if (paidAmount && paidAmount > 0) {
    const receiptNumber = await generateReceiptNumber();
    const cashTreasury = await prisma.treasury.findUnique({
      where: { paymentMethod: "CASH" },
    });

    await prisma.payment.create({
      data: {
        receiptNumber,
        amount: paidAmount,
        paymentDate: new Date(),
        paymentMethod: "CASH",
        purpose: `مقدم أتعاب القضية المحولة رقم ${newCase.caseNumber} لسنة ${newCase.caseYear}`,
        recordedByName: user.name,
        recordedById: user.id,
        caseId: newCase.id,
        clientId,
        treasuryId: cashTreasury?.id || null,
      },
    });

    if (cashTreasury) {
      const newBal = cashTreasury.balance + paidAmount;
      await prisma.treasury.update({
        where: { id: cashTreasury.id },
        data: { balance: newBal },
      });

      await prisma.treasuryTransaction.create({
        data: {
          treasuryId: cashTreasury.id,
          type: "DEPOSIT",
          amount: paidAmount,
          balanceAfter: newBal,
          description: `مقدم أتعاب القضية رقم ${newCase.caseNumber}/${newCase.caseYear} (${receiptNumber})`,
          recordedBy: user.name,
        },
      });
    }
  }

  await logActivity({
    action: "CONVERT_CONSULTATION",
    entityType: "CONSULTATION",
    entityId: consultationId,
    details: `تحويل استشارة ${consultation.personName} إلى قضية رقم ${newCase.caseNumber}/${newCase.caseYear} بواسطة ${user.name}`,
  });

  revalidatePath("/consultations");
  revalidatePath("/cases");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/treasury");

  return { success: true, caseId: newCase.id, clientId };
}
