import {
  addDoc,
  collection,
  deleteField,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  limit,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Pencil,
  FileText,
  HelpCircle,
  Loader2,
  PlusCircle,
  PauseCircle,
  PlayCircle,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  buildQuizDraftFromText,
  documentTextToMarkdown,
  extractDocumentText,
} from "../lib/documentImport";
import { db } from "../lib/firebase";
import {
  generateLessonDraftFromText,
  generateQuizDraftFromText,
} from "../lib/openai";
import {
  deleteLessonMedia,
  isSupabaseConfigured,
  lessonMediaTypeFromFile,
  uploadLessonMedia,
} from "../lib/supabase";
import type { Lesson, Module, Quiz } from "../lib/types";

export default function StaffModuleManager() {
  const { id: moduleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { userProfile } = useAuth();

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [moduleLoadState, setModuleLoadState] = useState<
    "loading" | "ok" | "missing"
  >("loading");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [activeTab, setActiveTab] = useState<"lessons" | "quiz">("lessons");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");

  // Lesson form state
  const [lesTitle, setLesTitle] = useState("");
  const [lesContent, setLesContent] = useState("");
  const [lessonImporting, setLessonImporting] = useState(false);
  const [lessonImportName, setLessonImportName] = useState("");
  const [lessonMediaFile, setLessonMediaFile] = useState<File | null>(null);
  const [lessonMediaName, setLessonMediaName] = useState("");
  const [lessonMediaInputKey, setLessonMediaInputKey] = useState(0);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonContent, setEditLessonContent] = useState("");
  const [editLessonMediaFile, setEditLessonMediaFile] = useState<File | null>(
    null,
  );
  const [editLessonMediaName, setEditLessonMediaName] = useState("");
  const [editLessonRemoveMedia, setEditLessonRemoveMedia] = useState(false);
  const [editLessonMediaInputKey, setEditLessonMediaInputKey] = useState(0);

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [quizImporting, setQuizImporting] = useState(false);
  const [quizImportName, setQuizImportName] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const minimumPassCount = Math.max(
    1,
    Math.ceil((questions.length * 2) / 3),
  );
  const passingPercentage = Math.round((minimumPassCount / questions.length) * 100);

  const fetchModuleData = useCallback(async () => {
    if (!moduleId) return;
    setModuleLoadState("loading");
    try {
      const docSnap = await getDoc(doc(db, "Modules", moduleId));
      if (docSnap.exists()) {
        const nextModule = { id: docSnap.id, ...docSnap.data() } as Module;
        setModuleData(nextModule);
        setModuleTitle(nextModule.title);
        setModuleDescription(nextModule.description);
        setModuleLoadState("ok");
      } else {
        setModuleData(null);
        setModuleLoadState("missing");
      }
    } catch (err) {
      console.error("Error fetching module", err);
      setModuleData(null);
      setModuleLoadState("missing");
    }
  }, [moduleId]);

  const fetchLessons = useCallback(async () => {
    if (!moduleId) return;
    try {
      const q = query(
        collection(db, `Modules/${moduleId}/Lessons`),
        orderBy("createdAt", "asc"),
      );
      const querySnapshot = await getDocs(q);
      const fetched: Lesson[] = [];
      querySnapshot.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() } as Lesson);
      });
      setLessons(fetched);
    } catch (err) {
      console.error("Error fetching lessons", err);
    }
  }, [moduleId]);

  const fetchQuiz = useCallback(async () => {
    if (!moduleId) return;
    try {
      const q = query(
        collection(db, `Modules/${moduleId}/Quizzes`),
        orderBy("createdAt", "desc"),
        limit(1),
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setQuiz({ id: docSnap.id, ...docSnap.data() } as Quiz);
      } else {
        setQuiz(null);
      }
    } catch (err) {
      console.error("Error fetching quiz", err);
    }
  }, [moduleId]);

  useEffect(() => {
    if (!moduleId) {
      setModuleLoadState("missing");
      return;
    }
    void fetchModuleData();
    void fetchLessons();
    void fetchQuiz();
  }, [moduleId, fetchModuleData, fetchLessons, fetchQuiz]);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId || !lesTitle.trim()) return;
    if (!lesContent.trim() && !lessonMediaFile) {
      setErrorMsg("Add lesson text, upload media, or both before saving.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const createdAt = new Date().toISOString();
      const mediaFields = lessonMediaFile
        ? await uploadLessonMedia(moduleId, lessonMediaFile)
        : {};
      const lessonRef = await addDoc(collection(db, `Modules/${moduleId}/Lessons`), {
        moduleId,
        title: lesTitle.trim(),
        content: lesContent.trim(),
        ...mediaFields,
        createdAt,
      });
      await updateDoc(doc(db, "Modules", moduleId), {
        lessonCount: increment(1),
      });
      setSuccessMsg("Lesson added successfully.");
      setLessons((prev) => [
        ...prev,
        {
          id: lessonRef.id,
          moduleId,
          title: lesTitle.trim(),
          content: lesContent.trim(),
          ...mediaFields,
          createdAt,
        },
      ]);
      setModuleData((prev) =>
        prev
          ? {
              ...prev,
              lessonCount: (prev.lessonCount ?? 0) + 1,
            }
          : prev,
      );
      setLesTitle("");
      setLesContent("");
      setLessonMediaFile(null);
      setLessonMediaName("");
      setLessonMediaInputKey((prev) => prev + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add lesson.";
      setErrorMsg(message);
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleLessonMediaChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLessonMediaFile(null);
      setLessonMediaName("");
      return;
    }

    if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      setErrorMsg("Upload a video or audio file for lesson media.");
      e.target.value = "";
      return;
    }

    setErrorMsg("");
    setLessonMediaFile(file);
    setLessonMediaName(`${file.name} (${lessonMediaTypeFromFile(file)})`);
  };

  const resetLessonEdit = () => {
    setEditingLessonId(null);
    setEditLessonTitle("");
    setEditLessonContent("");
    setEditLessonMediaFile(null);
    setEditLessonMediaName("");
    setEditLessonRemoveMedia(false);
    setEditLessonMediaInputKey((prev) => prev + 1);
  };

  const startLessonEdit = (lesson: Lesson) => {
    setErrorMsg("");
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonContent(lesson.content || "");
    setEditLessonMediaFile(null);
    setEditLessonMediaName("");
    setEditLessonRemoveMedia(false);
    setEditLessonMediaInputKey((prev) => prev + 1);
  };

  const handleEditLessonMediaChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setEditLessonMediaFile(null);
      setEditLessonMediaName("");
      return;
    }

    if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      setErrorMsg("Upload a video or audio file for lesson media.");
      e.target.value = "";
      return;
    }

    setErrorMsg("");
    setEditLessonRemoveMedia(false);
    setEditLessonMediaFile(file);
    setEditLessonMediaName(`${file.name} (${lessonMediaTypeFromFile(file)})`);
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId || !editingLessonId || !editLessonTitle.trim()) return;

    const currentLesson = lessons.find((lesson) => lesson.id === editingLessonId);
    if (!currentLesson) {
      setErrorMsg("Lesson not found.");
      return;
    }

    const keepsExistingMedia =
      Boolean(currentLesson.mediaUrl) && !editLessonRemoveMedia;
    const hasMediaAfterSave = keepsExistingMedia || Boolean(editLessonMediaFile);
    if (!editLessonContent.trim() && !hasMediaAfterSave) {
      setErrorMsg("Add lesson text, keep media, or upload new media before saving.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const uploadedMedia = editLessonMediaFile
        ? await uploadLessonMedia(moduleId, editLessonMediaFile)
        : null;
      const mediaFields = uploadedMedia
        ? uploadedMedia
        : editLessonRemoveMedia
          ? {
              mediaUrl: deleteField(),
              mediaPath: deleteField(),
              mediaBucket: deleteField(),
              mediaName: deleteField(),
              mediaType: deleteField(),
            }
          : {};

      await updateDoc(doc(db, `Modules/${moduleId}/Lessons/${editingLessonId}`), {
        title: editLessonTitle.trim(),
        content: editLessonContent.trim(),
        updatedAt: new Date().toISOString(),
        ...mediaFields,
      });

      if ((uploadedMedia || editLessonRemoveMedia) && currentLesson.mediaPath) {
        await deleteLessonMedia(currentLesson.mediaPath, currentLesson.mediaBucket);
      }

      setLessons((prev) =>
        prev.map((lesson) => {
          if (lesson.id !== editingLessonId) return lesson;

          const baseLesson = {
            ...lesson,
            title: editLessonTitle.trim(),
            content: editLessonContent.trim(),
          };

          if (uploadedMedia) {
            return {
              ...baseLesson,
              ...uploadedMedia,
            };
          }

          if (editLessonRemoveMedia) {
            return {
              id: baseLesson.id,
              moduleId: baseLesson.moduleId,
              title: baseLesson.title,
              content: baseLesson.content,
              createdAt: baseLesson.createdAt,
            };
          }

          return baseLesson;
        }),
      );
      resetLessonEdit();
      setSuccessMsg("Lesson updated.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update lesson.";
      setErrorMsg(message);
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId || !quizTitle.trim() || questions.length === 0) return;

    setLoading(true);
    setErrorMsg("");
    try {
      // Basic validation
      const formattedQuestions = questions.map((q, i) => {
        return {
          id: `q${i + 1}`,
          questionText: q.questionText.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctAnswer: q.correctAnswer,
        };
      });

      const createdAt = new Date().toISOString();
      const quizRef = await addDoc(collection(db, `Modules/${moduleId}/Quizzes`), {
        moduleId,
        title: quizTitle.trim(),
        totalMarks: formattedQuestions.length,
        minimumPassCount,
        questions: formattedQuestions,
        createdAt,
        isPaused: false,
      });
      await updateDoc(doc(db, "Modules", moduleId), {
        quizId: quizRef.id,
        hasQuiz: true,
      });

      setSuccessMsg("Quiz created successfully.");
      setQuiz({
        id: quizRef.id,
        moduleId,
        title: quizTitle.trim(),
        totalMarks: formattedQuestions.length,
        minimumPassCount,
        questions: formattedQuestions,
        createdAt,
        isPaused: false,
      });
      setModuleData((prev) =>
        prev
          ? {
              ...prev,
              quizId: quizRef.id,
              hasQuiz: true,
            }
          : prev,
      );
    } catch (err: unknown) {
      setErrorMsg("Failed to create quiz.");
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const updateQuestion = (
    index: number,
    field: "questionText" | "correctAnswer",
    value: string | number,
  ) => {
    const updated = [...questions];
    const row = { ...updated[index] };
    if (field === "questionText") {
      row.questionText = value as string;
    } else {
      row.correctAnswer = value as number;
    }
    updated[index] = row;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleLessonDocumentImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLessonImporting(true);
    setErrorMsg("");
    try {
      const { text, suggestedTitle } = await extractDocumentText(file);
      try {
        const draft = await generateLessonDraftFromText(text, suggestedTitle);
        setLesTitle((prev) => prev || draft.title);
        setLesContent(draft.markdown);
      } catch (apiError) {
        console.warn("OpenAI lesson draft failed, using local fallback:", apiError);
        setLesTitle((prev) => prev || suggestedTitle);
        setLesContent(documentTextToMarkdown(text, suggestedTitle));
      }
      setLessonImportName(file.name);
      setSuccessMsg("Document imported into lesson content. Review and save.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to import lesson document.";
      setErrorMsg(message);
    } finally {
      setLessonImporting(false);
      e.target.value = "";
    }
  };

  const handleQuizDocumentImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQuizImporting(true);
    setErrorMsg("");
    try {
      const { text, suggestedTitle } = await extractDocumentText(file);
      let quizDraft;
      try {
        quizDraft = await generateQuizDraftFromText(text, suggestedTitle);
      } catch (apiError) {
        console.warn("OpenAI quiz draft failed, using local fallback:", apiError);
        quizDraft = buildQuizDraftFromText(text, suggestedTitle);
      }
      setQuizTitle((prev) => prev || quizDraft.title);
      setQuestions(
        quizDraft.questions.map((question) => ({
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
        })),
      );
      setQuizImportName(file.name);
      setSuccessMsg("Document imported into a quiz draft. Review and save.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to import quiz document.";
      setErrorMsg(message);
    } finally {
      setQuizImporting(false);
      e.target.value = "";
    }
  };

  const handleSaveModuleDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId || !moduleTitle.trim() || !moduleDescription.trim()) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Modules", moduleId), {
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
      });
      setModuleData((prev) =>
        prev
          ? {
              ...prev,
              title: moduleTitle.trim(),
              description: moduleDescription.trim(),
            }
          : prev,
      );
      setSuccessMsg("Module details updated.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update module details.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleSetQuizPaused = async (paused: boolean) => {
    if (!moduleId || !quiz) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, `Modules/${moduleId}/Quizzes/${quiz.id}`), {
        isPaused: paused,
        pausedAt: paused ? new Date().toISOString() : null,
      });
      setQuiz((prev) => (prev ? { ...prev, isPaused: paused } : prev));
      setSuccessMsg(paused ? "Quiz paused." : "Quiz resumed.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update quiz status.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!moduleId || !quiz) return;
    const confirmed = window.confirm(
      "Delete this quiz? Learners will no longer be able to take it.",
    );
    if (!confirmed) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await deleteDoc(doc(db, `Modules/${moduleId}/Quizzes/${quiz.id}`));
      await updateDoc(doc(db, "Modules", moduleId), {
        hasQuiz: false,
        quizId: null,
      });
      setQuiz(null);
      setQuizTitle("");
      setQuestions([
        { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
      ]);
      setModuleData((prev) =>
        prev
          ? {
              ...prev,
              hasQuiz: false,
              quizId: undefined,
            }
          : prev,
      );
      setSuccessMsg("Quiz deleted.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete quiz.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!moduleId) return;
    const confirmed = window.confirm(
      `Delete "${lesson.title}" from this module?`,
    );
    if (!confirmed) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await deleteDoc(doc(db, `Modules/${moduleId}/Lessons/${lesson.id}`));
      await updateDoc(doc(db, "Modules", moduleId), {
        lessonCount: increment(-1),
      });
      if (lesson.mediaPath) {
        await deleteLessonMedia(lesson.mediaPath, lesson.mediaBucket);
      }
      setLessons((prev) => prev.filter((item) => item.id !== lesson.id));
      setModuleData((prev) =>
        prev
          ? {
              ...prev,
              lessonCount: Math.max(0, (prev.lessonCount ?? 1) - 1),
            }
          : prev,
      );
      setSuccessMsg("Lesson deleted.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete lesson.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleDeleteModule = async () => {
    if (!moduleId) return;
    const confirmed = window.confirm(
      "Delete this module, all its lessons, and its quiz? This cannot be undone.",
    );
    if (!confirmed) return;

    setLoading(true);
    setErrorMsg("");
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

      navigate("/staff", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete module.");
      setLoading(false);
    }
  };

  if (moduleLoadState === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-gray-400">
          Loading module data...
        </div>
      </div>
    );
  }

  if (moduleLoadState === "missing" || !moduleData) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Module not found
        </h2>
        <p className="mt-2 text-gray-500">
          This module does not exist or was removed.
        </p>
        <Link
          to="/staff"
          className="mt-6 inline-block font-medium text-primary-600 hover:text-primary-700"
        >
          &larr; Back to Staff Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <Link
          to="/staff"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Staff Portal
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{moduleData.title}</h1>
            <p className="mt-2 text-gray-600">{moduleData.description}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleDeleteModule()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete module
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "lessons"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("lessons")}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Manage Lessons
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "quiz"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("quiz")}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Module Quiz
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

        {/* MESSAGES TAB */}
        {activeTab === "lessons" && (
          <div className="space-y-8">
            <form
              onSubmit={handleSaveModuleDetails}
              className="rounded-xl border border-gray-200 bg-gray-50 p-6"
            >
              <div className="mb-5 flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Edit Module</h2>
              </div>
              <div className="grid gap-5">
                <div>
                  <label
                    className="mb-1 block text-sm font-medium text-gray-700"
                    htmlFor="moduleTitle"
                  >
                    Module title
                  </label>
                  <input
                    id="moduleTitle"
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-sm font-medium text-gray-700"
                    htmlFor="moduleDescription"
                  >
                    Module description
                  </label>
                  <textarea
                    id="moduleDescription"
                    required
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Save module changes
                  </button>
                </div>
              </div>
            </form>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Existing Lessons
              </h2>
              {lessons.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No lessons found. Add one below.
                </p>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {lesson.title}
                            </h3>
                            {lesson.mediaType && (
                              <p className="mt-1 text-xs font-medium capitalize text-gray-500">
                                Includes {lesson.mediaType}: {lesson.mediaName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startLessonEdit(lesson)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteLesson(lesson)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                      {editingLessonId === lesson.id && (
                        <form
                          onSubmit={handleUpdateLesson}
                          className="mt-5 space-y-5 rounded-xl border border-primary-100 bg-white p-5"
                        >
                          <div>
                            <label
                              className="mb-1 block text-sm font-medium text-gray-700"
                              htmlFor={`editLessonTitle-${lesson.id}`}
                            >
                              Lesson title
                            </label>
                            <input
                              id={`editLessonTitle-${lesson.id}`}
                              type="text"
                              required
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                              value={editLessonTitle}
                              onChange={(e) =>
                                setEditLessonTitle(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label
                              className="mb-1 block text-sm font-medium text-gray-700"
                              htmlFor={`editLessonContent-${lesson.id}`}
                            >
                              Lesson content
                            </label>
                            <textarea
                              id={`editLessonContent-${lesson.id}`}
                              rows={8}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                              value={editLessonContent}
                              onChange={(e) =>
                                setEditLessonContent(e.target.value)
                              }
                              placeholder="Update text content, or keep this empty for a media-only lesson."
                            />
                          </div>
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Lesson media
                                </p>
                                {lesson.mediaUrl && !editLessonRemoveMedia && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Current: {lesson.mediaName || "uploaded media"}
                                  </p>
                                )}
                                {editLessonRemoveMedia && (
                                  <p className="mt-1 text-sm font-medium text-red-700">
                                    Current media will be removed on save.
                                  </p>
                                )}
                                {editLessonMediaName && (
                                  <p className="mt-1 text-sm font-medium text-primary-700">
                                    Replacement: {editLessonMediaName}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                                  <Upload className="h-4 w-4" />
                                  Replace media
                                  <input
                                    key={editLessonMediaInputKey}
                                    type="file"
                                    accept="video/*,audio/*"
                                    className="hidden"
                                    onChange={handleEditLessonMediaChange}
                                    disabled={loading}
                                  />
                                </label>
                                {lesson.mediaUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditLessonRemoveMedia(
                                        (remove) => !remove,
                                      );
                                      setEditLessonMediaFile(null);
                                      setEditLessonMediaName("");
                                      setEditLessonMediaInputKey(
                                        (prev) => prev + 1,
                                      );
                                    }}
                                    disabled={loading}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                                      editLessonRemoveMedia
                                        ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                        : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                    }`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {editLessonRemoveMedia
                                      ? "Keep media"
                                      : "Remove media"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              disabled={loading}
                              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                            >
                              <Save className="h-4 w-4" />
                              {loading ? "Saving..." : "Save lesson"}
                            </button>
                            <button
                              type="button"
                              onClick={resetLessonEdit}
                              disabled={loading}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            <form onSubmit={handleCreateLesson} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Lesson
              </h2>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Import lesson from document
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Supports `.txt`, `.md`, `.html`, `.json`, and `.docx`. OpenAI turns
                      the uploaded content into lesson markdown you can edit before saving.
                    </p>
                    {lessonImportName && (
                      <p className="mt-2 text-xs font-medium text-primary-700">
                        Imported: {lessonImportName}
                      </p>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    {lessonImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload document
                    <input
                      type="file"
                      accept=".txt,.md,.markdown,.html,.htm,.json,.docx,text/plain,text/markdown,text/html,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={(e) => void handleLessonDocumentImport(e)}
                      disabled={lessonImporting || loading}
                    />
                  </label>
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Upload video or audio
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Supabase Storage hosts the file so learners can stream it
                      and download it with the lesson.
                    </p>
                    {!isSupabaseConfigured() && (
                      <p className="mt-2 text-xs font-medium text-amber-700">
                        Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before
                        uploading media.
                      </p>
                    )}
                    {lessonMediaName && (
                      <p className="mt-2 text-xs font-medium text-primary-700">
                        Selected: {lessonMediaName}
                      </p>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <Upload className="h-4 w-4" />
                    Select media
                    <input
                      key={lessonMediaInputKey}
                      type="file"
                      accept="video/*,audio/*"
                      className="hidden"
                      onChange={handleLessonMediaChange}
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="lesTitle"
                >
                  Lesson Title
                </label>
                <input
                  id="lesTitle"
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={lesTitle}
                  onChange={(e) => setLesTitle(e.target.value)}
                  placeholder="e.g. Introduction to Local Budgeting"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="lesContent"
                >
                  Lesson Content (Markdown Supported)
                </label>
                <textarea
                  id="lesContent"
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-mono text-sm"
                  value={lesContent}
                  onChange={(e) => setLesContent(e.target.value)}
                  placeholder="Add text content here, or save a media-only lesson after uploading video or audio."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-primary-700 flex items-center justify-center disabled:opacity-50"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                {loading ? "Adding..." : "Add Lesson"}
              </button>
            </form>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quiz" && (
          <div className="space-y-8">
            {quiz ? (
              <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Quiz Already Configured
                    </h2>
                    <p className="text-gray-600 mb-4">
                      This module has a quiz:{" "}
                      <strong className="font-semibold text-gray-900">
                        {quiz.title}
                      </strong>
                    </p>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          quiz.isPaused
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {quiz.isPaused ? "Paused" : "Live"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {quiz.totalMarks} questions
                      </span>
                      <span className="text-sm text-gray-500">
                        Pass mark: {quiz.minimumPassCount ?? Math.ceil((quiz.totalMarks * 2) / 3)}/{quiz.totalMarks}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleSetQuizPaused(!quiz.isPaused)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {quiz.isPaused ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <PauseCircle className="h-4 w-4" />
                        )}
                        {quiz.isPaused ? "Resume quiz" : "Pause quiz"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteQuiz()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete quiz
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateQuiz} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Create Module Assessment
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Add a quiz to assess learner understanding.
                  </p>
                  <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Import quiz from document
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Upload a document and OpenAI will draft
                          multiple-choice questions from its content.
                        </p>
                        {quizImportName && (
                          <p className="mt-2 text-xs font-medium text-primary-700">
                            Imported: {quizImportName}
                          </p>
                        )}
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                        {quizImporting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                        <Upload className="h-4 w-4" />
                        )}
                        Upload document
                        <input
                          type="file"
                          accept=".txt,.md,.markdown,.html,.htm,.json,.docx,text/plain,text/markdown,text/html,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={(e) => void handleQuizDocumentImport(e)}
                          disabled={quizImporting || loading}
                        />
                      </label>
                    </div>
                  </div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="quizTitle"
                  >
                    Assessment Title
                  </label>
                  <input
                    id="quizTitle"
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 max-w-md"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. End of Module Quiz"
                  />
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-900">
                    Learners must get at least{" "}
                    <span className="font-semibold">
                      {minimumPassCount}/{questions.length}
                    </span>{" "}
                    correct to pass ({passingPercentage}%).
                  </div>
                  <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                    Questions
                  </h3>
                  {questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question {qIndex + 1}
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          value={q.questionText}
                          onChange={(e) =>
                            updateQuestion(
                              qIndex,
                              "questionText",
                              e.target.value,
                            )
                          }
                          placeholder="What is the primary function of the council?"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {q.options.map((opt, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === optIndex}
                              onChange={() =>
                                updateQuestion(
                                  qIndex,
                                  "correctAnswer",
                                  optIndex,
                                )
                              }
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <input
                              type="text"
                              required
                              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm ${
                                q.correctAnswer === optIndex
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-gray-300 bg-white"
                              }`}
                              value={opt}
                              onChange={(e) =>
                                updateOption(qIndex, optIndex, e.target.value)
                              }
                              placeholder={`Option ${optIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center gap-1"
                    onClick={() =>
                      setQuestions([
                        ...questions,
                        {
                          questionText: "",
                          options: ["", "", "", ""],
                          correctAnswer: 0,
                        },
                      ])
                    }
                  >
                    <PlusCircle className="w-4 h-4" /> Add Another Question
                  </button>
                </div>

                <hr className="border-gray-100" />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? "Saving Quiz..." : "Save Assessment Configuration"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
