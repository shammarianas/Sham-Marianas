import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const initializeAdmin = async (email) => {
  try {
    const adminEmail = (email || "").toLowerCase();
    if (!adminEmail) return false;
    await setDoc(
      doc(db, "adminUsers", adminEmail),
      {
        createdAt: serverTimestamp(),
        addedBy: "system",
        isSuper: true,
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Error initializing admin:", error);
    return false;
  }
};

export const initializeAdminsFromEnv = async () => {
  try {
    const raw = import.meta.env.REACT_APP_DEV_ADMIN_EMAILS || "";
    const emails = raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    await Promise.all(emails.map((e) => initializeAdmin(e)));
    return emails;
  } catch (error) {
    console.error("Error initializing admins from env:", error);
    return [];
  }
};
