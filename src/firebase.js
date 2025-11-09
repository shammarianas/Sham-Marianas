import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

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

// Optional Admin Console Helper
setTimeout(() => {
  window.httpsCallable = httpsCallable;
  window.functions = functions;
  window.auth = auth; // ✅ ADD THIS
  window.app = app;
  console.log("%c✅ ADMIN TOOL READY!", "color: green; font-weight:bold");
}, 2000);

onAuthStateChanged(auth, (user) => {
  if (user) {
    user.getIdToken(true).then((token) => {
      console.log("USER:", user.email, "\nTOKEN:", token);
    });
  } else {
    console.log("NO USER LOGGED IN");
  }
});

export { app, db, auth, storage, functions };
