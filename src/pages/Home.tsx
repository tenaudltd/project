import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpen, Megaphone, Users } from "lucide-react";
import BrandLogo from "../components/brand/BrandLogo";

const highlights = [
  {
    icon: BookOpen,
    title: "Structured lessons",
    copy: "Study modules in a clear order and return where you left off.",
  },
  {
    icon: Award,
    title: "Quizzes and certificates",
    copy: "Measure progress and generate proof of completion when eligible.",
  },
  {
    icon: Megaphone,
    title: "Council announcements",
    copy: "Read official updates in one place without digging through screens.",
  },
  {
    icon: Users,
    title: "Role-based access",
    copy: "Learners, staff, and admins each get the tools they actually need.",
  },
];

export default function Home() {
  return (
    <div className="page-shell">
      <section className="page-header">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <span className="eyebrow">Civic learning platform</span>
            <BrandLogo className="mt-5" />
            <h1 className="page-title max-w-3xl">
              Learn how local government works without fighting the interface.
            </h1>
            <p className="page-description">
              CivicEd Mushindamo gives residents a simple way to study modules,
              follow announcements, and track progress from one consistent
              platform.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="button-primary gap-2">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="button-secondary">
                Try demo access
              </Link>
            </div>
          </div>

          <div className="section-card bg-white/80">
            <p className="text-sm font-semibold text-ink-900">What you can do</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-ink-900">
                  Start with modules
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Follow lesson-by-lesson learning content designed for residents.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-ink-900">
                  Keep up with council notices
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Read updates and announcements in a dedicated section.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-ink-900">
                  Track your progress
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Pick up where you stopped and review quizzes and certificates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <article key={item.title} className="metric-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl text-ink-900">{item.title}</h2>
            <p className="mt-2 text-sm text-ink-600">{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="section-card">
          <span className="eyebrow">Simple journey</span>
          <h2 className="mt-4 text-2xl text-ink-900">How people move through the platform</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="text-sm font-semibold text-ink-900">1. Sign in or use a demo</p>
              <p className="mt-1 text-sm text-ink-600">
                Choose learner, staff, or admin access depending on what you need.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="text-sm font-semibold text-ink-900">2. Open modules and complete lessons</p>
              <p className="mt-1 text-sm text-ink-600">
                Progress is tracked so you can continue later without starting over.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="text-sm font-semibold text-ink-900">3. Review results and announcements</p>
              <p className="mt-1 text-sm text-ink-600">
                The dashboard pulls your next step and recent notices into one place.
              </p>
            </div>
          </div>
        </div>

        <div className="section-card">
          <span className="eyebrow">Built for clarity</span>
          <h2 className="mt-4 text-2xl text-ink-900">
            The interface now prioritizes reading, navigation, and next actions.
          </h2>
          <p className="mt-3 text-sm text-ink-600">
            Instead of oversized marketing panels and shifting layouts, the app
            uses one predictable structure across public pages and authenticated
            pages.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/about" className="button-secondary">
              About the platform
            </Link>
            <Link to="/help" className="button-secondary">
              Help and FAQ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
