import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { getUploadsDirectory } from "@/lib/storage";
import { logActivity } from "@/lib/activity";
import { PassThrough } from "stream";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin();

    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = new PassThrough();
    archive.pipe(stream);

    // 1. Add SQLite Database file
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");
    const fallbackDbPath = path.join(process.cwd(), "dev.db");

    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: "database.db" });
    } else if (fs.existsSync(fallbackDbPath)) {
      archive.file(fallbackDbPath, { name: "database.db" });
    }

    // 2. Add Uploads Directory
    const uploadsDir = getUploadsDirectory();
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, "uploads");
    }

    // 3. Add Metadata
    const metadata = {
      exportedAt: new Date().toISOString(),
      exportedBy: user.name,
      system: "Law Office Management System",
      version: "1.0.0",
    };
    archive.append(JSON.stringify(metadata, null, 2), { name: "metadata.json" });

    archive.finalize();

    await logActivity({
      action: "BACKUP_EXPORT",
      entityType: "SYSTEM",
      details: `تصدير نسخة احتياطية كاملة (قاعدة البيانات + المستندات) بواسطة ${user.name}`,
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `law_backup_${dateStr}.zip`;

    // Convert PassThrough stream to web ReadableStream
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readable, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Backup export failed:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "فشل تصدير النسخة الاحتياطية" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

