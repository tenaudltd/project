import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  HelpCircle,
  LifeBuoy,
  Mail,
  Shield,
} from "lucide-react";

const faqItems = [
  {
    q: "Who can use CivicEd Mushindamo?",
    a: "Residents can register as learners. Council staff and administrators use higher access levels for content and operations.",
  },
  {
    q: "How is progress tracked?",
    a: "Completed lessons, quizzes, bookmarks, and module progress are stored against the learner profile.",
  },
  {
    q: "What happens after a quiz?",
    a: "Scores are shown immediately, and qualifying learners can open a certificate for the module.",
  },
  {
    q: "How do I send feedback?",
    a: "Learners can use the Feedback page in the signed-in navigation to submit messages to council staff.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. Register as a learner to study modules, or sign in with credentials your council has given you for staff or admin access.",
  },
];

function FaqRow({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-ink-100 bg-slate-50 px-5 py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left text-base font-semibold text-ink-900"
      >
        {question}
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-ink-500 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="pt-4 text-sm text-ink-600">{answer}</p>}
    </div>
  );
}

export default function Help() {
  return (
    <div className="page-shell max-w-6xl">
      <section className="page-header">
        <span className="eyebrow">Help and guidance</span>
        <h1 className="page-title">Answers to the questions people ask first.</h1>
        <p className="page-description">
          Use this page to understand roles, learning flow, and how to get
          started.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="section-card">
          <h2 className="mb-5 flex items-center gap-3 text-2xl text-ink-900">
            <HelpCircle className="h-6 w-6 text-primary-700" />
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <FaqRow key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <article className="metric-card">
            <LifeBuoy className="h-8 w-8 text-primary-700" />
            <h3 className="mt-4 text-xl text-ink-900">Getting started</h3>
            <p className="mt-2 text-sm text-ink-600">
              Create an account or sign in with your email and password from the
              login page.
            </p>
          </article>
          <article className="metric-card">
            <BookOpen className="h-8 w-8 text-primary-700" />
            <h3 className="mt-4 text-xl text-ink-900">Learning flow</h3>
            <p className="mt-2 text-sm text-ink-600">
              Start with modules, complete lessons, take the quiz, then open a
              certificate when available.
            </p>
          </article>
          <article className="metric-card">
            <Shield className="h-8 w-8 text-primary-700" />
            <h3 className="mt-4 text-xl text-ink-900">Roles</h3>
            <p className="mt-2 text-sm text-ink-600">
              Learners study. Staff publish content. Admins manage users and
              broader platform operations.
            </p>
          </article>
        </div>
      </section>

      <section className="section-card text-center">
        <Mail className="mx-auto h-6 w-6 text-primary-700" />
        <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-600">
          Already registered? Sign in to pick up where you left off.
        </p>
        <Link to="/login" className="button-primary mt-6">
          Go to login
        </Link>
      </section>
    </div>
  );
}
