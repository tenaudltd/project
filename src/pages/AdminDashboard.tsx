import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  ClipboardList,
  ExternalLink,
  FilePenLine,
  Loader2,
  Megaphone,
  MessageSquare,
  Save,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { db } from "../lib/firebase";
import { defaultSiteContent, mergeSiteContent } from "../lib/siteContent";
import type {
  Announcement,
  Feedback,
  Module,
  QuizResult,
  SiteContent,
  UserProfile,
} from "../lib/types";
import { useAuth } from "../contexts/AuthContext";

type AdminSection =
  | "users"
  | "modules"
  | "results"
  | "feedback"
  | "announcements"
  | "content";

type AnnouncementDraft = Pick<Announcement, "title" | "message">;

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementDrafts, setAnnouncementDrafts] = useState<
    Record<string, AnnouncementDraft>
  >({});
  const [siteContent, setSiteContent] =
    useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const stats = {
    users: users.length,
    modules: modules.length,
    results: results.length,
    feedback: feedback.length,
    announcements: announcements.length,
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        usersSnap,
        modulesSnap,
        resultsSnap,
        feedbackSnap,
        announcementsSnap,
        siteSnap,
      ] = await Promise.all([
        getDocs(collection(db, "Users")),
        getDocs(collection(db, "Modules")),
        getDocs(collection(db, "Results")),
        getDocs(collection(db, "Feedback")),
        getDocs(collection(db, "Announcements")),
        getDocs(collection(db, "SiteContent")),
      ]);

      const fetchedUsers: UserProfile[] = [];
      usersSnap.forEach((docSnap) => {
        fetchedUsers.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      });
      setUsers(fetchedUsers);

      const fetchedModules: Module[] = [];
      modulesSnap.forEach((docSnap) => {
        fetchedModules.push({ id: docSnap.id, ...docSnap.data() } as Module);
      });
      fetchedModules.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setModules(fetchedModules);

      const fetchedResults: QuizResult[] = [];
      resultsSnap.forEach((docSnap) => {
        fetchedResults.push({ id: docSnap.id, ...docSnap.data() } as QuizResult);
      });
      fetchedResults.sort(
        (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime(),
      );
      setResults(fetchedResults);

      const fetchedFeedback: Feedback[] = [];
      feedbackSnap.forEach((docSnap) => {
        fetchedFeedback.push({ id: docSnap.id, ...docSnap.data() } as Feedback);
      });
      fetchedFeedback.sort(
        (a, b) =>
          new Date(b.dateSubmitted).getTime() -
          new Date(a.dateSubmitted).getTime(),
      );
      setFeedback(fetchedFeedback);

      const fetchedAnnouncements: Announcement[] = [];
      announcementsSnap.forEach((docSnap) => {
        fetchedAnnouncements.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Announcement);
      });
      fetchedAnnouncements.sort(
        (a, b) =>
          new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime(),
      );
      setAnnouncements(fetchedAnnouncements);
      setAnnouncementDrafts(
        Object.fromEntries(
          fetchedAnnouncements.map((item) => [
            item.id,
            { title: item.title, message: item.message },
          ]),
        ),
      );

      const publicContent = siteSnap.docs.find(
        (docSnap) => docSnap.id === "public",
      );
      setSiteContent(
        publicContent
          ? mergeSiteContent(publicContent.data())
          : defaultSiteContent,
      );
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAdminData();
  }, []);

  const flashSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user.uid === userId
            ? { ...user, role: newRole as UserProfile["role"] }
            : user,
        ),
      );
      flashSuccess("User role updated successfully.");
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update user role.");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    const confirmed = window.confirm(
      "Delete this module, all its lessons, quizzes, and related results?",
    );
    if (!confirmed) return;

    setSaving(true);
    setError("");
    try {
      const [lessonSnap, quizSnap, resultsSnap] = await Promise.all([
        getDocs(collection(db, `Modules/${moduleId}/Lessons`)),
        getDocs(collection(db, `Modules/${moduleId}/Quizzes`)),
        getDocs(query(collection(db, "Results"), where("moduleId", "==", moduleId))),
      ]);

      const batch = writeBatch(db);
      lessonSnap.docs.forEach((snapshot) => batch.delete(snapshot.ref));
      quizSnap.docs.forEach((snapshot) => batch.delete(snapshot.ref));
      resultsSnap.docs.forEach((snapshot) => batch.delete(snapshot.ref));
      batch.delete(doc(db, "Modules", moduleId));
      await batch.commit();

      setModules((prev) => prev.filter((item) => item.id !== moduleId));
      setResults((prev) => prev.filter((item) => item.moduleId !== moduleId));
      flashSuccess("Module deleted.");
    } catch (err) {
      console.error("Error deleting module:", err);
      setError("Failed to delete module.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    const confirmed = window.confirm("Delete this announcement?");
    if (!confirmed) return;

    setSaving(true);
    setError("");
    try {
      await deleteDoc(doc(db, "Announcements", announcementId));
      setAnnouncements((prev) =>
        prev.filter((item) => item.id !== announcementId),
      );
      setAnnouncementDrafts((prev) => {
        const next = { ...prev };
        delete next[announcementId];
        return next;
      });
      flashSuccess("Announcement deleted.");
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError("Failed to delete announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnnouncement = async (announcement: Announcement) => {
    const draft = announcementDrafts[announcement.id];
    if (!draft?.title.trim() || !draft.message.trim()) return;

    setSaving(true);
    setError("");
    try {
      const updated = {
        title: draft.title.trim(),
        message: draft.message.trim(),
      };
      await updateDoc(doc(db, "Announcements", announcement.id), updated);
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === announcement.id ? { ...item, ...updated } : item,
        ),
      );
      flashSuccess("Announcement updated.");
    } catch (err) {
      console.error("Error updating announcement:", err);
      setError("Failed to update announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSiteContent = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setSaving(true);
    setError("");
    try {
      await setDoc(doc(db, "SiteContent", "public"), {
        ...siteContent,
        updatedAt: new Date().toISOString(),
        updatedBy: userProfile.uid,
      });
      flashSuccess("Public page content updated.");
    } catch (err) {
      console.error("Error saving site content:", err);
      setError("Failed to save public page content.");
    } finally {
      setSaving(false);
    }
  };

  const setAnnouncementDraft = (
    id: string,
    field: keyof AnnouncementDraft,
    value: string,
  ) => {
    setAnnouncementDrafts((prev) => ({
      ...prev,
      [id]: {
        title: prev[id]?.title || "",
        message: prev[id]?.message || "",
        [field]: value,
      },
    }));
  };

  const statCards: Array<{
    section: AdminSection;
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
  }> = [
    {
      section: "users",
      label: "Registered users",
      value: stats.users,
      icon: Users,
      color: "text-primary-600 bg-primary-50",
    },
    {
      section: "modules",
      label: "Modules",
      value: stats.modules,
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      section: "results",
      label: "Quiz attempts",
      value: stats.results,
      icon: ClipboardList,
      color: "text-violet-600 bg-violet-50",
    },
    {
      section: "feedback",
      label: "Feedback",
      value: stats.feedback,
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-50",
    },
    {
      section: "announcements",
      label: "Announcements",
      value: stats.announcements,
      icon: Megaphone,
      color: "text-sky-600 bg-sky-50",
    },
    {
      section: "content",
      label: "Page content",
      value: "Edit",
      icon: FilePenLine,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Control Panel
        </h1>
        <p className="mt-2 text-gray-600">
          Manage users, learning content, announcements, feedback, and public
          page copy from one workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <button
            key={card.section}
            type="button"
            onClick={() => setActiveSection(card.section)}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left shadow-sm transition ${
              activeSection === card.section
                ? "border-primary-300 bg-primary-50/50"
                : "border-gray-100 bg-white hover:border-primary-200 hover:bg-primary-50/30"
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-600">
        <BarChart3 className="h-5 w-5 text-gray-400" />
        <span>Use the cards above to switch between management sections.</span>
      </div>

      {success && (
        <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-green-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {activeSection === "users" && (
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                System Users
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm">
              <Users className="h-4 w-4" />
              {users.length} Total Users
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-sm font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.uid} className="transition-colors hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {user.fullName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          user.role === "admin"
                            ? "bg-red-50 text-red-700"
                            : user.role === "staff"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <select
                        className="rounded-md border border-gray-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={user.role}
                        onChange={(e) =>
                          void updateUserRole(user.uid, e.target.value)
                        }
                      >
                        <option value="learner">Learner</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSection === "modules" && (
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Learning Modules
            </h2>
            <Link to="/staff" className="button-secondary gap-2">
              Create module
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          {modules.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-6 text-sm text-gray-500">
              No modules found.
            </p>
          ) : (
            <div className="space-y-3">
              {modules.map((module) => (
                <article
                  key={module.id}
                  className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {module.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {module.lessonCount ?? 0} lessons ·{" "}
                      {module.hasQuiz ? "Quiz enabled" : "No quiz"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/staff/modules/${module.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Manage
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDeleteModule(module.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === "results" && (
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Quiz Attempts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 text-gray-700">{result.userId}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {result.moduleId || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {result.score}%
                      {typeof result.correctAnswers === "number" && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {result.correctAnswers} correct
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          result.passed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.passed ? "Passed" : "Not passed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(result.dateTaken).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No quiz attempts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSection === "feedback" && (
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Feedback
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Staff and admins can respond in the shared feedback inbox.
              </p>
            </div>
            <Link to="/feedback" className="button-primary gap-2">
              Open inbox
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {feedback.slice(0, 10).map((item) => (
              <article key={item.id} className="rounded-lg bg-gray-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.userName || item.userId}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(item.dateSubmitted).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "responded"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status === "responded" ? "Responded" : "Open"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{item.message}</p>
              </article>
            ))}
            {feedback.length === 0 && (
              <p className="rounded-lg bg-gray-50 p-6 text-sm text-gray-500">
                No feedback found.
              </p>
            )}
          </div>
        </section>
      )}

      {activeSection === "announcements" && (
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Announcements
            </h2>
            <Link to="/staff" className="button-secondary gap-2">
              Create announcement
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="grid gap-4">
                  <input
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    value={announcementDrafts[announcement.id]?.title || ""}
                    onChange={(e) =>
                      setAnnouncementDraft(
                        announcement.id,
                        "title",
                        e.target.value,
                      )
                    }
                  />
                  <textarea
                    rows={4}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    value={announcementDrafts[announcement.id]?.message || ""}
                    onChange={(e) =>
                      setAnnouncementDraft(
                        announcement.id,
                        "message",
                        e.target.value,
                      )
                    }
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      Posted {new Date(announcement.datePosted).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleSaveAnnouncement(announcement)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleDeleteAnnouncement(announcement.id)
                        }
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {announcements.length === 0 && (
              <p className="rounded-lg bg-gray-50 p-6 text-sm text-gray-500">
                No announcements found.
              </p>
            )}
          </div>
        </section>
      )}

      {activeSection === "content" && (
        <form
          onSubmit={handleSaveSiteContent}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Public Page Content
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              These fields control the home page headline and About page copy.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Home page</h3>
              <label className="block text-sm font-medium text-gray-700">
                Eyebrow
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.homeEyebrow}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      homeEyebrow: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Title
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.homeTitle}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      homeTitle: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.homeDescription}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      homeDescription: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">About page</h3>
              <label className="block text-sm font-medium text-gray-700">
                Eyebrow
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.aboutEyebrow}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      aboutEyebrow: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Title
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.aboutTitle}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      aboutTitle: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.aboutDescription}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      aboutDescription: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Focus title
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.aboutFocusTitle}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      aboutFocusTitle: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Focus body
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.aboutFocusBody}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      aboutFocusBody: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Outcome
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={siteContent.aboutOutcome}
                  onChange={(e) =>
                    setSiteContent((prev) => ({
                      ...prev,
                      aboutOutcome: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save public content
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
