import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function getUploadRoot() {
  const configured = process.env.UPLOAD_DIR ?? "./public/uploads";
  return path.resolve(process.cwd(), configured);
}

export async function saveUploadedFile(file: File, folder = "ravecharts") {
  if (!file || !file.size) {
    return null;
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only PDF, JPG, PNG, and WEBP files are supported.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Please upload a file smaller than 5MB.");
  }

  const uploadDirectory = path.join(getUploadRoot(), folder);
  await mkdir(uploadDirectory, { recursive: true });

  const extension = path.extname(file.name || "") || getFallbackExtension(file.type);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const outputPath = path.join(uploadDirectory, fileName);
  const arrayBuffer = await file.arrayBuffer();

  await writeFile(outputPath, Buffer.from(arrayBuffer));

  return `/uploads/${folder}/${fileName}`;
}

export async function deleteUploadedFile(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) {
    return;
  }

  const localPath = path.join(
    process.cwd(),
    "public",
    publicPath.replace(/^\/uploads\//, "uploads/"),
  );

  try {
    await unlink(localPath);
  } catch {
    // Ignore missing files to keep replace/delete flows resilient.
  }
}

function getFallbackExtension(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}
