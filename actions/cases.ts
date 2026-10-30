"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { caseSchema, hearingSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getCases(params?: {
  query?: string;
  categoryId?: string;
  statusId?: string;
  lawyerId?: string;
  clientId?: string;
  isClosed?: boolean;
  page?: number;
  limit?: number;
}) {
  await requireAuth();

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    isDeleted: false,
  };

  if (params?.categoryId && params.categoryId !== "ALL") {
    where.categoryId = params.categoryId;
  }

  if (params?.statusId && params.statusId !== "ALL") {
    where.statusId = params.statusId;
  }

  if (params?.lawyerId && params.lawyerId !== "ALL") {
    where.lawyerId = params.lawyerId;
  }

  if (params?.clientId) {
    where.clientId = params.clientId;
  }

  if (params?.isClosed !== undefined) {
    where.status = {
      isClosed: params.isClosed,
    };
  }

  if (params?.query && params.query.trim()) {
    const q = params.query.trim();
    where.OR = [
      { caseNumber: { contains: q } },
      { court: { contains: q } },
      { circuit: { contains: q } },
      { client: { name: { contains: q } } },
      { client: { clientCode: { contains: q } } },
    ];
  }

  const [total, cases] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      orderBy: [{ nextHearingDate: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        client: {
          select: {
            id: true,
            clientCode: true,
            name: true,
            phone: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        category: true,
        status: true,
        _count: {
          select: {
            hearings: true,
            payments: true,
            documents: true,
          },
        },
      },
    }),
  ]);

  return {
    cases,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCaseDetails(id: string) {
  await requireAuth();

  const caseItem = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
      lawyer: true,
      category: true,
      status: true,
      hearings: {
        orderBy: { hearingDate: "desc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      statusHistory: {
        orderBy: { changeDate: "desc" },
      },
    },
  });

  return caseItem;
}

export async function createCase(rawData: any) {
  const user = await requireAuth();

  const validated = caseSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;
  const remaining = Math.max(0, data.totalFees - (data.paidAmount || 0));

  const status = await prisma.caseStatus.findUnique({
    where: { id: data.statusId },
  });

  const newCase = await prisma.case.create({
    data: {
      caseNumber: data.caseNumber,
      caseYear: data.caseYear,
      court: data.court,
      circuit: data.circuit || null,
      clientId: data.clientId,
      lawyerId: data.lawyerId || null,
      categoryId: data.categoryId,
      statusId: data.statusId,
      totalFees: data.totalFees,
      paidAmount: data.paidAmount || 0,
      remainingAmount: remaining,
      nextHearingDate: data.nextHearingDate ? new Date(data.nextHearingDate) : null,
      notes: data.notes || null,
    },
    include: {
      client: true,
    },
  });

  // Create initial status history entry
  if (status) {
    await prisma.caseStatusHistory.create({
      data: {
        caseId: newCase.id,
        fromStatus: "افتتاح القضية",
        toStatus: status.name,
        changedBy: user.name,
        notes: "إنشاء ملف القضية وتعيين الحالة المبدئية",
      },
    });
  }

  // If initial paidAmount > 0, generate initial payment record
  if (data.paidAmount && data.paidAmount > 0) {
    const lastPayment = await prisma.payment.findFirst({
      orderBy: { createdAt: "desc" },
      select: { receiptNumber: true },
    });
    let nextNum = 1;
    if (lastPayment?.receiptNumber) {
      const match = lastPayment.receiptNumber.match(/\d+/);
      if (match) nextNum = parseInt(match[0], 10) + 1;
    }
    const receiptNumber = `REC-${nextNum.toString().padStart(4, "0")}`;

    await prisma.payment.create({
      data: {
        receiptNumber,
        amount: data.paidAmount,
        paymentDate: new Date(),
        paymentMethod: "CASH",
        purpose: `مقدم أتعاب القضية رقم ${newCase.caseNumber} لسنة ${newCase.caseYear}`,
        recordedByName: user.name,
        recordedById: user.id,
        caseId: newCase.id,
        clientId: newCase.clientId,
      },
    });
  }

  // If nextHearingDate provided, create first hearing entry
  if (data.nextHearingDate) {
    await prisma.hearing.create({
      data: {
        caseId: newCase.id,
        hearingDate: new Date(data.nextHearingDate),
        court: data.court,
        circuit: data.circuit || null,
        decision: "الجلسة الأولى المحددة لنظر الدعوى",
        requirements: "إحضار المستندات وأصل التوكيل",
      },
    });
  }

  await logActivity({
    action: "CREATE",
    entityType: "CASE",
    entityId: newCase.id,
    details: `افتتاح قضية جديدة رقم ${newCase.caseNumber}/${newCase.caseYear} للموكل ${newCase.client.name} بواسطة ${user.name}`,
  });

  revalidatePath("/cases");
  revalidatePath(`/clients/${data.clientId}`);
  return { success: true, data: newCase };
}

