import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Module } from "../lib/types";
import { Award, ChevronLeft, Printer } from "lucide-react";

export default function Certificate() {
  const { id: moduleId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quiz") || "";
  const { userProfile } = useAuth();

  const [moduleTitle, setModuleTitle] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [issuedAt, setIssuedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!moduleId || !quizId || !userProfile?.uid) {
        setMissing(true);
        setLoading(false);
        return;
      }
      try {
        const modSnap = await getDoc(doc(db, "Modules", moduleId));
        if (modSnap.exists()) {
          const data = modSnap.data() as Partial<Module>;
          setModuleTitle(data.title || "Civic module");
        }
        const q = query(
          collection(db, "Results"),
          where("userId", "==", userProfile.uid),
          where("quizId", "==", quizId),
        );
        const res = await getDocs(q);
        if (res.empty) {
          setMissing(true);
        } else {
          const row = res.docs[0].data();
          setScore(typeof row.score === "number" ? row.score : 0);
          setIssuedAt(
            typeof row.dateTaken === "string"
              ? row.dateTaken
              : new Date().toISOString(),
          );
        }
      } catch (e) {
        console.error(e);
        setMissing(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [moduleId, quizId, userProfile?.uid]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (missing || score === null) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-gray-600">
          Certificate not available. Complete the module quiz first, or check
          the link.
        </p>
        <Link
          to="/modules"
          className="mt-6 inline-flex items-center font-medium text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to modules
        </Link>
      </div>
    );
  }

  const displayDate = new Date(issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 print:hidden">
        <Link
          to={`/modules/${moduleId}/quizzes/${quizId}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to assessment
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      <div
        className="rounded-2xl border-8 border-double border-primary-200 bg-gradient-to-b from-white to-primary-50/30 px-8 py-14 text-center shadow-lg print:border-gray-400 print:shadow-none"
        id="certificate-print"
      >
        <Award className="mx-auto mb-6 h-16 w-16 text-primary-500 print:text-gray-700" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
          Certificate of completion
        </p>
        <h1 className="mt-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl">
          {userProfile?.fullName || "Learner"}
        </h1>
        <p className="mt-6 text-gray-600">
          has successfully completed the civic education module
        </p>
        <p className="mt-3 font-serif text-2xl font-semibold text-gray-900">
          {moduleTitle || "Module"}
        </p>
        <p className="mt-8 text-sm text-gray-500">
          Assessment score:{" "}
          <span className="font-bold text-gray-900">{score}%</span>
        </p>
        <p className="mt-10 text-sm text-gray-500">Issued on {displayDate}</p>
        <div className="mt-12 border-t border-gray-200 pt-6">
          <p className="font-serif text-lg italic text-gray-700">
            Mushindamo Town Council
          </p>
          <p className="text-xs text-gray-400">CivicEd Mushindamo platform</p>
        </div>
      </div>
    </div>
  );
}
