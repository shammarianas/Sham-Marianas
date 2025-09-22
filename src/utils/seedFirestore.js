import { db, auth } from "../../firebase";
import {
  addDoc,
  setDoc,
  getDocs,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { firestoreSchema, subcollections } from "./firestoreSchema";
import { initializeAdminsFromEnv } from "./initAdmin";

const collectionHasDocs = async (name) => {
  try {
    const snap = await getDocs(collection(db, name));
    return !snap.empty;
  } catch {
    return false;
  }
};

export const seedProfiles = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  const profileRef = doc(db, "Profiles", user.uid);
  await setDoc(
    profileRef,
    {
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      email: user.email || "",
      uid: user.uid,
      role: "admin",
      status: "active",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Seed a support ticket and a reply
  const supportRef = await addDoc(collection(db, `Profiles/${user.uid}/Support`), {
    subject: "Welcome",
    description: "This is a seeded support ticket",
    createdAt: serverTimestamp(),
    status: "open",
  });
  await addDoc(collection(db, `Profiles/${user.uid}/Support/${supportRef.id}/Replies`), {
    sender: "admin",
    message: "Thanks for reaching out!",
    createdAt: serverTimestamp(),
    agent: user.email || "admin",
  });
};

export const seedCollections = async () => {
  // Seed top-level collections if empty
  const targets = ["Assets", "blogs", "projects", "Groups"];
  for (const name of targets) {
    const has = await collectionHasDocs(name);
    if (has) continue;
    const examples = firestoreSchema[name] || [];
    for (const ex of examples) {
      const payload = { ...ex };
      // Replace JS Date with serverTimestamp where appropriate
      Object.keys(payload).forEach((k) => {
        if (payload[k] instanceof Date) payload[k] = serverTimestamp();
      });
      await addDoc(collection(db, name), payload);
    }
  }
};

export const seedAll = async () => {
  await initializeAdminsFromEnv();
  await seedProfiles();
  await seedCollections();
};

export default { seedProfiles, seedCollections, seedAll };
