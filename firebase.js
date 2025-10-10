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
  measurementId: "G-Y0VR1HQNCG"
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

export { db, auth, storage, functions };
