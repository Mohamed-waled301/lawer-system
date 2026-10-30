import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function logActivity({
  action,
  entityType,
  entityId,
  details,
}: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
}) {
  try {
    const user = await getCurrentUser();
    await prisma.activityLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || "النظام التلقائي",
        action,
        entityType,
        entityId: entityId || null,
        details: details || null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

