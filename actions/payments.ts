"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { paymentSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function generateReceiptNumber(): Promise<string> {
  const lastPayment = await prisma.payment.findFirst({
    orderBy: { createdAt: "desc" },
    select: { receiptNumber: true },
  });

  if (!lastPayment || !lastPayment.receiptNumber) {
    return "REC-0001";
  }

  const match = lastPayment.receiptNumber.match(/\d+/);
  if (!match) {
    return "REC-0001";
  }

  const nextNum = parseInt(match[0], 10) + 1;
  return `REC-${nextNum.toString().padStart(4, "0")}`;
}

export async function getPayments(params?: {
  caseId?: string;
  clientId?: string;
  consultationId?: string;
  treasuryId?: string;
  page?: number;
  limit?: number;
}) {
  await requireAuth();

  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params?.caseId) where.caseId = params.caseId;
  if (params?.clientId) where.clientId = params.clientId;
  if (params?.consultationId) where.consultationId = params.consultationId;
  if (params?.treasuryId) where.treasuryId = params.treasuryId;

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      skip,
      take: limit,
      include: {
        treasury: true,
        case: {
          select: {
            id: true,
            caseNumber: true,
            caseYear: true,
            court: true,
          },
        },
        client: {
          select: {
            id: true,
            clientCode: true,
            name: true,
          },
        },
        consultation: {
          select: {
            id: true,
            subject: true,
            personName: true,
          },
        },
      },
    }),
  ]);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createPaymentWithReceipt(formData: FormData) {
  const user = await requireAuth();

  const amount = parseFloat(formData.get("amount") as string) || 0;
  const paymentDate = (formData.get("paymentDate") as string) || new Date().toISOString().slice(0, 10);
  const paymentMethod = (formData.get("paymentMethod") as string) || "CASH";
  const purpose = (formData.get("purpose") as string) || "سداد دفعة أتعاب";
  const notes = (formData.get("notes") as string) || "";
  const caseId = (formData.get("caseId") as string) || null;
  const clientId = (formData.get("clientId") as string) || null;
  const consultationId = (formData.get("consultationId") as string) || null;
  const imageFile = formData.get("transferImage") as File | null;

  if (amount <= 0) {
    return { success: false, error: "مبلغ الدفعة يجب أن يكون أكبر من الصفر" };
  }

  let transferProofPath: string | null = null;

  // If method is not cash, image upload is strictly required!
  if (paymentMethod !== "CASH") {
    if (!imageFile || imageFile.size === 0) {
      return {
        success: false,
        error: "إدراج صورة إشعار التحويل (إنستاباي / محفظة) إلزامي ولا يمكن حفظ العملية بدونه",
      };
    }

    // Validate size and mime type
    if (imageFile.size > 25 * 1024 * 1024) {
      return { success: false, error: "حجم صورة التحويل يجب ألا يتجاوز 25 ميجابايت" };
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const saved = await saveUploadedFile({
      buffer,
      originalName: imageFile.name,
      mimeType: imageFile.type,
    });
    transferProofPath = saved.filePath;

    // Save as Document in DB
    await prisma.document.create({
      data: {
        title: `إشعار تحويل ${paymentMethod === "INSTAPAY" ? "إنستاباي" : "محفظة"} - ${amount} ج.م`,
        fileName: saved.fileName,
        originalName: imageFile.name,
        filePath: saved.filePath,
        fileSize: saved.fileSize,
        mimeType: saved.mimeType,
        category: "PAYMENT_PROOF",
        caseId: caseId || null,
        clientId: clientId || null,
        uploadedBy: user.name,
      },
    });
  }

  const receiptNumber = await generateReceiptNumber();

  // Find corresponding treasury
  const treasury = await prisma.treasury.findUnique({
    where: { paymentMethod },
  });

  // Calculate new treasury balance
  const treasuryNewBalance = (treasury?.balance || 0) + amount;

  // Create payment and update treasury in a single transaction
  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        receiptNumber,
        amount,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        transferProofPath,
        purpose,
        notes: notes || null,
        recordedByName: user.name,
        recordedById: user.id,
        caseId,
        clientId,
        consultationId,
        treasuryId: treasury?.id || null,
      },
    });

    // Update case paid and remaining
    if (caseId) {
      const c = await tx.case.findUnique({
        where: { id: caseId },
        select: { totalFees: true, paidAmount: true },
      });
      if (c) {
        const newPaid = c.paidAmount + amount;
        const newRemaining = Math.max(0, c.totalFees - newPaid);
        await tx.case.update({
          where: { id: caseId },
          data: { paidAmount: newPaid, remainingAmount: newRemaining },
        });
      }
    }

    // Update Treasury & record transaction
    if (treasury) {
      await tx.treasury.update({
        where: { id: treasury.id },
        data: { balance: treasuryNewBalance },
      });

      await tx.treasuryTransaction.create({
        data: {
          treasuryId: treasury.id,
          type: "DEPOSIT",
          amount,
          balanceAfter: treasuryNewBalance,
          description: `تحصيل إيصال سداد رقم ${receiptNumber} (${purpose})`,
          paymentId: p.id,
          recordedBy: user.name,
        },
      });
    }

    return p;
  });

  await logActivity({
    action: "CREATE",
    entityType: "PAYMENT",
    entityId: payment.id,
    details: `تحرير إيصال سداد رقم ${receiptNumber} بمبلغ ${amount} ج.م في [${treasury?.name || paymentMethod}] بواسطة ${user.name}`,
  });

  if (caseId) revalidatePath(`/cases/${caseId}`);
  if (clientId) revalidatePath(`/clients/${clientId}`);
  revalidatePath("/payments");
  revalidatePath("/treasury");

  return { success: true, data: payment };
}

