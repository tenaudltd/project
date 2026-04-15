import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, AlertCircle } from "lucide-react";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-center text-sm">
            Sign in to continue your civic education journey. Use the demo
            buttons below to explore without creating an account.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-800"
          >
            Sign up
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 text-center mb-4">
            Demo Accounts
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              disabled={loading}
              className="w-full bg-red-50 text-red-700 hover:bg-red-100 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors border border-red-100 text-left flex items-center justify-between"
            >
              <span>
                Login as <strong className="font-bold">System Admin</strong>
              </span>
              <span className="text-xs opacity-75">Full Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("staff")}
              disabled={loading}
              className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors border border-amber-100 text-left flex items-center justify-between"
            >
              <span>
                Login as <strong className="font-bold">Council Staff</strong>
              </span>
              <span className="text-xs opacity-75">Content Creator</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("learner")}
              disabled={loading}
              className="w-full bg-green-50 text-green-700 hover:bg-green-100 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors border border-green-100 text-left flex items-center justify-between"
            >
              <span>
                Login as{" "}
                <strong className="font-bold">Citizen (Learner)</strong>
              </span>
              <span className="text-xs opacity-75">Read Only</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
