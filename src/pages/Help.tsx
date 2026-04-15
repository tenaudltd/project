import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  HelpCircle,
  LifeBuoy,
  Mail,
  Shield,
} from "lucide-react";
import { useState } from "react";

const faqItems = [
  {
    q: "Who can use CivicEd Mushindamo?",
    a: "Residents and community members can register as learners. Council staff and administrators manage content and user roles after approval.",
  },
  {
    q: "How do I track my progress?",
    a: "As you move through lessons, your progress is saved to your account. The modules list and dashboard show how far you have come in each module.",
  },
  {
    q: "What happens after I pass a quiz?",
    a: "You will see your score immediately. You can open a printable certificate of completion from the assessment screen to share or keep for your records.",
  },
  {
    q: "How do I send feedback to the council?",
    a: "Registered learners can use the Feedback page from the sidebar to submit messages securely to council staff.",
  },
  {
    q: "Is my data secure?",
    a: "This demonstration uses Firebase Authentication and Firestore. In production, the council would publish a full privacy policy and align storage with national data-protection expectations.",
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
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-gray-900 hover:text-primary-700"
      >
        {question}
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-gray-600">{answer}</p>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <LifeBuoy className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Help &amp; FAQ</h1>
        <p className="mt-3 text-gray-600">
          Quick answers for your final-year project demo and for real learners
          exploring the platform.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <HelpCircle className="h-5 w-5 text-primary-600" />
          Frequently asked questions
        </h2>
        <div>
          {faqItems.map((item) => (
            <FaqRow key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <BookOpen className="mb-3 h-8 w-8 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Learning tips</h3>
          <p className="mt-2 text-sm text-gray-600">
            Work through lessons in order, then take the module quiz. You can
            bookmark modules from the modules list to find them quickly later.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Shield className="mb-3 h-8 w-8 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Roles</h3>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Learners</strong> study and give feedback.{" "}
            <strong>Staff</strong> create modules and announcements.{" "}
            <strong>Admins</strong> manage users and see platform analytics.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/50 p-6 text-center">
        <Mail className="mx-auto mb-2 h-6 w-6 text-primary-600" />
        <p className="text-sm text-gray-700">
          For this academic prototype, use the demo login on the sign-in page to
          try each role without registering.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block text-sm font-semibold text-primary-700 hover:text-primary-900"
        >
          Go to login →
        </Link>
      </div>
    </div>
  );
}
