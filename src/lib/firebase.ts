import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  enableIndexedDbPersistence,
  enablePersistentCacheIndexAutoCreation,
  getFirestore,
  getPersistentCacheIndexManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApaVjurPKFFPeA79H7NIwES4cAm4h8eE0",
  authDomain: "project-3b708.firebaseapp.com",
  projectId: "project-3b708",
  storageBucket: "project-3b708.firebasestorage.app",
  messagingSenderId: "755723758014",
  appId: "1:755723758014:web:93c3938d70b803dbd871ef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

type WindowWithFirestoreInit = Window & {
  __projectFirestoreOfflineInit?: boolean;
};

if (typeof window !== "undefined") {
  const browserWindow = window as WindowWithFirestoreInit;
  if (!browserWindow.__projectFirestoreOfflineInit) {
    browserWindow.__projectFirestoreOfflineInit = true;

    void enableIndexedDbPersistence(db).catch((error) => {
      console.warn("Firestore persistence unavailable:", error);
    });

    const indexManager = getPersistentCacheIndexManager(db);
    if (indexManager) {
      enablePersistentCacheIndexAutoCreation(indexManager);
    }
  }
}
