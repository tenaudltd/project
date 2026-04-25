import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { getBookmarkedModuleIds } from "../lib/bookmarksLocal";
import { resolveModuleLessonCounts } from "../lib/moduleMetadata";
import type { Announcement, Module } from "../lib/types";
import { listUserModuleProgress } from "../lib/moduleProgress";

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([]);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  const [modulesStarted, setModulesStarted] = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [continueModule, setContinueModule] = useState<{
    id: string;
    title: string;
    pct: number;
  } | null>(null);
  const [bookmarks, setBookmarks] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(
          collection(db, "Announcements"),
          orderBy("datePosted", "desc"),
          limit(3),
        );
        const querySnapshot = await getDocs(q);
        const fetched: Announcement[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Announcement);
        });
        setRecentAnnouncements(fetched);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    const fetchStats = async () => {
      if (!userProfile?.uid) return;
      try {
        const qStats = query(
          collection(db, "Results"),
          where("userId", "==", userProfile.uid),
        );
        const resSnap = await getDocs(qStats);
        setCompletedQuizzes(resSnap.size);

        const progressList = await listUserModuleProgress(userProfile.uid);
        let lessonSum = 0;
        let started = 0;
        for (const progress of progressList) {
          const count = progress.completedLessonIds?.length ?? 0;
          lessonSum += count;
          if (count > 0) started += 1;
        }
        setLessonsDone(lessonSum);
        setModulesStarted(started);

        const modsSnap = await getDocs(
          query(collection(db, "Modules"), orderBy("createdAt", "desc"), limit(20)),
        );
        const modules: Module[] = [];
        modsSnap.forEach((docSnap) => {
          modules.push({ id: docSnap.id, ...docSnap.data() } as Module);
        });
        const fallbackLessonCounts = await resolveModuleLessonCounts(modules);

        let best: { id: string; title: string; pct: number } | null = null;
        for (const module of modules) {
          const progress = progressList.find((item) => item.moduleId === module.id);
          const done = progress?.completedLessonIds?.length ?? 0;
          const total = module.lessonCount ?? fallbackLessonCounts[module.id] ?? 0;
          if (total === 0) continue;
          const pct = Math.round((done / total) * 100);
          if (pct < 100 && (best === null || pct > best.pct)) {
            best = { id: module.id, title: module.title, pct };
          }
        }

        if (!best && modules[0]) {
          const module = modules[0];
          const progress = progressList.find((item) => item.moduleId === module.id);
          const done = progress?.completedLessonIds?.length ?? 0;
          const total = module.lessonCount ?? fallbackLessonCounts[module.id] ?? 0;
          best = {
            id: module.id,
            title: module.title,
            pct: total > 0 ? Math.round((done / total) * 100) : 0,
          };
        }

        setContinueModule(best);
        setBookmarks(getBookmarkedModuleIds(userProfile.uid).length);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchAnnouncements();
    fetchStats();
  }, [userProfile?.uid]);

  const studyMinutes = lessonsDone * 12;
  const badges = [
    {
      id: "first",
      label: "First lesson completed",
      unlocked: lessonsDone >= 1,
    },
    {
      id: "quiz",
      label: "First quiz completed",
      unlocked: completedQuizzes >= 1,
    },
    {
      id: "scholar",
      label: "Three quizzes completed",
      unlocked: completedQuizzes >= 3,
    },
    {
      id: "star",
      label: "First bookmark saved",
      unlocked: bookmarks >= 1,
    },
  ];

  return (
    <div className="page-shell">
      <section className="page-header">
        <span className="eyebrow">Dashboard</span>
        <h1 className="page-title">
          Welcome back, {userProfile?.fullName || "Learner"}.
        </h1>
        <p className="page-description">
          Your progress, recommended next step, and recent council notices are
          collected here so you do not have to jump across pages.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="metric-card">
          <BookOpen className="h-8 w-8 text-primary-700" />
          <p className="mt-4 text-sm text-ink-500">Modules started</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900">{modulesStarted}</p>
        </article>
        <article className="metric-card">
          <CheckCircle className="h-8 w-8 text-primary-700" />
          <p className="mt-4 text-sm text-ink-500">Quizzes completed</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900">{completedQuizzes}</p>
        </article>
        <article className="metric-card">
          <Clock className="h-8 w-8 text-primary-700" />
          <p className="mt-4 text-sm text-ink-500">Lessons completed</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900">{lessonsDone}</p>
        </article>
        <article className="metric-card">
          <Sparkles className="h-8 w-8 text-primary-700" />
          <p className="mt-4 text-sm text-ink-500">Estimated study time</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900">{studyMinutes}m</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="section-card">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary-700" />
            <h2 className="text-2xl text-ink-900">Continue learning</h2>
          </div>

          {continueModule ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-ink-500">
                Recommended next module
              </p>
              <p className="mt-2 text-2xl text-ink-900">{continueModule.title}</p>
              <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${continueModule.pct}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-ink-600">
                {continueModule.pct}% complete
              </p>
              <Link
                to={`/modules/${continueModule.id}/lessons/start`}
                className="button-primary mt-5 gap-2"
              >
                Resume module
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-ink-200 bg-slate-50 p-5">
              <p className="text-sm text-ink-600">
                You have not started a module yet.
              </p>
              <Link to="/modules" className="button-secondary mt-4">
                Browse modules
              </Link>
            </div>
          )}
        </div>

        <div className="section-card">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-primary-700" />
            <h2 className="text-2xl text-ink-900">Milestones</h2>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span
                key={badge.id}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                  badge.unlocked
                    ? "bg-primary-50 text-primary-800"
                    : "bg-slate-100 text-ink-500"
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-ink-600">
              Saved bookmarks: <span className="font-semibold text-ink-900">{bookmarks}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary-700" />
          <h2 className="text-2xl text-ink-900">Recent council notices</h2>
        </div>
        <div className="mt-5 space-y-4">
          {recentAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-slate-50 p-5 text-sm text-ink-600">
              No recent announcements.
            </div>
          ) : (
            recentAnnouncements.map((announcement) => (
              <article key={announcement.id} className="rounded-2xl bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-ink-900">
                  {announcement.title}
                </h3>
                <p className="mt-2 text-sm text-ink-600">{announcement.message}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
