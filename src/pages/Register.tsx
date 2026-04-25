import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AlertCircle } from "lucide-react";
import BrandLogo from "../components/brand/BrandLogo";
import { auth, db } from "../lib/firebase";
import type { UserProfile } from "../lib/types";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const userProfile: Omit<UserProfile, "uid"> = {
        fullName,
        email,
        phoneNumber,
        role: "learner",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "Users", user.uid), userProfile);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create an account.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="section-card">
          <span className="eyebrow">Create account</span>
          <BrandLogo className="mt-5" />
          <h1 className="page-title max-w-xl">
            Register once and keep your learning progress in one place.
          </h1>
          <p className="page-description max-w-xl">
            New accounts are created as learner profiles by default. You can
            then access modules, quizzes, certificates, and feedback.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-ink-900">Included with a learner account</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li>Module progress tracking</li>
              <li>Quiz results and certificates</li>
              <li>Access to council announcements</li>
              <li>Feedback submission tools</li>
            </ul>
          </div>
        </div>

        <section className="section-card">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink-500">
            New learner profile
          </p>
          <h2 className="mt-3 text-3xl text-ink-900">Register</h2>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-coral-200 bg-coral-50 p-4 text-sm text-coral-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-ink-700" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                className="field-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                className="field-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+260 97..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-ink-700"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="field-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="button-primary w-full">
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-ink-600">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
              Sign in
            </Link>
          </p>
        </section>
      </section>
    </div>
  );
}
