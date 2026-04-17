import { createClient } from "@supabase/supabase-js";
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

type SupabaseStorageConfig = {
  bucket: string;
  key: string;
  url: string;
};

function getUploadRoot() {
  const configured = process.env.UPLOAD_DIR ?? "./public/uploads";
  return path.resolve(process.cwd(), configured);
}

export async function saveUploadedFile(file: File, folder = "ravecharts") {
  if (!file || !file.size) {
    return null;
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Format file yang didukung hanya PDF, JPG, PNG, dan WEBP.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file maksimal adalah 5MB.");
  }

  const extension = path.extname(file.name || "") || getFallbackExtension(file.type);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  const supabaseConfig = getSupabaseStorageConfig();

  if (supabaseConfig) {
    return saveUploadedFileToSupabase({
      arrayBuffer,
      config: supabaseConfig,
      contentType: file.type,
      fileName,
      folder,
    });
  }

  return saveUploadedFileLocally({
    arrayBuffer,
    fileName,
    folder,
  });
}

export async function deleteUploadedFile(publicPath: string | null | undefined) {
  if (!publicPath) {
    return;
  }

  const supabaseConfig = getSupabaseStorageConfig();
  const supabaseObjectPath = supabaseConfig
    ? getSupabaseObjectPath(publicPath, supabaseConfig.bucket)
    : null;

  if (supabaseConfig && supabaseObjectPath) {
    const client = createSupabaseStorageClient(supabaseConfig);

    try {
      await client.storage.from(supabaseConfig.bucket).remove([supabaseObjectPath]);
    } catch {
      // Ignore storage cleanup failures to keep delete/replace flows resilient.
    }

    return;
  }

  if (!publicPath.startsWith("/uploads/")) {
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

function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "ravecharts";

  if (!url || !key) {
    return null;
  }

  return {
    bucket,
    key,
    url,
  };
}

function createSupabaseStorageClient(config: SupabaseStorageConfig) {
  return createClient(config.url, config.key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function saveUploadedFileToSupabase({
  arrayBuffer,
  config,
  contentType,
  fileName,
  folder,
}: {
  arrayBuffer: ArrayBuffer;
  config: SupabaseStorageConfig;
  contentType: string;
  fileName: string;
  folder: string;
}) {
  const client = createSupabaseStorageClient(config);
  const objectPath = buildStorageObjectPath(folder, fileName, config.bucket);

  const { error } = await client.storage.from(config.bucket).upload(objectPath, arrayBuffer, {
    cacheControl: "3600",
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error("Kami tidak dapat mengunggah file ravechart ke Supabase Storage.");
  }

  const { data } = client.storage.from(config.bucket).getPublicUrl(objectPath);

  return data.publicUrl;
}

async function saveUploadedFileLocally({
  arrayBuffer,
  fileName,
  folder,
}: {
  arrayBuffer: ArrayBuffer;
  fileName: string;
  folder: string;
}) {
  const uploadDirectory = path.join(getUploadRoot(), folder);
  await mkdir(uploadDirectory, { recursive: true });

  const outputPath = path.join(uploadDirectory, fileName);
  await writeFile(outputPath, Buffer.from(arrayBuffer));

  return `/uploads/${folder}/${fileName}`;
}

function buildStorageObjectPath(folder: string, fileName: string, bucket: string) {
  if (!folder || folder === bucket) {
    return fileName;
  }

  return `${folder}/${fileName}`;
}

function getSupabaseObjectPath(publicUrl: string, bucket: string) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}
