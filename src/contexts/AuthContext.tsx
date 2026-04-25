import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { Role, UserProfile } from "../lib/types";

export type AppUser = User | { uid: string; email: string; isDemo: boolean };

const DEMO_SESSION_KEY = "civicDemoSession";

interface AuthContextType {
  currentUser: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoSession: boolean;
  signOut: () => Promise<void>;
  demoLogin: (role: "admin" | "staff" | "learner") => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function readDemoRoleFromStorage(): Role | null {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { role?: Role };
    if (!parsed?.role) return null;
    if (
      parsed.role !== "admin" &&
      parsed.role !== "staff" &&
      parsed.role !== "learner"
    ) {
      return null;
    }
    return parsed.role;
  } catch {
    return null;
  }
}

function writeDemoToStorage(role: Role) {
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ role }));
}

function clearDemoStorage() {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

function buildDemoProfile(uid: string, role: Role): UserProfile {
  return {
    uid,
    fullName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email: `${role}@mushindamo.gov.zm`,
    phoneNumber: "+260000000000",
    role,
    createdAt: new Date().toISOString(),
  };
}

function buildClientOnlyDemo(role: Role) {
  const fakeUid = `demo-${role}-123`;
  const fakeUser = {
    uid: fakeUid,
    email: `${role}@mushindamo.gov.zm`,
    isDemo: true,
  };
  return {
    user: fakeUser as AppUser,
    profile: buildDemoProfile(fakeUid, role),
  };
}

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
      if (user?.isAnonymous) {
        const role = readDemoRoleFromStorage();
        if (role) {
          setCurrentUser(user);
          setUserProfile(buildDemoProfile(user.uid, role));
          setLoading(false);
          return;
        }
        await firebaseSignOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      if (user) {
        clearDemoStorage();
        setCurrentUser(user);
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
        setLoading(false);
        return;
      }

      const role = readDemoRoleFromStorage();
      if (role) {
        const { user: fakeUser, profile } = buildClientOnlyDemo(role);
        setCurrentUser(fakeUser);
        setUserProfile(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    clearDemoStorage();
    if ((currentUser as { isDemo?: boolean })?.isDemo) {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    await firebaseSignOut(auth);
  };

  const demoLogin = async (role: Role) => {
    writeDemoToStorage(role);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous demo sign-in failed, using offline demo:", error);
      const { user, profile } = buildClientOnlyDemo(role);
      setCurrentUser(user);
      setUserProfile(profile);
    }
  };

  const isDemoSession = useMemo(() => {
    if ((currentUser as { isDemo?: boolean })?.isDemo) return true;
    const user = currentUser && "isAnonymous" in currentUser ? currentUser : null;
    if (user?.isAnonymous && readDemoRoleFromStorage()) return true;
    return false;
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    loading,
    isDemoSession,
    signOut,
    demoLogin,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
