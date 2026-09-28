import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCC_cEqxB99hMW16aowMs6AJ3-k52VasW0",
  authDomain: "sham-marianas.firebaseapp.com",
  projectId: "sham-marianas",
  storageBucket: "sham-marianas.appspot.com",
  messagingSenderId: "607689609153",
  appId: "1:607689609153:web:3d76a1c337979a691a6940",
  measurementId: "G-Y0VR1HQNCG",
};

// Reuse the default app when another lazy-loaded module imports Firebase.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use initializeFirestore for restricted environments
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

const auth = getAuth(app);
const storage = getStorage(app);

// ✅ **FIX: Explicitly specify region for functions**
const functions = getFunctions(app, "us-central1");

// ✅ **OPTIONAL: For emulator (development only)**
if (
  process.env.NODE_ENV === "development" ||
  window.location.hostname === "localhost"
) {
  console.log("🔧 Development mode: Connecting to local emulators...");

  // Uncomment if you're using Firebase emulators
  // connectFunctionsEmulator(functions, "localhost", 5001);
}

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

export { app, db, auth, storage, functions };
