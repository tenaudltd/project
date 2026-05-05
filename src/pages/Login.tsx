import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AlertCircle } from "lucide-react";
import BrandLogo from "../components/brand/BrandLogo";
import { firebaseAuthMessage } from "../lib/firebaseAuthErrors";
import { auth } from "../lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (caught: unknown) {
      setError(
        firebaseAuthMessage(
          caught,
          "Couldn’t sign in. Please check your email and password.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="section-card">
          <span className="eyebrow">Sign in</span>
          <BrandLogo className="mt-5" />
          <h1 className="page-title max-w-xl">
            Sign in to continue your learning and track your progress.
          </h1>
          <p className="page-description max-w-xl">
            Use the email and password for your CivicEd account. New learners can
            register in a few steps.
          </p>
        </div>

        <section className="section-card">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink-500">
            Account access
          </p>
          <h2 className="mt-3 text-3xl text-ink-900">Welcome back</h2>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-coral-200 bg-coral-50 p-4 text-sm text-coral-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              <label
                className="mb-2 block text-sm font-medium text-ink-700"
                htmlFor="password"
              >
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

            <button type="submit" disabled={loading} className="button-primary w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800">
              Create one
            </Link>
          </p>
        </section>
      </section>
    </div>
  );
}