export async function updateCase(id: string, rawData: any) {
  const user = await requireAuth();

  const validated = caseSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const currentCase = await prisma.case.findUnique({
    where: { id },
  });

  if (!currentCase) {
    return { success: false, error: "القضية غير موجودة" };
  }

  // Recalculate remaining
  const remaining = Math.max(0, data.totalFees - currentCase.paidAmount);

  const updated = await prisma.case.update({
    where: { id },
    data: {
      caseNumber: data.caseNumber,
      caseYear: data.caseYear,
      court: data.court,
      circuit: data.circuit || null,
      lawyerId: data.lawyerId || null,
      categoryId: data.categoryId,
      totalFees: data.totalFees,
      remainingAmount: remaining,
      nextHearingDate: data.nextHearingDate ? new Date(data.nextHearingDate) : null,
      notes: data.notes || null,
    },
  });

  await logActivity({
    action: "UPDATE",
    entityType: "CASE",
    entityId: id,
    details: `تعديل بيانات القضية رقم ${updated.caseNumber}/${updated.caseYear} بواسطة ${user.name}`,
  });

  revalidatePath("/cases");
  revalidatePath(`/cases/${id}`);
  return { success: true, data: updated };
}

export async function changeCaseStatus({
  caseId,
  newStatusId,
  notes,
}: {
  caseId: string;
  newStatusId: string;
  notes?: string;
}) {
  const user = await requireAuth();

  const currentCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: { status: true },
  });

  if (!currentCase) {
    return { success: false, error: "القضية غير موجودة" };
  }

  const nextStatus = await prisma.caseStatus.findUnique({
    where: { id: newStatusId },
  });

  if (!nextStatus) {
    return { success: false, error: "الحالة الجديدة غير صحيحة" };
  }

  if (currentCase.statusId === newStatusId) {
    return { success: false, error: "القضية موجودة بالفعل في هذه الحالة" };
  }

  const fromStatusName = currentCase.status.name;

  await prisma.$transaction([
    prisma.case.update({
      where: { id: caseId },
      data: { statusId: newStatusId },
    }),
    prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: fromStatusName,
        toStatus: nextStatus.name,
        changedBy: user.name,
        notes: notes || null,
      },
    }),
  ]);

  await logActivity({
    action: "STATUS_CHANGE",
    entityType: "CASE",
    entityId: caseId,
    details: `تغيير حالة القضية رقم ${currentCase.caseNumber} من [${fromStatusName}] إلى [${nextStatus.name}] بواسطة ${user.name}`,
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  return { success: true };
}

export async function addCaseHearing(rawData: any) {
  const user = await requireAuth();

  const validated = hearingSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;
  const hearingDate = new Date(data.hearingDate);

  const hearing = await prisma.hearing.create({
    data: {
      caseId: data.caseId,
      hearingDate,
      court: data.court || null,
      circuit: data.circuit || null,
      decision: data.decision || null,
      requirements: data.requirements || null,
      attendedBy: data.attendedBy || null,
      notes: data.notes || null,
    },
  });

  // Automatically update case nextHearingDate if this hearing is in the future
  const now = new Date();
  if (hearingDate >= now) {
    await prisma.case.update({
      where: { id: data.caseId },
      data: { nextHearingDate: hearingDate },
    });
  }

  await logActivity({
    action: "CREATE",
    entityType: "HEARING",
    entityId: hearing.id,
    details: `إضافة جلسة بتأريخ ${hearingDate.toLocaleDateString("ar-EG")} للقضية بواسطة ${user.name}`,
  });

  revalidatePath(`/cases/${data.caseId}`);
  return { success: true, data: hearing };
}

export async function deleteHearing(hearingId: string) {
  const user = await requireAdmin(); // Permissions are enforced on the server

  const hearing = await prisma.hearing.findUnique({
    where: { id: hearingId },
  });

  if (!hearing) {
    return { success: false, error: "الجلسة غير موجودة" };
  }

  await prisma.hearing.delete({
    where: { id: hearingId },
  });

  // Update case nextHearingDate to next future hearing if any
  const nextFutureHearing = await prisma.hearing.findFirst({
    where: {
      caseId: hearing.caseId,
      hearingDate: { gte: new Date() },
    },
    orderBy: { hearingDate: "asc" },
  });

  await prisma.case.update({
    where: { id: hearing.caseId },
    data: { nextHearingDate: nextFutureHearing?.hearingDate || null },
  });

  await logActivity({
    action: "DELETE",
    entityType: "HEARING",
    entityId: hearingId,
    details: `حذف جلسة محكمة بواسطة ${user.name}`,
  });

  revalidatePath(`/cases/${hearing.caseId}`);
  return { success: true };
}

export async function softDeleteCase(id: string) {
  const user = await requireAdmin(); // Enforced on server: employees cannot delete

  const targetCase = await prisma.case.findUnique({
    where: { id },
  });

  if (!targetCase) {
    return { success: false, error: "القضية غير موجودة" };
  }

  await prisma.case.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logActivity({
    action: "DELETE_SOFT",
    entityType: "CASE",
    entityId: id,
    details: `أرشفة القضية رقم ${targetCase.caseNumber}/${targetCase.caseYear} بواسطة ${user.name}`,
  });

  revalidatePath("/cases");
  return { success: true };
}

