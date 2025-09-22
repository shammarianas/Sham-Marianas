import { auth } from "../../firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export const DEFAULT_WIPE_TARGETS = ["Assets", "blogs", "projects", "Groups"];

async function deleteCollectionDocs(colName) {
  const snap = await getDocs(collection(db, colName));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
  return snap.size;
}

async function deleteProfileWithSubs(profileId) {
  const subNames = ["favorites", "downloads", "purchases", "Support"]; // known subs used by UI
  // Delete nested Support/Replies
  const supportSnap = await getDocs(collection(db, `Profiles/${profileId}/Support`));
  for (const msg of supportSnap.docs) {
    const repliesSnap = await getDocs(collection(db, `Profiles/${profileId}/Support/${msg.id}/Replies`));
    for (const rep of repliesSnap.docs) await deleteDoc(rep.ref);
    await deleteDoc(msg.ref);
  }
  // Delete simple subcollections
  for (const sub of subNames.filter((s) => s !== "Support")) {
    const subSnap = await getDocs(collection(db, `Profiles/${profileId}/${sub}`));
    for (const docc of subSnap.docs) await deleteDoc(docc.ref);
  }
  // Finally delete profile
  await deleteDoc(doc(db, "Profiles", profileId));
}

export async function wipeCollections(collections, options = {}) {
  const {
    includeProfiles = false,
    keepCurrentProfile = true,
    allowAdminUsersWipe = false,
  } = options;

  const summary = {};

  for (const name of collections) {
    if (name === "adminUsers" && !allowAdminUsersWipe) {
      summary[name] = "skipped";
      continue;
    }
    if (name === "Profiles") {
      if (!includeProfiles) { summary[name] = "skipped"; continue; }
      const snap = await getDocs(collection(db, "Profiles"));
      let count = 0;
      for (const p of snap.docs) {
        if (keepCurrentProfile && auth.currentUser && p.id === auth.currentUser.uid) { continue; }
        await deleteProfileWithSubs(p.id);
        count++;
      }
      summary[name] = count;
      continue;
    }
    summary[name] = await deleteCollectionDocs(name);
  }

  return summary;
}

export default { wipeCollections, DEFAULT_WIPE_TARGETS };
