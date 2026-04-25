import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AlertCircle, ArrowRight } from "lucide-react";
import BrandLogo from "../components/brand/BrandLogo";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";

const demoRoles: Array<{
  role: "admin" | "staff" | "learner";
  label: string;
  access: string;
}> = [
  {
    role: "admin",
    label: "Admin demo",
    access: "User management and platform administration",
  },
  {
    role: "staff",
    label: "Staff demo",
    access: "Content publishing and curriculum management",
  },
  {
    role: "learner",
    label: "Learner demo",
    access: "Study modules, quizzes, and feedback",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const { demoLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (caught: unknown) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Failed to sign in. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "staff" | "learner") => {
    try {
      setError("");
      await demoLogin(role);
      navigate(from, { replace: true });
    } catch {
      setError("Failed to initialize demo session.");
    }
  };

  return (
    <div className="page-shell">
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="section-card">
          <span className="eyebrow">Sign in</span>
          <BrandLogo className="mt-5" />
          <h1 className="page-title max-w-xl">
            Access the platform with your account or a demo role.
          </h1>
          <p className="page-description max-w-xl">
            Use demos for quick review, or sign in with your own account to
            continue where you left off.
          </p>

          <div className="mt-6 space-y-3">
            {demoRoles.map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleDemoLogin(item.role)}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-slate-50 px-4 py-4 text-left hover:border-primary-200 hover:bg-primary-50 disabled:opacity-70"
              >
                <div>
                  <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                  <p className="mt-1 text-sm text-ink-600">{item.access}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-500" />
              </button>
            ))}
          </div>
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
