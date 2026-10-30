import fs from "fs";
import path from "path";
import crypto from "crypto";

export function getUploadsDirectory(): string {
  const dir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function saveUploadedFile({
  buffer,
  originalName,
  mimeType,
}: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}): Promise<{
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}> {
  const uploadsDir = getUploadsDirectory();
  const ext = path.extname(originalName) || "";
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const fileName = `${Date.now()}_${randomSuffix}${ext}`;
  const fullPath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(fullPath, buffer);

  return {
    fileName,
    filePath: fullPath,
    fileSize: buffer.length,
    mimeType,
  };
}

export async function deleteUploadedFile(filePath: string): Promise<boolean> {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete file from disk:", filePath, error);
    return false;
  }
}

export async function readUploadedFile(filePath: string): Promise<Buffer | null> {
  try {
    if (fs.existsSync(filePath)) {
      return await fs.promises.readFile(filePath);
    }
    return null;
  } catch (error) {
    console.error("Failed to read file from disk:", filePath, error);
    return null;
  }
}

