import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Bell,
  Trophy,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  limit,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Announcement, Module } from "../lib/types";
import { listUserModuleProgress } from "../lib/moduleProgress";
import { getBookmarkedModuleIds } from "../lib/bookmarksLocal";

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
        for (const p of progressList) {
          const n = p.completedLessonIds?.length ?? 0;
          lessonSum += n;
          if (n > 0) started += 1;
        }
        setLessonsDone(lessonSum);
        setModulesStarted(started);

        const modsSnap = await getDocs(
          query(collection(db, "Modules"), orderBy("createdAt", "desc"), limit(20)),
        );
        const modules: Module[] = [];
        modsSnap.forEach((d) => {
          modules.push({ id: d.id, ...d.data() } as Module);
        });

        let best: { id: string; title: string; pct: number } | null = null;
        for (const m of modules) {
          const pr = progressList.find((x) => x.moduleId === m.id);
          const done = pr?.completedLessonIds?.length ?? 0;
          let total = 0;
          try {
            const lc = await getDocs(
              collection(db, `Modules/${m.id}/Lessons`),
            );
            total = lc.size;
          } catch {
            total = 0;
          }
          if (total === 0) continue;
          const pct = Math.round((done / total) * 100);
          if (pct < 100 && (best === null || pct > best.pct)) {
            best = { id: m.id, title: m.title, pct };
          }
        }
        if (!best && modules[0]) {
          const m = modules[0];
          const pr = progressList.find((x) => x.moduleId === m.id);
          const done = pr?.completedLessonIds?.length ?? 0;
          let total = 0;
          try {
            const lc = await getDocs(
              collection(db, `Modules/${m.id}/Lessons`),
            );
            total = lc.size;
          } catch {
            total = 0;
          }
          const pct =
            total > 0 ? Math.round((done / total) * 100) : 0;
          best = { id: m.id, title: m.title, pct };
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
      label: "First steps",
      desc: "Complete a lesson",
      unlocked: lessonsDone >= 1,
    },
    {
      id: "quiz",
      label: "Assessment",
      desc: "Finish a module quiz",
      unlocked: completedQuizzes >= 1,
    },
    {
      id: "scholar",
      label: "Committed learner",
      desc: "Complete 3 quizzes",
      unlocked: completedQuizzes >= 3,
    },
    {
      id: "star",
      label: "Organised",
      desc: "Bookmark a module",
      unlocked: bookmarks >= 1,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.fullName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening in Mushindamo's civic space today.
        </p>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            Achievements
          </h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.id}
              title={b.desc}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                b.unlocked
                  ? "bg-white text-amber-900 shadow-sm ring-1 ring-amber-200"
                  : "bg-white/50 text-gray-400 line-through decoration-gray-300"
              }`}
            >
              {b.unlocked && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              {b.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-start gap-4 flex-col justify-between">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Modules in progress
            </p>
            <p className="text-2xl font-bold text-gray-900">{modulesStarted}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-start gap-4 flex-col justify-between">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Quizzes completed
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {completedQuizzes}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-start gap-4 flex-col justify-between">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Estimated study time
            </p>
            <p className="text-2xl font-bold text-gray-900">{studyMinutes}m</p>
            <p className="text-xs text-gray-400 mt-1">
              Based on lessons recorded (~12 min each)
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Council Notices
            </h2>
          </div>
          <div className="space-y-4">
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-gray-500">No recent announcements.</p>
            ) : (
              recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="group">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {announcement.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {announcement.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Continue learning
            </h2>
          </div>
          {continueModule ? (
            <div>
              <p className="text-sm font-medium text-gray-900">
                {continueModule.title}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-primary-500 transition-all"
                  style={{ width: `${continueModule.pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                About {continueModule.pct}% through this module
              </p>
              <Link
                to={`/modules/${continueModule.id}/lessons/start`}
                className="mt-4 inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800"
              >
                Resume
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Browse modules to start your civic learning journey.
              </p>
              <Link
                to="/modules"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Browse modules
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
