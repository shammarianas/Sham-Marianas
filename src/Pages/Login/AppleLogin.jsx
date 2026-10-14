// src/components/auth/AppleLogin.js
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";

export const loginWithApple = (redirectTo = "/templates") => {
  const provider = new OAuthProvider("apple.com");
  // Optional: Add scopes if needed
  // provider.addScope('email');
  // provider.addScope('name');

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;

      // Apple doesn't always return email/name on first login
      const displayName = user.displayName || "Apple User";
      const email = user.email || `${user.uid}@privaterelay.appleid.com`; // Private Relay fallback
      const photoURL = user.photoURL || null;

      // Save or update profile in Firestore
      const userProfileRef = doc(db, "Profiles", user.uid);
      await setDoc(
        userProfileRef,
        {
          username: displayName,
          email: email,
          profilePic: photoURL,
          uid: user.uid,
          role: "user",
          provider: "apple",
        },
        { merge: true }
      );

      alert("Login with Apple successful!");
      window.location.href = redirectTo.startsWith("/") ? redirectTo : "/templates";
    })
    .catch((error) => {
      console.error("Apple Login Error:", error);
      alert("Apple Login failed: " + error.message);
    });
};
