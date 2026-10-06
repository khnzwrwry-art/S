// leaderboard-integration.js
// A leaderboard of active businesses and reported sales.
//
// HONESTY DESIGN: there is no way to cryptographically prove a sales number
// without connecting each platform's real API (Shopify, Etsy, Stripe, etc. —
// a significant integration per platform, worth building later, possibly as
// a paid-tier feature). Until then, every number here is self-reported, and
// the UI must always show that plainly — never present it as verified.

import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { app, auth } from "./auth.js";

const db = getFirestore(app);

// One entry per user PER BUSINESS: doc id is `${uid}_${businessId}`.
function entryId(uid, businessId) {
  return uid + "_" + businessId;
}

/* ---------------- Submit / update your own entry (one per business) ---------------- */

// proofUrl is optional but encouraged — a link to the real storefront, so at
// least the business's existence (not the sales count) can be spot-checked.
export async function submitLeaderboardEntry({ businessId, businessName, salesCount, proofUrl }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  if (!Number.isFinite(salesCount) || salesCount < 0) {
    throw new Error("Sales count must be a non-negative number");
  }
  await setDoc(doc(db, "leaderboard", entryId(user.uid, businessId)), {
    ownerId: user.uid,
    displayName: user.displayName || "Someone in the community",
    businessId,
    businessName,
    salesCount,
    proofUrl: proofUrl || null,
    selfReported: true, // always true today — flip only once real API verification exists
    updatedAt: Date.now(),
  });
}

export async function deleteLeaderboardEntry(businessId) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, "leaderboard", entryId(user.uid, businessId)));
}

// Deletes every leaderboard entry this user owns (one per business they
// reported sales for). Used by account deletion. Safe to call more than
// once — finds and deletes whatever still matches.
export async function deleteAllMyLeaderboardEntries() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await getDocs(query(collection(db, "leaderboard"), where("ownerId", "==", user.uid)));
  for (const d of snap.docs) await deleteDoc(d.ref);
}

// One-off read of all of this user's leaderboard entries, for the
// "Download my data" export (watchMyEntries() above is live-subscribe only).
export async function getMyLeaderboardEntries() {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await getDocs(query(collection(db, "leaderboard"), where("ownerId", "==", user.uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Live-subscribe to all of the current user's entries (one per business).
export function watchMyEntries(callback) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, "leaderboard"), where("ownerId", "==", user.uid));
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    callback(entries);
  });
}

/* ---------------- Live top-N board ---------------- */

export function watchLeaderboard(callback, topN = 50) {
  const q = query(collection(db, "leaderboard"), orderBy("salesCount", "desc"), limit(topN));
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    callback(entries);
  });
}

export { db };
