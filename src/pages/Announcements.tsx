import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Announcement } from "../lib/types";
import { Bell, Calendar, Megaphone } from "lucide-react";

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="mt-2 text-gray-600">
          Official notices and updates from the Mushindamo Town Council.
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No active announcements
          </h2>
          <p className="text-gray-500 max-w-sm">
            There are no notices from the council right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-primary-50 rounded-full items-center justify-center text-primary-600">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {announcement.title}
                    </h2>
                    <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md self-start">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(announcement.datePosted).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="prose prose-sm text-gray-600 max-w-none">
                    <p className="whitespace-pre-line">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
