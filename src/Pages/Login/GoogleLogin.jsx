// GoogleLogin.js - UPDATED VERSION
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { db } from "../../../firebase";
import { auth } from "../../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Regular User Google Login (for templates page)
export const loginWithGoogle = (redirectTo = "/templates") => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      const userProfileRef = doc(db, "Profiles", user.uid);

      await setDoc(
        userProfileRef,
        {
          username: user.displayName,
          email: user.email,
          profilePic: user.photoURL,
          uid: user.uid,
          role: "user",
        },
        { merge: true }
      );

      alert("Login with Google successful!");

      // OAuth opens a new window and can lose the React Router location state.
      // Prefer the redirect persisted by DownloadButton when it exists.
      const storedRedirect = sessionStorage.getItem("postLoginRedirect");
      const target =
        typeof storedRedirect === "string" && storedRedirect.startsWith("/")
          ? storedRedirect
          : redirectTo.startsWith("/")
            ? redirectTo
            : "/templates";

      sessionStorage.removeItem("postLoginRedirect");
      window.location.href = target;
    })
    .catch((error) => {
      alert("Login with Google failed: " + error.message);
    });
};

// NEW FUNCTION: Contributor Google Signup (returns user info, doesn't redirect)
export const googleContributorSignup = () => {
  const provider = new GoogleAuthProvider();

  return new Promise((resolve, reject) => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        // Check if user already has a contributor profile
        const contributorRef = doc(db, "Contributors", user.uid);
        const contributorDoc = await getDoc(contributorRef);

        if (contributorDoc.exists()) {
          // User already has contributor profile
          const contributorData = contributorDoc.data();

          if (contributorData.status === "verified") {
            reject(
              new Error(
                "You already have a verified contributor account. Please login instead."
              )
            );
            return;
          } else if (contributorData.status === "pending") {
            reject(
              new Error("You already have a pending contributor application.")
            );
            return;
          } else if (contributorData.status === "rejected") {
            reject(
              new Error(
                "Your contributor application was rejected. Please contact support."
              )
            );
            return;
          }
        }

        // Return user info to pre-fill form
        resolve({
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || "",
          profilePic: user.photoURL || "",
          emailVerified: user.emailVerified,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Existing Contributor Google Login (for contributor dashboard)
export const loginWithGoogleContributor = () => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      const contributorRef = doc(db, "Contributors", user.uid);

      const contributorDoc = await getDoc(contributorRef);

      if (!contributorDoc.exists()) {
        // No contributor profile exists
        alert(
          "No contributor profile found. Please sign up as contributor first."
        );
        window.location.href = "/contributorlogin";
      } else {
        const contributorData = contributorDoc.data();

        // Update last login
        await setDoc(
          contributorRef,
          { lastLogin: new Date() },
          { merge: true }
        );

        if (contributorData.status === "verified") {
          alert("Welcome back contributor!");
          window.location.href = "/contributordashboard";
        } else if (contributorData.status === "pending") {
          alert("Your contributor account is still pending approval.");
          // window.location.href = "/contributor/pending";
        } else if (contributorData.status === "rejected") {
          alert(
            "Your contributor application was rejected. Please contact support."
          );
          window.location.href = "/contributorlogin";
        }
      }
    })
    .catch((error) => {
      alert("Contributor Google login failed: " + error.message);
    });
};
