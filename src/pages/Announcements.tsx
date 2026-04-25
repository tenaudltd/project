import { useEffect, useState } from "react";
import { Bell, Calendar, Megaphone } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Announcement } from "../lib/types";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(
          collection(db, "Announcements"),
          orderBy("datePosted", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const fetched: Announcement[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setAnnouncements(fetched);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="page-shell max-w-5xl">
      <section className="page-header">
        <span className="eyebrow">Announcements</span>
        <h1 className="page-title">Official updates from Mushindamo Town Council.</h1>
        <p className="page-description">
          Recent notices are listed in date order so residents can scan what is
          new without searching through the platform.
        </p>
      </section>

      {announcements.length === 0 ? (
        <section className="empty-state">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-ink-400">
            <Bell className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink-900">
            No active announcements
          </h2>
          <p className="mt-2 max-w-sm text-sm text-ink-600">
            There are no recent notices from the council right now.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="section-card">
              <div className="flex gap-4">
                <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:flex">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-xl font-semibold text-ink-900">
                      {announcement.title}
                    </h2>
                    <div className="flex items-center rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-ink-600">
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      {new Date(announcement.datePosted).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-ink-600">
                    {announcement.message}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
