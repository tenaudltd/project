import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Module } from "../lib/types";
import { listUserModuleProgress } from "../lib/moduleProgress";
import {
  getBookmarkedModuleIds,
  toggleBookmarkModule,
} from "../lib/bookmarksLocal";
import {
  BookOpen,
  ChevronRight,
  LayoutTemplate,
  Search,
  Star,
} from "lucide-react";

export default function ModulesList() {
  const { userProfile } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>(
    {},
  );
  const [progressMap, setProgressMap] = useState<
    Record<string, { done: number; total: number }>
  >({});
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const q = query(
          collection(db, "Modules"),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const fetched: Module[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Module);
        });
        setModules(fetched);

        const counts: Record<string, number> = {};
        await Promise.all(
          fetched.map(async (mod) => {
            try {
              const ls = await getDocs(
                collection(db, `Modules/${mod.id}/Lessons`),
              );
              counts[mod.id] = ls.size;
            } catch {
              counts[mod.id] = 0;
            }
          }),
        );
        setLessonCounts(counts);
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  useEffect(() => {
    const sync = async () => {
      if (!userProfile?.uid) return;
      try {
        const list = await listUserModuleProgress(userProfile.uid);
        const map: Record<string, { done: number; total: number }> = {};
        for (const m of modules) {
          const total = lessonCounts[m.id] ?? 0;
          const row = list.find((p) => p.moduleId === m.id);
          const done = row?.completedLessonIds?.length ?? 0;
          map[m.id] = { done, total };
        }
        setProgressMap(map);
      } catch (e) {
        console.error(e);
      }
    };
    if (modules.length && Object.keys(lessonCounts).length) sync();
  }, [userProfile?.uid, modules, lessonCounts]);

  useEffect(() => {
    if (!userProfile?.uid) return;
    setBookmarkIds(getBookmarkedModuleIds(userProfile.uid));
  }, [userProfile?.uid]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [modules, search]);

  const toggleStar = (moduleId: string) => {
    if (!userProfile?.uid) return;
    toggleBookmarkModule(userProfile.uid, moduleId);
    setBookmarkIds(getBookmarkedModuleIds(userProfile.uid));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
        <p className="mt-2 text-gray-600">
          Explore the civic education curriculum designed for Mushindamo
          residents. Search, bookmark favourites, and track your progress.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search modules by title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <LayoutTemplate className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {modules.length === 0
              ? "No modules available"
              : "No modules match your search"}
          </h2>
          <p className="text-gray-500 max-w-sm">
            {modules.length === 0
              ? "The staff council hasn't uploaded any learning modules yet."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((module) => {
            const prog = progressMap[module.id];
            const total = prog?.total ?? lessonCounts[module.id] ?? 0;
            const done = prog?.done ?? 0;
            const pct =
              total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
            const starred = bookmarkIds.includes(module.id);
            return (
              <div
                key={module.id}
                className="group rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleStar(module.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-500"
                      title={
                        starred ? "Remove bookmark" : "Bookmark this module"
                      }
                      aria-label={
                        starred ? "Remove bookmark" : "Bookmark this module"
                      }
                    >
                      <Star
                        className={`h-5 w-5 ${starred ? "fill-amber-400 text-amber-500" : ""}`}
                      />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {module.title}
                  </h2>
                  <p className="text-sm text-gray-600 flex-1 line-clamp-3 mb-4">
                    {module.description}
                  </p>
                  {total > 0 && (
                    <div className="mb-4">
                      <div className="mb-1 flex justify-between text-xs text-gray-500">
                        <span>Your progress</span>
                        <span>
                          {done}/{total} lessons
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-green-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Link
                    to={`/modules/${module.id}/lessons/start`}
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mt-auto"
                  >
                    {done > 0 ? "Continue module" : "Start module"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
