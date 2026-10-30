"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function uploadDocumentAction(formData: FormData) {
  const user = await requireAuth();

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "مستند بدون عنوان";
  const category = (formData.get("category") as string) || "OTHER";
  const caseId = (formData.get("caseId") as string) || null;
  const clientId = (formData.get("clientId") as string) || null;

  if (!file) {
    return { success: false, error: "لم يتم اختيار أي ملف" };
  }

  // Max size limit: 25MB
  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { success: false, error: "حجم الملف يتجاوز الحد المسموح به (25 ميجابايت)" };
  }

  // Allowed mime types
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "نوع الملف غير مدعوم. الصيغ المدعومة هي: PDF، JPG، PNG، WEBP",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const saved = await saveUploadedFile({
    buffer,
    originalName: file.name,
    mimeType: file.type,
  });

  const doc = await prisma.document.create({
    data: {
      title,
      fileName: saved.fileName,
      originalName: file.name,
      filePath: saved.filePath,
      fileSize: saved.fileSize,
      mimeType: saved.mimeType,
      category: category as any,
      caseId: caseId || null,
      clientId: clientId || null,
      uploadedBy: user.name,
    },
  });

  await logActivity({
    action: "UPLOAD_DOCUMENT",
    entityType: "DOCUMENT",
    entityId: doc.id,
    details: `رفع مستند جديد: "${doc.title}" (${doc.originalName}) بواسطة ${user.name}`,
  });

  if (caseId) revalidatePath(`/cases/${caseId}`);
  if (clientId) revalidatePath(`/clients/${clientId}`);

  return { success: true, data: doc };
}

export async function deleteDocumentAction(id: string) {
  const user = await requireAuth();

  const doc = await prisma.document.findUnique({
    where: { id },
  });

  if (!doc) {
    return { success: false, error: "المستند غير موجود" };
  }

  // Check admin permission if employee did not upload it
  if (user.role !== "ADMIN" && doc.uploadedBy !== user.name) {
    await requireAdmin();
  }

  // Remove file from disk
  await deleteUploadedFile(doc.filePath);

  // Delete DB record
  await prisma.document.delete({
    where: { id },
  });

  await logActivity({
    action: "DELETE_DOCUMENT",
    entityType: "DOCUMENT",
    entityId: id,
    details: `حذف المستند: "${doc.title}" (${doc.originalName}) بواسطة ${user.name}`,
  });

  if (doc.caseId) revalidatePath(`/cases/${doc.caseId}`);
  if (doc.clientId) revalidatePath(`/clients/${doc.clientId}`);

  return { success: true };
}

