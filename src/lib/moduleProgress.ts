import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ModuleProgress } from "./types";

function progressDocRef(userId: string, moduleId: string) {
  return doc(db, `Users/${userId}/ModuleProgress`, moduleId);
}

export async function getModuleProgress(
  userId: string,
  moduleId: string,
): Promise<ModuleProgress | null> {
  const snap = await getDoc(progressDocRef(userId, moduleId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    moduleId,
    completedLessonIds: Array.isArray(data.completedLessonIds)
      ? data.completedLessonIds
      : [],
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "",
  };
}

export async function recordLessonReached(
  userId: string,
  moduleId: string,
  lessonId: string,
): Promise<void> {
  const ref = progressDocRef(userId, moduleId);
  const prev = await getDoc(ref);
  const existing: string[] = prev.exists()
    ? Array.isArray(prev.data().completedLessonIds)
      ? prev.data().completedLessonIds
      : []
    : [];
  const next = existing.includes(lessonId) ? existing : [...existing, lessonId];
  await setDoc(
    ref,
    {
      moduleId,
      completedLessonIds: next,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function listUserModuleProgress(
  userId: string,
): Promise<ModuleProgress[]> {
  const snap = await getDocs(collection(db, `Users/${userId}/ModuleProgress`));
  const list: ModuleProgress[] = [];
  snap.forEach((d) => {
    const data = d.data();
    list.push({
      moduleId: d.id,
      completedLessonIds: Array.isArray(data.completedLessonIds)
        ? data.completedLessonIds
        : [],
      updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "",
    });
  });
  return list;
}
