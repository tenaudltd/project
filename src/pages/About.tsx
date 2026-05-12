import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Flag, History, Landmark, Layers3 } from "lucide-react";
import { db } from "../lib/firebase";
import { defaultSiteContent, mergeSiteContent } from "../lib/siteContent";
import type { SiteContent } from "../lib/types";

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
  const [siteContent, setSiteContent] =
    useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        const snapshot = await getDoc(doc(db, "SiteContent", "public"));
        if (snapshot.exists()) {
          setSiteContent(mergeSiteContent(snapshot.data()));
        }
      } catch (error) {
        console.error("Error fetching site content:", error);
      }
    };
    void fetchSiteContent();
  }, []);

  return (
    <div className="page-shell max-w-6xl">
      <section className="page-header">
        <span className="eyebrow">{siteContent.aboutEyebrow}</span>
        <h1 className="page-title max-w-4xl">
          {siteContent.aboutTitle}
        </h1>
        <p className="page-description">{siteContent.aboutDescription}</p>
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
            {siteContent.aboutFocusTitle}
          </h2>
          <p className="mt-3 text-sm text-ink-600">{siteContent.aboutFocusBody}</p>
        </div>
        <div className="section-card">
          <span className="eyebrow">Expected outcome</span>
          <p className="mt-4 text-lg text-ink-700">{siteContent.aboutOutcome}</p>
        </div>
      </section>
    </div>
  );
}
