import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  enableIndexedDbPersistence,
  enablePersistentCacheIndexAutoCreation,
  getFirestore,
  getPersistentCacheIndexManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyApaVjurPKFFPeA79H7NIwES4cAm4h8eE0",
  authDomain: "project-3b708.firebaseapp.com",
  projectId: "project-3b708",
  storageBucket: "project-3b708.firebasestorage.app",
  messagingSenderId: "755723758014",
  appId: "1:755723758014:web:46ff1a44bc349e9dd871ef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== "undefined") {
  void enableIndexedDbPersistence(db).catch((error) => {
    console.warn("Firestore persistence unavailable:", error);
  });

  const indexManager = getPersistentCacheIndexManager(db);
  if (indexManager) {
    enablePersistentCacheIndexAutoCreation(indexManager);
  }
}
