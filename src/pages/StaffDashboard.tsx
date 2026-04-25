import React, { useCallback, useEffect, useState } from "react";
import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  PlusCircle,
  Megaphone,
  BookOpen,
  AlertCircle,
  CheckCircle,
  List,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Module } from "../lib/types";

export default function StaffDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "announcement" | "module" | "manage"
  >("manage");

  const [modules, setModules] = useState<Module[]>([]);

  // Announcement state
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  // Module state
  const [modTitle, setModTitle] = useState("");
  const [modDescription, setModDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchModules = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "Modules"), orderBy("createdAt", "desc")),
      );
      const fetched: Module[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as Module);
      });
      setModules(fetched);
    } catch (err) {
      console.error("Failed to fetch modules", err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "manage") {
      fetchModules();
    }
  }, [activeTab, fetchModules]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim() || !userProfile) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, "Announcements"), {
        title: annTitle.trim(),
        message: annMessage.trim(),
        postedBy: userProfile.uid,
        datePosted: new Date().toISOString(),
      });
      setSuccessMsg("Announcement posted successfully!");
      setAnnTitle("");
      setAnnMessage("");
    } catch (err: unknown) {
      setErrorMsg("Failed to create announcement.");
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle.trim() || !modDescription.trim() || !userProfile) return;

    const title = modTitle.trim();
    const description = modDescription.trim();
    const createdAt = new Date().toISOString();

    setLoading(true);
    setErrorMsg("");
    try {
      const docRef = await addDoc(collection(db, "Modules"), {
        title,
        description,
        createdBy: userProfile.uid,
        createdAt,
        lessonCount: 0,
        hasQuiz: false,
      });
      setModules((prev) => [
        {
          id: docRef.id,
          title,
          description,
          createdBy: userProfile.uid,
          createdAt,
          lessonCount: 0,
          hasQuiz: false,
        },
        ...prev,
      ]);
      setSuccessMsg("Module created successfully. Opening manager...");
      setModTitle("");
      setModDescription("");
      navigate(`/staff/modules/${docRef.id}`);
    } catch (err: unknown) {
      setErrorMsg("Failed to create module.");
      console.error(err);
      setTimeout(() => setSuccessMsg(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Portal</h1>
        <p className="mt-2 text-gray-600">
          Manage civic education modules and platform announcements.
        </p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "manage" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          onClick={() => setActiveTab("manage")}
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Manage Content
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "module" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          onClick={() => setActiveTab("module")}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            New Module
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "announcement" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          onClick={() => setActiveTab("announcement")}
        >
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            New Announcement
          </div>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {successMsg && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3 border border-green-100">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {activeTab === "announcement" && (
          <form onSubmit={handleCreateAnnouncement} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="annTitle"
              >
                Title
              </label>
              <input
                id="annTitle"
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Upcoming Council Meeting"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="annMessage"
              >
                Message Payload
              </label>
              <textarea
                id="annMessage"
                required
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Detail the announcement..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-primary-700 flex items-center justify-center disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {loading ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        )}

        {activeTab === "module" && (
          <form onSubmit={handleCreateModule} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="modTitle"
              >
                Module Title
              </label>
              <input
                id="modTitle"
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                value={modTitle}
                onChange={(e) => setModTitle(e.target.value)}
                placeholder="e.g. Budgeting Processes"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="modDescription"
              >
                Description
              </label>
              <textarea
                id="modDescription"
                required
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                value={modDescription}
                onChange={(e) => setModDescription(e.target.value)}
                placeholder="Describe what learners will gain from this module..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-primary-700 flex items-center justify-center disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {loading ? "Creating..." : "Create Module Directory"}
            </button>
          </form>
        )}

        {activeTab === "manage" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Existing Modules
            </h2>
            {modules.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No modules found. Create one to get started.
              </p>
            ) : (
              <div className="grid gap-4">
                {modules.map((mod) => (
                  <Link
                    key={mod.id}
                    to={`/staff/modules/${mod.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors group"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {mod.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
