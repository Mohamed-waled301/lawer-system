import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { getUploadsDirectory } from "@/lib/storage";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("backupFile") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار ملف النسخة الاحتياطية" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    const uploadsDir = getUploadsDirectory();
    let hasDatabase = false;

    for (const entry of zipEntries) {
      if (entry.entryName === "database.db" || entry.entryName.endsWith(".db")) {
        // Extract database file to prisma/dev.db and ./dev.db
        const dbTarget = path.join(process.cwd(), "prisma", "dev.db");
        fs.writeFileSync(dbTarget, entry.getData());
        hasDatabase = true;
      } else if (entry.entryName.startsWith("uploads/") && !entry.isDirectory) {
        // Extract uploaded files
        const relativeName = entry.entryName.replace(/^uploads\//, "");
        const targetPath = path.join(uploadsDir, relativeName);
        const targetParent = path.dirname(targetPath);
        if (!fs.existsSync(targetParent)) {
          fs.mkdirSync(targetParent, { recursive: true });
        }
        fs.writeFileSync(targetPath, entry.getData());
      }
    }

    if (!hasDatabase) {
      return NextResponse.json(
        { error: "ملف النسخة الاحتياطية غير صالح: لا يحتوي على قاعدة البيانات database.db" },
        { status: 400 }
      );
    }

    await logActivity({
      action: "BACKUP_RESTORE",
      entityType: "SYSTEM",
      details: `استعادة نسخة احتياطية من الملف ${file.name} بنجاح بواسطة ${user.name}`,
    });

    return NextResponse.json({
      success: true,
      message: "تمت استعادة النسخة الاحتياطية بنجاح. يرجى إعادة تحميل الصفحة.",
    });
  } catch (error: any) {
    console.error("Backup restore failed:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء استعادة النسخة الاحتياطية" },
      { status: 500 }
    );
  }
}

