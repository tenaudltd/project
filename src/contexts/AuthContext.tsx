import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { UserProfile } from "../lib/types";

export type AppUser = User | { uid: string; email: string; isDemo: boolean };

interface AuthContextType {
  currentUser: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  demoLogin: (role: "admin" | "staff" | "learner") => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch role and other profile info from Firestore
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            setUserProfile({ uid: user.uid, ...userDoc.data() } as UserProfile);
          } else {
            console.warn("User document not found in Firestore for:", user.uid);
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    if ((currentUser as { isDemo?: boolean })?.isDemo) {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    await firebaseSignOut(auth);
  };

  const demoLogin = (role: "admin" | "staff" | "learner") => {
    const fakeUid = `demo-${role}-123`;
    const fakeUser = {
      uid: fakeUid,
      email: `${role}@mushindamo.gov.zm`,
      isDemo: true, // Custom flag to bypass firebase checks
    };
    const fakeProfile: UserProfile = {
      uid: fakeUid,
      fullName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: fakeUser.email,
      phoneNumber: "+260000000000",
      role,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(fakeUser);
    setUserProfile(fakeProfile);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signOut,
    demoLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
