// auth.js — real Google + Apple sign-in via Firebase Authentication
// Deploy this alongside Startlet on real hosting (Vercel, Firebase Hosting, etc).
// This file only ever holds PUBLIC identifiers. No secrets belong here.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
  deleteUser,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// --- Your Startlet Firebase project's public config (project id stays launchpad-e6280) ---
// These are public identifiers, safe to ship in frontend code.
const firebaseConfig = {
  apiKey: "AIzaSyBvaS2OZUCJpfr4gDuot1xP6tAEeqaK3jI",
  authDomain: "launchpad-e6280.firebaseapp.com",
  projectId: "launchpad-e6280",
  storageBucket: "launchpad-e6280.firebasestorage.app",
  messagingSenderId: "975236062976",
  appId: "1:975236062976:web:af573ac0d5063939495de5",
  measurementId: "G-Q3Y8TRP6VV",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Keep the user signed in across page refreshes and browser restarts.
setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user; // { uid, email, displayName, photoURL, ... }
}

export async function signInWithApple() {
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

// Firebase requires a fresh sign-in before a sensitive operation like deleting
// the account itself (it throws auth/requires-recent-login otherwise), so the
// delete-account flow calls this first.
export async function reauthenticateWithGoogle() {
  if (!auth.currentUser) throw new Error("Not signed in");
  await reauthenticateWithPopup(auth.currentUser, googleProvider);
}

// Deletes the Firebase Auth user itself. Call this LAST in the delete-account
// flow, after all of this user's Firestore data has already been removed —
// once this resolves, auth.currentUser becomes null and they can no longer
// write anything as this user.
export async function deleteAccount() {
  if (!auth.currentUser) throw new Error("Not signed in");
  await deleteUser(auth.currentUser);
}

// Change the signed-in user's display name (shown on the feed, leaderboard, profile circle, etc.)
export async function updateDisplayName(name) {
  if (!auth.currentUser) throw new Error("Not signed in");
  await updateProfile(auth.currentUser, { displayName: name });
}

// Call this once on page load to react to auth state (persists across refreshes).
// callback receives `user` (or null if signed out).
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export { app, auth };

/* ---------------- Example wiring into Startlet's gate screen ----------------

import { signInWithGoogle, signInWithApple, logout, watchAuthState } from "./auth.js";

watchAuthState((user) => {
  if (user) {
    document.getElementById("gate").hidden = true;
    document.getElementById("app").hidden = false;
    // Now check/store the Terms acceptance for user.uid in your own database
    // (Firestore, Supabase, etc.) before letting them past the agreement step.
  } else {
    document.getElementById("gate").hidden = false;
    document.getElementById("app").hidden = true;
  }
});

document.getElementById("googleBtn").onclick = async () => {
  try {
    await signInWithGoogle();
  } catch (e) {
    console.error("Google sign-in failed:", e);
  }
};

document.getElementById("appleBtn").onclick = async () => {
  try {
    await signInWithApple();
  } catch (e) {
    console.error("Apple sign-in failed:", e);
  }
};

document.getElementById("logoutBtn").onclick = () => logout();

--------------------------------------------------------------------------- */
