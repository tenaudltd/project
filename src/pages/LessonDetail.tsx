import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Lesson } from "../lib/types";
import { ChevronLeft, ChevronRight, FileText, CheckCircle } from "lucide-react";

export default function LessonDetail() {
  const { id: moduleId } = useParams<{ id: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!moduleId) return;
      try {
        const q = query(
          collection(db, `Modules/${moduleId}/Lessons`),
          orderBy("createdAt", "asc"),
        );
        const querySnapshot = await getDocs(q);
        const fetched: Lesson[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Lesson);
        });
        setLessons(fetched);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchQuiz = async () => {
      if (!moduleId) return;
      try {
        const qz = query(
          collection(db, `Modules/${moduleId}/Quizzes`),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(qz);
        if (!snapshot.empty) {
          setQuizId(snapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching quiz", error);
      }
    };
    
    fetchLessons();
    fetchQuiz();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="max-w-4xl mx-auto rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          No lessons found
        </h2>
        <p className="text-gray-500 mt-2 mb-6">
          This module currently does not have any lessons.
        </p>
        <Link
          to="/modules"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          &larr; Back to Modules
        </Link>
      </div>
    );
  }

  const currentLesson = lessons[currentLessonIndex];
  const isFirst = currentLessonIndex === 0;
  const isLast = currentLessonIndex === lessons.length - 1;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <Link
          to="/modules"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Modules
        </Link>
        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium mb-2">
          <span>
            Lesson {currentLessonIndex + 1} of {lessons.length}
          </span>
          <div className="h-1.5 w-full bg-gray-100 rounded-full flex-1 overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{
                width: `${((currentLessonIndex + 1) / lessons.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {currentLesson?.title}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex-1 prose prose-lg prose-primary max-w-none">
        {currentLesson?.content ? (
          <div
            dangerouslySetInnerHTML={{
              __html: currentLesson.content.replace(/\n/g, "<br/>"),
            }}
          />
        ) : (
          <p className="text-gray-500 italic">
            No content available for this lesson.
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          onClick={() => setCurrentLessonIndex((prev) => prev - 1)}
          disabled={isFirst}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {!isLast ? (
          <button
            onClick={() => setCurrentLessonIndex((prev) => prev + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Next Lesson
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : quizId ? (
          <Link
            to={`/modules/${moduleId}/quizzes/${quizId}`}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all hover:shadow"
          >
            Take Complete Module Test
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            to={`/modules`}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all hover:shadow"
          >
            Complete Module
            <CheckCircle className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
