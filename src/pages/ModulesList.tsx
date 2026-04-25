import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { BookOpen, ChevronRight, LayoutTemplate, Search, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { resolveModuleLessonCounts } from "../lib/moduleMetadata";
import {
  getBookmarkedModuleIds,
  toggleBookmarkModule,
} from "../lib/bookmarksLocal";
import type { Module } from "../lib/types";
import { listUserModuleProgress } from "../lib/moduleProgress";

export default function ModulesList() {
  const { userProfile } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [progressMap, setProgressMap] = useState<
    Record<string, { done: number; total: number }>
  >({});
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const q = query(collection(db, "Modules"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetched: Module[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Module);
        });
        setModules(fetched);
        setLessonCounts(await resolveModuleLessonCounts(fetched));
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
        for (const module of modules) {
          const total = module.lessonCount ?? lessonCounts[module.id] ?? 0;
          const row = list.find((progress) => progress.moduleId === module.id);
          const done = row?.completedLessonIds?.length ?? 0;
          map[module.id] = { done, total };
        }
        setProgressMap(map);
      } catch (error) {
        console.error(error);
      }
    };

    if (modules.length && Object.keys(lessonCounts).length) {
      sync();
    }
  }, [lessonCounts, modules, userProfile?.uid]);

  useEffect(() => {
    if (!userProfile?.uid) return;
    setBookmarkIds(getBookmarkedModuleIds(userProfile.uid));
  }, [userProfile?.uid]);

  const filtered = useMemo(() => {
    const queryValue = search.trim().toLowerCase();
    if (!queryValue) return modules;
    return modules.filter(
      (module) =>
        module.title.toLowerCase().includes(queryValue) ||
        module.description.toLowerCase().includes(queryValue),
    );
  }, [modules, search]);

  const toggleStar = (moduleId: string) => {
    if (!userProfile?.uid) return;
    toggleBookmarkModule(userProfile.uid, moduleId);
    setBookmarkIds(getBookmarkedModuleIds(userProfile.uid));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <span className="eyebrow">Modules</span>
            <h1 className="page-title max-w-3xl">
              Browse the learning library and continue where you stopped.
            </h1>
            <p className="page-description">
              Search by title or description, bookmark useful modules, and track
              your lesson progress at a glance.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="stat-chip">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                Modules available
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink-900">{modules.length}</p>
            </div>
            <div className="stat-chip">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                Bookmarked
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink-900">{bookmarkIds.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            placeholder="Search modules by title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input pl-12"
          />
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="empty-state">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-ink-400">
            <LayoutTemplate className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink-900">
            {modules.length === 0
              ? "No modules available"
              : "No modules match your search"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-600">
            {modules.length === 0
              ? "Staff have not uploaded any learning modules yet."
              : "Try a broader keyword or clear the search field."}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((module) => {
            const progress = progressMap[module.id];
            const total =
              progress?.total ?? module.lessonCount ?? lessonCounts[module.id] ?? 0;
            const done = progress?.done ?? 0;
            const pct =
              total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
            const starred = bookmarkIds.includes(module.id);

            return (
              <article key={module.id} className="section-card flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStar(module.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-100 bg-slate-50 text-ink-500 hover:border-primary-200 hover:text-primary-700"
                    title={starred ? "Remove bookmark" : "Bookmark this module"}
                    aria-label={starred ? "Remove bookmark" : "Bookmark this module"}
                  >
                    <Star className={`h-4 w-4 ${starred ? "fill-sand-400 text-sand-500" : ""}`} />
                  </button>
                </div>

                <h2 className="mt-5 text-2xl text-ink-900">{module.title}</h2>
                <p className="mt-3 flex-1 text-sm text-ink-600">{module.description}</p>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex justify-between text-xs font-medium uppercase tracking-[0.16em] text-ink-500">
                    <span>Progress</span>
                    <span>
                      {done}/{total || 0}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <Link
                  to={`/modules/${module.id}/lessons/start`}
                  className="button-primary mt-5 justify-between"
                >
                  <span>{done > 0 ? "Continue module" : "Start module"}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
