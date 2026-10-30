"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getTreasuries() {
  await requireAuth();

  const treasuries = await prisma.treasury.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: {
          transactions: true,
          payments: true,
        },
      },
    },
  });

  return treasuries;
}

export async function getTreasuryDetails(id: string) {
  await requireAuth();

  const treasury = await prisma.treasury.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 100,
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 50,
        include: {
          client: true,
          case: true,
        },
      },
    },
  });

  return treasury;
}

export async function addTreasuryTransaction({
  treasuryId,
  type,
  amount,
  description,
}: {
  treasuryId: string;
  type: "DEPOSIT" | "WITHDRAW";
  amount: number;
  description: string;
}) {
  const user = await requireAdmin();

  if (amount <= 0) {
    return { success: false, error: "المبلغ يجب أن يكون أكبر من الصفر" };
  }

  const treasury = await prisma.treasury.findUnique({
    where: { id: treasuryId },
  });

  if (!treasury) {
    return { success: false, error: "الخزينة غير موجودة" };
  }

  if (type === "WITHDRAW" && treasury.balance < amount) {
    return {
      success: false,
      error: `رصيد الخزينة الحالي (${treasury.balance} ج.م) لا يكفي لسحب مبلغ ${amount} ج.م`,
    };
  }

  const newBalance =
    type === "DEPOSIT" ? treasury.balance + amount : treasury.balance - amount;

  const [transaction] = await prisma.$transaction([
    prisma.treasuryTransaction.create({
      data: {
        treasuryId,
        type,
        amount,
        balanceAfter: newBalance,
        description,
        recordedBy: user.name,
      },
    }),
    prisma.treasury.update({
      where: { id: treasuryId },
      data: { balance: newBalance },
    }),
  ]);

  await logActivity({
    action: type === "DEPOSIT" ? "TREASURY_DEPOSIT" : "TREASURY_WITHDRAW",
    entityType: "TREASURY",
    entityId: treasuryId,
    details: `${type === "DEPOSIT" ? "إيداع" : "سحب"} مبلغ ${amount} ج.م في [${treasury.name}] بواسطة ${user.name}`,
  });

  revalidatePath("/treasury");
  return { success: true, data: transaction };
}

export async function transferBetweenTreasuries({
  fromTreasuryId,
  toTreasuryId,
  amount,
  notes,
}: {
  fromTreasuryId: string;
  toTreasuryId: string;
  amount: number;
  notes?: string;
}) {
  const user = await requireAdmin();

  if (fromTreasuryId === toTreasuryId) {
    return { success: false, error: "لا يمكن التحويل لنفس الخزينة" };
  }

  if (amount <= 0) {
    return { success: false, error: "المبلغ يجب أن يكون أكبر من الصفر" };
  }

  const [fromT, toT] = await Promise.all([
    prisma.treasury.findUnique({ where: { id: fromTreasuryId } }),
    prisma.treasury.findUnique({ where: { id: toTreasuryId } }),
  ]);

  if (!fromT || !toT) {
    return { success: false, error: "إحدى الخزائن المحددة غير موجودة" };
  }

  if (fromT.balance < amount) {
    return {
      success: false,
      error: `رصيد ${fromT.name} (${fromT.balance} ج.م) غير كافٍ للتحويل`,
    };
  }

  const fromNewBalance = fromT.balance - amount;
  const toNewBalance = toT.balance + amount;

  await prisma.$transaction([
    // Deduct from source treasury
    prisma.treasury.update({
      where: { id: fromTreasuryId },
      data: { balance: fromNewBalance },
    }),
    prisma.treasuryTransaction.create({
      data: {
        treasuryId: fromTreasuryId,
        type: "TRANSFER",
        amount,
        balanceAfter: fromNewBalance,
        description: `تحويل صادر إلى ${toT.name}: ${notes || ""}`,
        recordedBy: user.name,
      },
    }),

    // Add to destination treasury
    prisma.treasury.update({
      where: { id: toTreasuryId },
      data: { balance: toNewBalance },
    }),
    prisma.treasuryTransaction.create({
      data: {
        treasuryId: toTreasuryId,
        type: "TRANSFER",
        amount,
        balanceAfter: toNewBalance,
        description: `تحويل وارد من ${fromT.name}: ${notes || ""}`,
        recordedBy: user.name,
      },
    }),
  ]);

  await logActivity({
    action: "TREASURY_TRANSFER",
    entityType: "TREASURY",
    details: `تحويل مبلغ ${amount} ج.م من [${fromT.name}] إلى [${toT.name}] بواسطة ${user.name}`,
  });

  revalidatePath("/treasury");
  return { success: true };
}

