// firestore-integration.js
// Replaces the claude.use('db') calls (progress tracking + community feed)
// with real Firebase Firestore, using the same Firebase project as auth.js.
//
// Requires: Firestore enabled in the Firebase console (Build -> Firestore Database),
// and firestore.rules deployed (firebase deploy --only firestore:rules).

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth } from "./auth.js"; // reuse the initialized app's auth instance

// NOTE: getFirestore() needs the same `app` object auth.js created.
// Easiest fix: in auth.js, add `export { app };` next to `export { auth };`
// then import it here as: import { app } from "./auth.js";
import { app } from "./auth.js";
const db = getFirestore(app);

/* ---------------- Progress tracking ---------------- */

// Save progress: { businessId: [stepIndex, stepIndex, ...] }
export async function saveProgress(progress) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(
    doc(db, "users", user.uid),
    { progress, updatedAt: Date.now() },
    { merge: true }
  );
}

// Load this user's saved progress (returns {} if none yet)
export async function loadProgress() {
  const user = auth.currentUser;
  if (!user) return {};
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return {};
  return snap.data().progress || {};
}

/* ---------------- Terms agreement (replaces the old agreement doc) ---------------- */

export async function saveAgreement(record) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), { agreement: record }, { merge: true });
}

export async function loadAgreement() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;
  return snap.data().agreement || null;
}

/* ---------------- Community feed ---------------- */

// Post a new update to the feed
export async function postToFeed({ businessId, milestone, text }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  await addDoc(collection(db, "posts"), {
    authorId: user.uid,
    authorName: user.displayName || "Someone in the community",
    businessId,
    milestone,
    text,
    cheers: {},
    createdAt: Date.now(),
  });
}

// Live-subscribe to the latest 100 feed posts. Call the returned function to unsubscribe.
export function watchFeed(callback) {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    callback(posts);
  });
}

// Toggle a "cheer" (like) on a post from the current user
export async function toggleCheer(postId, currentCheers) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, "posts", postId);
  if (currentCheers && currentCheers[user.uid]) {
    await updateDoc(ref, { [`cheers.${user.uid}`]: deleteField() });
  } else {
    await updateDoc(ref, { [`cheers.${user.uid}`]: true });
  }
}

export { db };

/* ---------------- Wiring notes for Claude Code ----------------
Replace in logic.js:
  - `saveProgress()` / the local `progress` object -> call saveProgress(progress) after every change,
    and call loadProgress() once right after sign-in to populate the `progress` variable before renderHome().
  - `checkAuthAndEnter()`'s agreement check -> use loadAgreement()/saveAgreement() instead of the
    old db.doc('data/users/.../agreement') calls.
  - `initFeed()`, `renderFeedList()`, `submitPost()`, `cheer()` -> replace their bodies with
    watchFeed(), postToFeed(), and toggleCheer() from this file.
------------------------------------------------------------------ */