export async function deletePayment(id: string) {
  const user = await requireAdmin();

  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    return { success: false, error: "الإيصال غير موجود" };
  }

  await prisma.$transaction(async (tx) => {
    // Revert case fees
    if (payment.caseId) {
      const c = await tx.case.findUnique({
        where: { id: payment.caseId },
        select: { totalFees: true, paidAmount: true },
      });
      if (c) {
        const newPaid = Math.max(0, c.paidAmount - payment.amount);
        const newRemaining = Math.max(0, c.totalFees - newPaid);
        await tx.case.update({
          where: { id: payment.caseId },
          data: { paidAmount: newPaid, remainingAmount: newRemaining },
        });
      }
    }

    // Revert Treasury balance
    if (payment.treasuryId) {
      const t = await tx.treasury.findUnique({ where: { id: payment.treasuryId } });
      if (t) {
        const newBal = Math.max(0, t.balance - payment.amount);
        await tx.treasury.update({
          where: { id: t.id },
          data: { balance: newBal },
        });

        await tx.treasuryTransaction.create({
          data: {
            treasuryId: t.id,
            type: "WITHDRAW",
            amount: payment.amount,
            balanceAfter: newBal,
            description: `إلغاء وحذف إيصال سداد ${payment.receiptNumber}`,
            recordedBy: user.name,
          },
        });
      }
    }

    // Delete payment record
    await tx.payment.delete({ where: { id } });
  });

  // Delete physical transfer proof file if exists
  if (payment.transferProofPath) {
    await deleteUploadedFile(payment.transferProofPath);
  }

  await logActivity({
    action: "DELETE",
    entityType: "PAYMENT",
    entityId: id,
    details: `إلغاء وحذف إيصال سداد ${payment.receiptNumber} بمبلغ ${payment.amount} ج.م بواسطة ${user.name}`,
  });

  if (payment.caseId) revalidatePath(`/cases/${payment.caseId}`);
  if (payment.clientId) revalidatePath(`/clients/${payment.clientId}`);
  revalidatePath("/payments");
  revalidatePath("/treasury");

  return { success: true };
}
