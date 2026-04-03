import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, CheckCircle, Clock, Bell } from "lucide-react";
import {
  collection,
  query,
  getDocs,
  limit,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Announcement } from "../lib/types";

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([]);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(
          collection(db, "Announcements"),
          orderBy("datePosted", "desc"),
          limit(3),
        );
        const querySnapshot = await getDocs(q);
        const fetched: Announcement[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setRecentAnnouncements(fetched);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    const fetchStats = async () => {
      if (!userProfile?.uid) return;
      try {
        const qStats = query(
          collection(db, "Results"),
          where("userId", "==", userProfile.uid),
        );
        const resSnap = await getDocs(qStats);
        setCompletedQuizzes(resSnap.size);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchAnnouncements();
    fetchStats();
  }, [userProfile?.uid]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.fullName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening in Mushindamo's civic space today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats Cards */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-start gap-4 flex-col justify-between">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Modules Enrolled
            </p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-start gap-4 flex-col justify-between">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Quizzes Completed
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {completedQuizzes}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-start gap-4 flex-col justify-between">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Learning Hours</p>
            <p className="text-2xl font-bold text-gray-900">0h</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Announcements Section */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Council Notices
            </h2>
          </div>
          <div className="space-y-4">
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-gray-500">No recent announcements.</p>
            ) : (
              recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="group">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {announcement.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {announcement.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Continue Learning
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              No active modules
            </p>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              You haven't started any learning modules yet.
            </p>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Browse Modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
