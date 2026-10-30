"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { clientSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function generateClientCode(): Promise<string> {
  const lastClient = await prisma.client.findFirst({
    orderBy: { createdAt: "desc" },
    select: { clientCode: true },
  });

  if (!lastClient || !lastClient.clientCode) {
    return "C-0001";
  }

  const match = lastClient.clientCode.match(/\d+/);
  if (!match) {
    return "C-0001";
  }

  const nextNum = parseInt(match[0], 10) + 1;
  return `C-${nextNum.toString().padStart(4, "0")}`;
}

export async function getClients(params?: {
  query?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}) {
  await requireAuth();

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    isDeleted: params?.includeDeleted ? undefined : false,
  };

  if (params?.query && params.query.trim()) {
    const q = params.query.trim();
    where.OR = [
      { clientCode: { contains: q } },
      { name: { contains: q } },
      { phone: { contains: q } },
      { nationalId: { contains: q } },
    ];
  }

  const [total, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            cases: { where: { isDeleted: false } },
            consultations: true,
            payments: true,
          },
        },
      },
    }),
  ]);

  return {
    clients,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAllClientsForSelect() {
  await requireAuth();
  return prisma.client.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      clientCode: true,
      name: true,
      phone: true,
      nationalId: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getClientDetails(id: string) {
  await requireAuth();

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      cases: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          status: true,
          lawyer: true,
          hearings: {
            orderBy: { hearingDate: "desc" },
            take: 1,
          },
        },
      },
      consultations: {
        orderBy: { date: "desc" },
        include: {
          lawyer: true,
        },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        include: {
          case: {
            select: {
              caseNumber: true,
              caseYear: true,
            },
          },
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return client;
}

export async function createClient(rawData: any) {
  const user = await requireAuth();

  const validated = clientSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;
  const clientCode = await generateClientCode();

  const client = await prisma.client.create({
    data: {
      clientCode,
      name: data.name,
      nationalId: data.nationalId || null,
      phone: data.phone,
      address: data.address || null,
      notes: data.notes || null,
    },
  });

  await logActivity({
    action: "CREATE",
    entityType: "CLIENT",
    entityId: client.id,
    details: `إضافة موكل جديد: ${client.name} (كود: ${client.clientCode}) بواسطة ${user.name}`,
  });

  revalidatePath("/clients");
  return { success: true, data: client };
}

export async function updateClient(id: string, rawData: any) {
  const user = await requireAuth();

  const validated = clientSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      nationalId: data.nationalId || null,
      phone: data.phone,
      address: data.address || null,
      notes: data.notes || null,
    },
  });

  await logActivity({
    action: "UPDATE",
    entityType: "CLIENT",
    entityId: client.id,
    details: `تحديث بيانات الموكل: ${client.name} (${client.clientCode}) بواسطة ${user.name}`,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { success: true, data: client };
}

export async function softDeleteClient(id: string) {
  const user = await requireAdmin(); // Permissions are enforced on the server

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          cases: { where: { isDeleted: false } },
        },
      },
    },
  });

  if (!client) {
    return { success: false, error: "الموكل غير موجود" };
  }

  if (client._count.cases > 0) {
    return {
      success: false,
      error: `لا يمكن أرشفة الموكل لوجود ${client._count.cases} قضية جارية مسجلة له.`,
    };
  }

  await prisma.client.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logActivity({
    action: "DELETE_SOFT",
    entityType: "CLIENT",
    entityId: id,
    details: `أرشفة (حذف آمن) للموكل: ${client.name} (${client.clientCode}) بواسطة ${user.name}`,
  });

  revalidatePath("/clients");
  return { success: true };
}

