import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCC_cEqxB99hMW16aowMs6AJ3-k52VasW0",
  authDomain: "sham-marianas.firebaseapp.com",
  projectId: "sham-marianas",
  storageBucket: "sham-marianas.firebasestorage.app",
  messagingSenderId: "607689609153",
  appId: "1:607689609153:web:3d76a1c337979a691a6940",
  measurementId: "G-Y0VR1HQNCG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use initializeFirestore for restricted environments
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// PRODUCTION FIX 2025 – Yeh line 100% zaruri hai
// Bina iske phone auth nahi chalega jab Firebase ne project ko Enterprise pe shift kiya ho
if (typeof window !== "undefined") {
  // Force reCAPTCHA v2 (not Enterprise)
  window.recaptchaOptions = {
    useEnterprise: false,
  };

  // Yeh line sabse important hai — bina iske nahi chalega ab
  window.recaptchaVerifierConfig = {
    // Force invisible v2
    size: "invisible",
    callback: () => {},
  };
}

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  auth.settings.appVerificationDisabledForTesting = true;
  console.log("Localhost 5173: Test mode ON — OTP = 123456");
}

export { db, auth, storage, functions };
