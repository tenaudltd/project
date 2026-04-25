import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Module } from "./types";

export async function resolveModuleLessonCounts(
  modules: Module[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  const missingCounts = modules.filter(
    (module) => typeof module.lessonCount !== "number",
  );

  missingCounts.forEach((module) => {
    counts[module.id] = 0;
  });

  await Promise.all(
    missingCounts.map(async (module) => {
      try {
        const lessonSnapshot = await getDocs(
          collection(db, `Modules/${module.id}/Lessons`),
        );
        counts[module.id] = lessonSnapshot.size;
      } catch {
        counts[module.id] = 0;
      }
    }),
  );

  return counts;
}
