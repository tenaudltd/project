import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Quiz, Question } from "../lib/types";
import { HelpCircle, CheckCircle, AlertCircle, Award } from "lucide-react";

export default function QuizView() {
  const { id: moduleId, quizId } = useParams<{ id: string; quizId: string }>();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
    checkIfAlreadyTaken();
  }, [moduleId, quizId]);

  const fetchQuiz = async () => {
    if (!moduleId || !quizId) return;
    try {
      const docSnap = await getDoc(
        doc(db, `Modules/${moduleId}/Quizzes/${quizId}`),
      );
      if (docSnap.exists()) {
        setQuiz({ id: docSnap.id, ...docSnap.data() } as Quiz);
      } else {
        setErrorMsg("Quiz not found.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  };

  const checkIfAlreadyTaken = async () => {
    if (!quizId || !userProfile) return;
    try {
      const q = query(
        collection(db, "Results"),
        where("quizId", "==", quizId),
        where("userId", "==", userProfile.uid),
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setIsSubmitted(true);
        setScore(snapshot.docs[0].data().score);
      }
    } catch (err) {
      console.error("Error checking past results", err);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (!quiz || !userProfile) return;

    // Validate that all questions are answered
    if (Object.keys(answers).length < quiz.questions.length) {
      setErrorMsg("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    // Grade quiz
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);

    try {
      await addDoc(collection(db, "Results"), {
        userId: userProfile.uid,
        quizId: quiz.id,
        moduleId: quiz.moduleId,
        score: finalScore,
        dateTaken: new Date().toISOString(),
      });
      setScore(finalScore);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save results. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading assessment...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Quiz Unavailable
        </h2>
        <p className="text-gray-500 mb-6">{errorMsg}</p>
        <button
          onClick={() => navigate(`/modules`)}
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          &larr; Return to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-start gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {quiz.title}
            </h1>
            <p className="text-gray-600 border-l-2 border-primary-200 pl-3">
              This assessment contains {quiz.totalMarks} questions. Please read
              each carefully before answering.
            </p>
          </div>
        </div>

        {errorMsg && !isSubmitted && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-12">
            <Award className="w-20 h-20 text-primary-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Assessment Complete!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You've successfully finished this module's required assessment.
            </p>
            <div className="inline-flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-100 mb-8 min-w-[200px]">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Final Score
              </span>
              <span
                className={`text-6xl font-black ${score >= 70 ? "text-green-600" : "text-primary-600"}`}
              >
                {score}%
              </span>
            </div>
            <div>
              <button
                onClick={() => navigate(`/dashboard`)}
                className="bg-primary-600 text-white rounded-lg px-8 py-3 font-medium hover:bg-primary-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {quiz.questions.map((q: Question, qIndex: number) => (
              <div key={q.id} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                  <span className="text-gray-400 font-bold mr-2">
                    {qIndex + 1}.
                  </span>
                  {q.questionText}
                </h3>
                <div className="space-y-3 pl-6">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = answers[q.id] === optIndex;
                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, optIndex)}
                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary-600 bg-primary-50 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "border-primary-600"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />
                            )}
                          </div>
                          <span
                            className={`${isSelected ? "font-medium text-primary-900" : "text-gray-700"}`}
                          >
                            {opt}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Answered: {Object.keys(answers).length} /{" "}
                {quiz.questions.length}
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary-600 text-white rounded-lg px-8 py-3 font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
