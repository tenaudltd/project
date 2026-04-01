import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Module } from "../lib/types";
import { BookOpen, ChevronRight, LayoutTemplate } from "lucide-react";

export default function ModulesList() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const q = query(
          collection(db, "Modules"),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const fetched: Module[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Module);
        });
        setModules(fetched);
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
        <p className="mt-2 text-gray-600">
          Explore the civic education curriculum designed for Mushindamo
          residents.
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <LayoutTemplate className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No modules available
          </h2>
          <p className="text-gray-500 max-w-sm">
            The staff council hasn't uploaded any learning modules yet. Check
            back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.id}
              className="group rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-100 transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {module.title}
                </h2>
                <p className="text-sm text-gray-600 flex-1 line-clamp-3 mb-4">
                  {module.description}
                </p>
                <Link
                  to={`/modules/${module.id}/lessons/start`}
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mt-auto"
                >
                  Start Module
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
