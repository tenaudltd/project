import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { UserProfile } from "../lib/types";
import { Users, Shield, Loader2, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const fetched: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      });
      setUsers(fetched);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, { role: newRole });
      setSuccess("User role updated successfully.");
      fetchUsers(); // Refresh list
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Control Panel
        </h1>
        <p className="mt-2 text-gray-600">
          Manage all registered users and assign platform roles securely.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              System Users
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <Users className="w-4 h-4" />
            {users.length} Total Users
          </div>
        </div>

        {success && (
          <div className="m-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3 border border-green-100">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${
                          user.role === "admin"
                            ? "bg-red-50 text-red-700"
                            : user.role === "staff"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-1.5 pl-3 pr-8"
                        value={user.role}
                        onChange={(e) =>
                          updateUserRole(user.uid, e.target.value)
                        }
                      >
                        <option value="learner">Learner</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
