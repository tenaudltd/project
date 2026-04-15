import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

export default function Feedback() {
  const { userProfile } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userProfile) return;

    try {
      setLoading(true);
      setError("");

      await addDoc(collection(db, "Feedback"), {
        userId: userProfile.uid,
        message: message.trim(),
        dateSubmitted: new Date().toISOString(),
      });

      setSuccess(true);
      setMessage("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Community Feedback</h1>
        <p className="mt-2 text-gray-600">
          Share your thoughts, report issues, or suggest improvements to the
          Mushindamo Town Council.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Submit Feedback
          </h2>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3 border border-green-100">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Feedback Submitted Successfully</h3>
              <p className="text-sm mt-1">
                Thank you! Your feedback has been securely sent to the council
                staff.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="message"
            >
              Your Message
            </label>
            <textarea
              id="message"
              required
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-y"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-primary-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center flex"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
