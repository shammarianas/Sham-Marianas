import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { db } from "../../../firebase";
import { auth } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";

export const loginWithGithub = (redirectTo = "/templates") => {
  const provider = new GithubAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {

      // Check if the user's profile already exists in the Firestore collection
      const userProfileRef = doc(db, "Profiles", result.user.uid);

      // Set the user's profile in Firestore "Profiles" collection
      await setDoc(
        userProfileRef,
        {
          username: result.user.displayName,
          email: result.user.email,
          profilePic: result.user.photoURL,
          uid: result.user.uid,
          role: "user", // Assign default role
        },
        { merge: true }
      ); // Use merge option to avoid overwriting existing fields

      alert("Login with GitHub successful!");
      sessionStorage.removeItem("postLoginRedirect");
      window.location.href = redirectTo.startsWith("/") ? redirectTo : "/templates";
    })
    .catch((error) => {
      alert("Login with GitHub failed: " + error.message);
    });
};
