import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import type { Feedback as FeedbackItem } from "../lib/types";

export default function Feedback() {
  const { userProfile } = useAuth();
  const canManageFeedback =
    userProfile?.role === "staff" || userProfile?.role === "admin";
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [message, setMessage] = useState("");
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const pageCopy = useMemo(
    () =>
      canManageFeedback
        ? {
            title: "Feedback Inbox",
            description:
              "Review learner messages and respond so residents can see council feedback in their account.",
          }
        : {
            title: "Community Feedback",
            description:
              "Share your thoughts, report issues, or suggest improvements to the Mushindamo Town Council.",
          },
    [canManageFeedback],
  );

  const fetchFeedback = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const feedbackQuery = canManageFeedback
        ? query(collection(db, "Feedback"), orderBy("dateSubmitted", "desc"))
        : query(
            collection(db, "Feedback"),
            where("userId", "==", userProfile.uid),
          );
      const querySnapshot = await getDocs(feedbackQuery);
      const fetched: FeedbackItem[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as FeedbackItem);
      });
      fetched.sort(
        (a, b) =>
          new Date(b.dateSubmitted).getTime() -
          new Date(a.dateSubmitted).getTime(),
      );
      setFeedbackItems(fetched);
      setDraftResponses(
        Object.fromEntries(
          fetched.map((item) => [item.id, item.response || ""]),
        ),
      );
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  }, [canManageFeedback, userProfile]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userProfile) return;

    try {
      setSubmitting(true);
      setError("");

      const created = {
        userId: userProfile.uid,
        userName: userProfile.fullName,
        userEmail: userProfile.email,
        message: message.trim(),
        status: "open" as const,
        dateSubmitted: new Date().toISOString(),
      };
      const feedbackRef = await addDoc(collection(db, "Feedback"), created);

      setFeedbackItems((prev) => [{ id: feedbackRef.id, ...created }, ...prev]);
      setSuccess("Feedback submitted successfully.");
      setMessage("");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: unknown) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveResponse = async (item: FeedbackItem) => {
    if (!userProfile) return;
    const response = (draftResponses[item.id] || "").trim();
    if (!response) return;

    setSavingId(item.id);
    setError("");
    try {
      const updated = {
        response,
        status: "responded" as const,
        respondedAt: new Date().toISOString(),
        respondedBy: userProfile.uid,
        responderName: userProfile.fullName,
      };
      await updateDoc(doc(db, "Feedback", item.id), updated);
      setFeedbackItems((prev) =>
        prev.map((feedback) =>
          feedback.id === item.id ? { ...feedback, ...updated } : feedback,
        ),
      );
      setSuccess("Response saved.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Error saving response:", err);
      setError("Failed to save response.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{pageCopy.title}</h1>
        <p className="mt-2 text-gray-600">{pageCopy.description}</p>
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
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {!canManageFeedback && (
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Submit Feedback
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="message"
              >
                Your Message
              </label>
              <textarea
                id="message"
                required
                rows={6}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="flex items-center rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <section className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {canManageFeedback ? "Incoming feedback" : "Your feedback history"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {canManageFeedback
                ? "Save a response to mark the message as responded."
                : "Council responses will appear below your messages."}
            </p>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-gray-600">
            {feedbackItems.length} items
          </span>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : feedbackItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            No feedback found.
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.userName || "Learner"}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.userEmail || item.userId} ·{" "}
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

                <p className="mt-4 whitespace-pre-line text-sm text-gray-700">
                  {item.message}
                </p>

                {canManageFeedback ? (
                  <div className="mt-5 space-y-3">
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor={`response-${item.id}`}
                    >
                      Staff response
                    </label>
                    <textarea
                      id={`response-${item.id}`}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      value={draftResponses[item.id] || ""}
                      onChange={(e) =>
                        setDraftResponses((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Write the official response..."
                    />
                    <button
                      type="button"
                      disabled={savingId === item.id || !draftResponses[item.id]?.trim()}
                      onClick={() => void handleSaveResponse(item)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {savingId === item.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Save response
                    </button>
                  </div>
                ) : item.response ? (
                  <div className="mt-5 rounded-lg border border-green-100 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                      Council response
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                      {item.response}
                    </p>
                    {item.responderName && (
                      <p className="mt-3 text-xs text-gray-500">
                        Responded by {item.responderName}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                    Awaiting council response.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
