"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { staffSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getStaffList(params?: {
  query?: string;
  role?: string;
  activeOnly?: boolean;
}) {
  await requireAuth();

  const where: any = {};

  if (params?.activeOnly) {
    where.isActive = true;
  }

  if (params?.role && params.role !== "ALL") {
    where.role = params.role;
  }

  if (params?.query && params.query.trim()) {
    const q = params.query.trim();
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { barAssociationNumber: { contains: q } },
    ];
  }

  const staff = await prisma.staff.findMany({
    where,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          cases: true,
          consultations: true,
        },
      },
    },
  });

  return staff;
}

export async function getLawyersList() {
  await requireAuth();
  return prisma.staff.findMany({
    where: {
      role: "LAWYER",
      isActive: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getStaffMember(id: string) {
  await requireAuth();
  return prisma.staff.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          cases: true,
          consultations: true,
        },
      },
    },
  });
}

export async function createStaffMember(rawData: any) {
  const user = await requireAuth();

  const validated = staffSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const staff = await prisma.staff.create({
    data: {
      name: data.name,
      role: data.role as any,
      phone: data.phone,
      email: data.email || null,
      hireDate: data.hireDate ? new Date(data.hireDate) : null,
      barAssociationNumber:
        data.role === "LAWYER" ? data.barAssociationNumber || null : null,
      isActive: data.isActive,
      notes: data.notes || null,
    },
  });

  await logActivity({
    action: "CREATE",
    entityType: "STAFF",
    entityId: staff.id,
    details: `إضافة موظف/محام جديد: ${staff.name} (${staff.role}) بواسطة ${user.name}`,
  });

  revalidatePath("/staff");
  return { success: true, data: staff };
}

export async function updateStaffMember(id: string, rawData: any) {
  const user = await requireAuth();

  const validated = staffSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const staff = await prisma.staff.update({
    where: { id },
    data: {
      name: data.name,
      role: data.role as any,
      phone: data.phone,
      email: data.email || null,
      hireDate: data.hireDate ? new Date(data.hireDate) : null,
      barAssociationNumber:
        data.role === "LAWYER" ? data.barAssociationNumber || null : null,
      isActive: data.isActive,
      notes: data.notes || null,
    },
  });

  await logActivity({
    action: "UPDATE",
    entityType: "STAFF",
    entityId: staff.id,
    details: `تعديل بيانات الموظف/المحامي: ${staff.name} بواسطة ${user.name}`,
  });

  revalidatePath("/staff");
  return { success: true, data: staff };
}

export async function deleteStaffMember(id: string) {
  const user = await requireAdmin(); // Permissions are enforced on the server

  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          cases: true,
          consultations: true,
        },
      },
    },
  });

  if (!staff) {
    return { success: false, error: "الموظف غير موجود" };
  }

  if (staff._count.cases > 0 || staff._count.consultations > 0) {
    return {
      success: false,
      error: `لا يمكن حذف هذا الموظف لوجود ${staff._count.cases} قضية و ${staff._count.consultations} استشارة مرتبطة به. يمكنك تعطيل حسابه (غير نشط) بدلاً من الحذف.`,
    };
  }

  await prisma.staff.delete({
    where: { id },
  });

  await logActivity({
    action: "DELETE",
    entityType: "STAFF",
    entityId: id,
    details: `حذف الموظف: ${staff.name} بواسطة ${user.name}`,
  });

  revalidatePath("/staff");
  return { success: true };
}

