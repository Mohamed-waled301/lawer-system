import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readUploadedFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("غير مصرح: يرجى تسجيل الدخول", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return new NextResponse("المسار غير محدد", { status: 400 });
    }

    const fileBuffer = await readUploadedFile(path);
    if (!fileBuffer) {
      return new NextResponse("الملف غير موجود على القرص", { status: 404 });
    }

    // Determine basic mime type from file extension
    let mimeType = "application/octet-stream";
    const lower = path.toLowerCase();
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (lower.endsWith(".png")) {
      mimeType = "image/png";
    } else if (lower.endsWith(".webp")) {
      mimeType = "image/webp";
    } else if (lower.endsWith(".pdf")) {
      mimeType = "application/pdf";
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `inline; filename="receipt-proof"`,
      },
    });
  } catch (error) {
    console.error("Error serving proof file:", error);
    return new NextResponse("خطأ في الخادم", { status: 500 });
  }
}

