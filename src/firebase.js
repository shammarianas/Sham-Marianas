import { getAnalytics, isSupported } from "firebase/analytics";
import { app, auth, db, functions, storage } from "../firebase";

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
