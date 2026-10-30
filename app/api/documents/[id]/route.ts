import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { readUploadedFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("غير مصرح: يرجى تسجيل الدخول", { status: 401 });
    }

    const { id } = params;
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return new NextResponse("المستند غير موجود", { status: 404 });
    }

    const fileBuffer = await readUploadedFile(document.filePath);
    if (!fileBuffer) {
      return new NextResponse("ملف المستند غير موجود على القرص", { status: 404 });
    }

    // Return the file with proper headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Length": document.fileSize.toString(),
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          document.originalName
        )}"`,
      },
    });
  } catch (error) {
    console.error("Error serving document:", error);
    return new NextResponse("خطأ داخلي في الخادم", { status: 500 });
  }
}

