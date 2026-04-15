import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  FileText,
  HelpCircle,
  PlusCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import type { Lesson, Module, Quiz } from "../lib/types";

export default function StaffModuleManager() {
  const { id: moduleId } = useParams<{ id: string }>();
  // const { userProfile } = useAuth();

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [moduleLoadState, setModuleLoadState] = useState<
    "loading" | "ok" | "missing"
  >("loading");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [activeTab, setActiveTab] = useState<"lessons" | "quiz">("lessons");

  // Lesson form state
  const [lesTitle, setLesTitle] = useState("");
  const [lesContent, setLesContent] = useState("");

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchModuleData = useCallback(async () => {
    if (!moduleId) return;
    setModuleLoadState("loading");
    try {
      const docSnap = await getDoc(doc(db, "Modules", moduleId));
      if (docSnap.exists()) {
        setModuleData({ id: docSnap.id, ...docSnap.data() } as Module);
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
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setQuiz({ id: docSnap.id, ...docSnap.data() } as Quiz);
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
    if (!moduleId || !lesTitle.trim() || !lesContent.trim()) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, `Modules/${moduleId}/Lessons`), {
        moduleId,
        title: lesTitle.trim(),
        content: lesContent.trim(),
        createdAt: new Date().toISOString(),
      });
      setSuccessMsg("Lesson added successfully.");
      setLesTitle("");
      setLesContent("");
      fetchLessons();
    } catch (err: unknown) {
      setErrorMsg("Failed to add lesson.");
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

      await addDoc(collection(db, `Modules/${moduleId}/Quizzes`), {
        moduleId,
        title: quizTitle.trim(),
        totalMarks: formattedQuestions.length,
        questions: formattedQuestions,
        createdAt: new Date().toISOString(),
      });

      setSuccessMsg("Quiz created successfully.");
      fetchQuiz();
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
        <h1 className="text-3xl font-bold text-gray-900">{moduleData.title}</h1>
        <p className="mt-2 text-gray-600">{moduleData.description}</p>
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
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {lesson.title}
                        </h3>
                      </div>
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
                  required
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-mono text-sm"
                  value={lesContent}
                  onChange={(e) => setLesContent(e.target.value)}
                  placeholder="Content here..."
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
                    <p className="text-sm text-gray-500">
                      It contains {quiz.totalMarks} questions. In this version
                      of the platform, editing an existing quiz is disabled.
                    </p>
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
