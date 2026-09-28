import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCC_cEqxB99hMW16aowMs6AJ3-k52VasW0",
  authDomain: "sham-marianas.firebaseapp.com",
  projectId: "sham-marianas",
  storageBucket: "sham-marianas.appspot.com", // ✅ FIX: use .appspot.com not .firebasestorage.app
  messagingSenderId: "607689609153",
  appId: "1:607689609153:web:3d76a1c337979a691a6940",
  measurementId: "G-Y0VR1HQNCG",
};

// ✅ Prevent duplicate Firebase initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app, "us-central1");

// Start GA4 only in browsers that support Firebase Analytics.
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {
    analytics = null;
  });
}

export { app, db, auth, storage, functions, analytics };
