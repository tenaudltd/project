import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function Settings() {
  const { userProfile } = useAuth();
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(
    userProfile?.phoneNumber || "",
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setLoading(true);
      setError("");

      const userRef = doc(db, "Users", userProfile.uid);
      await updateDoc(userRef, {
        fullName,
        phoneNumber,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-gray-600">
          Update your personal information and preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Profile Information
          </h2>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3 border border-green-100">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">Profile updated successfully!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address{" "}
                <span className="text-gray-400 font-normal">
                  (Cannot be changed)
                </span>
              </label>
              <input
                type="email"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-500 px-4 py-2 cursor-not-allowed"
                value={userProfile?.email || ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                value={phoneNumber || ""}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+260 97..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role
              </label>
              <input
                type="text"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-500 px-4 py-2 cursor-not-allowed capitalize"
                value={userProfile?.role || "Learner"}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center flex gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
