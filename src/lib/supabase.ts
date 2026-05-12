const supabaseUrl = "https://uhlxoomyifethrtsvrsj.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobHhvb215aWZldGhydHN2cnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTIzOTcsImV4cCI6MjA5NDE2ODM5N30.cKwVX3VQOZ1oBHYa6tLj6-jZAQiQkjk5EI5LuPZ2zBQ";

export const lessonMediaBucket = "uploads";

export type LessonMediaType = "video" | "audio" | "file";

export type UploadedLessonMedia = {
  mediaUrl: string;
  mediaPath: string;
  mediaBucket: string;
  mediaName: string;
  mediaType: LessonMediaType;
};

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

async function createStorageClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl, supabaseAnonKey).storage;
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function lessonMediaTypeFromFile(file: File): LessonMediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

export async function uploadLessonMedia(
  moduleId: string,
  file: File,
): Promise<UploadedLessonMedia> {
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const safeName = sanitizeFileName(file.name) || "lesson-media";
  const mediaPath = `${moduleId}/${Date.now()}-${token}-${safeName}`;
  const storage = await createStorageClient();

  const { error } = await storage
    .from(lessonMediaBucket)
    .upload(mediaPath, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = storage.from(lessonMediaBucket).getPublicUrl(mediaPath);

  return {
    mediaUrl: data.publicUrl,
    mediaPath,
    mediaBucket: lessonMediaBucket,
    mediaName: file.name,
    mediaType: lessonMediaTypeFromFile(file),
  };
}

export async function deleteLessonMedia(
  mediaPath: string,
  mediaBucket = lessonMediaBucket,
) {
  if (!isSupabaseConfigured()) return;

  const storage = await createStorageClient();
  const { error } = await storage.from(mediaBucket).remove([mediaPath]);
  if (error) {
    console.warn("Unable to remove lesson media from Supabase:", error);
  }
}
