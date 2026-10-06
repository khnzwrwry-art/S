#!/usr/bin/env node
// scripts/backup-firestore.js
// Backs up every Startlet Firestore collection to local JSON files, one per collection.
// This script never runs automatically and is never part of a deploy — it's excluded from
// Firebase Hosting (see firebase.json's "ignore" list) and only does anything when you run it
// yourself from Cloud Shell.
//
// ---- ONE-TIME SETUP ----
// 1. Firebase Console -> gear icon -> Project settings -> Service accounts tab ->
//    "Generate new private key". This downloads a JSON key file.
// 2. In Cloud Shell, save that file OUTSIDE this repo, e.g.:
//      mkdir -p ~/startlet-secrets
//      mv ~/Downloads/launchpad-e6280-firebase-adminsdk-*.json ~/startlet-secrets/serviceAccountKey.json
//    (if you uploaded it via the Cloud Shell "upload file" button it lands in ~/, move it from there)
// 3. cd ~/S && npm install --no-save firebase-admin
//
// ---- RUN ----
//   GOOGLE_APPLICATION_CREDENTIALS=~/startlet-secrets/serviceAccountKey.json \
//     node scripts/backup-firestore.js
//
// Output: JSON files written to ~/startlet-firestore-backups/<timestamp>/
// That folder is OUTSIDE this repo on purpose — never committed to git, never deployed.

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_ID = 'launchpad-e6280';
const OUT_ROOT = path.join(os.homedir(), 'startlet-firestore-backups');
const TOP_LEVEL_COLLECTIONS = ['users', 'posts', 'leaderboard'];

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account key file path first.');
  console.error('Example: GOOGLE_APPLICATION_CREDENTIALS=~/startlet-secrets/serviceAccountKey.json node scripts/backup-firestore.js');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
});
const db = admin.firestore();

// Firestore Timestamp objects (if any ever show up) -> plain, JSON-safe ISO strings.
function serializeValue(v) {
  if (v && typeof v.toDate === 'function') return { __timestamp__: v.toDate().toISOString() };
  if (Array.isArray(v)) return v.map(serializeValue);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = serializeValue(v[k]);
    return out;
  }
  return v;
}

async function backupCollection(name) {
  const snap = await db.collection(name).get();
  return snap.docs.map((d) => ({ _id: d.id, ...serializeValue(d.data()) }));
}

// posts/{postId}/replies is a subcollection, not a top-level collection, so it gets its own
// file (posts_replies.json) with each reply tagged with its parent postId.
async function backupReplies() {
  const postsSnap = await db.collection('posts').get();
  const replies = [];
  for (const postDoc of postsSnap.docs) {
    const repliesSnap = await postDoc.ref.collection('replies').get();
    repliesSnap.docs.forEach((d) => {
      replies.push({ _id: d.id, postId: postDoc.id, ...serializeValue(d.data()) });
    });
  }
  return replies;
}

(async () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(OUT_ROOT, stamp);
  fs.mkdirSync(outDir, { recursive: true });

  for (const name of TOP_LEVEL_COLLECTIONS) {
    const docs = await backupCollection(name);
    fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify(docs, null, 2));
    console.log(name + '.json:', docs.length, 'documents');
  }

  const replies = await backupReplies();
  fs.writeFileSync(path.join(outDir, 'posts_replies.json'), JSON.stringify(replies, null, 2));
  console.log('posts_replies.json:', replies.length, 'documents');

  console.log('\nBackup saved to: ' + outDir);
})().catch((e) => {
  console.error('Backup failed:', e);
  process.exit(1);
});
