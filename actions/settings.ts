"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { categorySchema, statusSchema, officeSettingsSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getSettingsMap() {
  await requireAuth();

  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function updateOfficeSettings(rawData: any) {
  const user = await requireAdmin(); // Permissions are enforced on the server

  const validated = officeSettingsSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
  }

  await logActivity({
    action: "UPDATE",
    entityType: "SETTING",
    details: `تحديث بيانات وهوية المكتب بواسطة ${user.name}`,
  });

  revalidatePath("/settings");
  return { success: true };
}

// Categories
export async function getCategories() {
  await requireAuth();
  return prisma.caseCategory.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: {
        select: { cases: { where: { isDeleted: false } } },
      },
    },
  });
}

export async function createCategory(rawData: any) {
  const user = await requireAdmin();

  const validated = categorySchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const existing = await prisma.caseCategory.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    return { success: false, error: "كود التصنيف مسجل بالفعل، يرجى اختيار رقم آخر" };
  }

  const category = await prisma.caseCategory.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description || null,
    },
  });

  await logActivity({
    action: "CREATE",
    entityType: "CASE_CATEGORY",
    entityId: category.id,
    details: `إضافة تصنيف قضايا جديد: [${category.code}] ${category.name} بواسطة ${user.name}`,
  });

  revalidatePath("/settings");
  revalidatePath("/cases");
  return { success: true, data: category };
}

export async function updateCategory(id: string, rawData: any) {
  const user = await requireAdmin();

  const validated = categorySchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const category = await prisma.caseCategory.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      description: data.description || null,
    },
  });

  await logActivity({
    action: "UPDATE",
    entityType: "CASE_CATEGORY",
    entityId: category.id,
    details: `تحديث تصنيف القضايا: [${category.code}] ${category.name} بواسطة ${user.name}`,
  });

  revalidatePath("/settings");
  revalidatePath("/cases");
  return { success: true, data: category };
}

export async function deleteCategory(id: string) {
  const user = await requireAdmin();

  const cat = await prisma.caseCategory.findUnique({
    where: { id },
    include: {
      _count: { select: { cases: true } },
    },
  });

  if (!cat) return { success: false, error: "التصنيف غير موجود" };

  if (cat._count.cases > 0) {
    return {
      success: false,
      error: `لا يمكن حذف التصنيف لوجود ${cat._count.cases} قضية مسجلة تحته`,
    };
  }

  await prisma.caseCategory.delete({ where: { id } });

  await logActivity({
    action: "DELETE",
    entityType: "CASE_CATEGORY",
    entityId: id,
    details: `حذف تصنيف القضايا: ${cat.name} بواسطة ${user.name}`,
  });

  revalidatePath("/settings");
  revalidatePath("/cases");
  return { success: true };
}

// Case Statuses
export async function getStatuses() {
  await requireAuth();
  return prisma.caseStatus.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { cases: { where: { isDeleted: false } } },
      },
    },
  });
}

export async function createStatus(rawData: any) {
  const user = await requireAdmin();

  const validated = statusSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const status = await prisma.caseStatus.create({
    data: {
      name: data.name,
      isClosed: data.isClosed,
      color: data.color || "blue",
      sortOrder: data.sortOrder,
    },
  });

  await logActivity({
    action: "CREATE",
    entityType: "CASE_STATUS",
    entityId: status.id,
    details: `إضافة حالة قضية جديدة: ${status.name} بواسطة ${user.name}`,
  });

  revalidatePath("/settings");
  revalidatePath("/cases");
  return { success: true, data: status };
}

export async function updateStatus(id: string, rawData: any) {
  const user = await requireAdmin();

  const validated = statusSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message };
  }

  const data = validated.data;

  const status = await prisma.caseStatus.update({
    where: { id },
    data: {
      name: data.name,
      isClosed: data.isClosed,
      color: data.color || "blue",
      sortOrder: data.sortOrder,
    },
  });

  await logActivity({
    action: "UPDATE",
    entityType: "CASE_STATUS",
    entityId: status.id,
    details: `تحديث حالة القضية: ${status.name} بواسطة ${user.name}`,
  });

  revalidatePath("/settings");
  revalidatePath("/cases");
  return { success: true, data: status };
}

export async function deleteStatus(id: string) {
  const user = await requireAdmin();

  const status = await prisma.caseStatus.findUnique({
    where: { id },
    include: {
      _count: { select: { cases: true } },
    },
  });

  if (!status) return { success: false, error: "الحالة غير موجودة" };

  if (status._count.cases > 0) {
    return {
      success: false,
      error: `لا يمكن حذف الحالة لوجود ${status._count.cases} قضية مسجلة بها حالياً`,
    };
  }

  await prisma.caseStatus.delete({ where: { id } });

  await logActivity({
    action: "DELETE",
    entityType: "CASE_STATUS",
    entityId: id,
    details: `حذف حالة القضية: ${status.name} بواسطة ${user.name}`,
  });

  revalidatePath("/settings");
  revalidatePath("/cases");
  return { success: true };
}

