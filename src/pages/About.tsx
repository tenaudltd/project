import { Flag, History, Landmark, Layers3 } from "lucide-react";

const pillars = [
  {
    icon: Flag,
    title: "Mission",
    copy:
      "Help residents understand local government, public services, rights, and participation.",
  },
  {
    icon: History,
    title: "Why it exists",
    copy:
      "Traditional sensitization reaches limited audiences. This platform extends that work online.",
  },
  {
    icon: Landmark,
    title: "Public value",
    copy:
      "Council information becomes easier to publish, read, and revisit over time.",
  },
  {
    icon: Layers3,
    title: "Platform approach",
    copy:
      "Learning, announcements, staff tools, and user management all use one product structure.",
  },
];

export default function About() {
  return (
    <div className="page-shell max-w-6xl">
      <section className="page-header">
        <span className="eyebrow">About CivicEd</span>
        <h1 className="page-title max-w-4xl">
          A simpler civic education platform for Mushindamo Town Council.
        </h1>
        <p className="page-description">
          The platform is designed to make civic learning easier to access,
          easier to manage, and easier to trust.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="metric-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <pillar.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl text-ink-900">{pillar.title}</h2>
            <p className="mt-2 text-sm text-ink-600">{pillar.copy}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-card">
          <span className="eyebrow">What changed</span>
          <h2 className="mt-4 text-2xl text-ink-900">
            The product now follows one navigation model and one reading rhythm.
          </h2>
          <p className="mt-3 text-sm text-ink-600">
            Users no longer move between unrelated layouts. Public pages,
            learner pages, and content pages now share the same spacing,
            cards, buttons, and form patterns.
          </p>
        </div>
        <div className="section-card">
          <span className="eyebrow">Expected outcome</span>
          <p className="mt-4 text-lg text-ink-700">
            Residents should be able to understand what the platform offers,
            where to go next, and how to continue learning within a few seconds.
          </p>
        </div>
      </section>
    </div>
  );
}
