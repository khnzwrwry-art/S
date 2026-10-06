#!/usr/bin/env node
// scripts/restore-firestore.js
// Restores JSON files produced by scripts/backup-firestore.js back into Firestore.
// DESTRUCTIVE: for every document in the backup, this OVERWRITES whatever currently exists
// in Firestore under that same document id. It does not delete documents that exist in
// Firestore but aren't in the backup. Run with care, ideally against a backup you just took.
//
// ---- SETUP ----
// Same as backup-firestore.js: a service account key outside this repo, and
// `npm install --no-save firebase-admin` run once in ~/S.
//
// ---- RUN ----
//   GOOGLE_APPLICATION_CREDENTIALS=~/startlet-secrets/serviceAccountKey.json \
//     node scripts/restore-firestore.js ~/startlet-firestore-backups/<timestamp>

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'launchpad-e6280';
const TOP_LEVEL_COLLECTIONS = ['users', 'posts', 'leaderboard'];

const backupDir = process.argv[2];
if (!backupDir) {
  console.error('Usage: node scripts/restore-firestore.js <path-to-backup-folder>');
  console.error('Example: node scripts/restore-firestore.js ~/startlet-firestore-backups/2026-10-06T12-00-00-000Z');
  process.exit(1);
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account key file path first.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
});
const db = admin.firestore();

function deserializeValue(v) {
  if (v && typeof v === 'object' && v !== null && '__timestamp__' in v) {
    return admin.firestore.Timestamp.fromDate(new Date(v.__timestamp__));
  }
  if (Array.isArray(v)) return v.map(deserializeValue);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = deserializeValue(v[k]);
    return out;
  }
  return v;
}

async function commitInBatches(items, writeFn) {
  let batch = db.batch();
  let count = 0;
  for (const item of items) {
    writeFn(batch, item);
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  await batch.commit();
  return count;
}

async function restoreCollection(name) {
  const file = path.join(backupDir, name + '.json');
  if (!fs.existsSync(file)) { console.log(name + '.json not found, skipping'); return; }
  const docs = JSON.parse(fs.readFileSync(file, 'utf8'));
  const n = await commitInBatches(docs, (batch, doc) => {
    const { _id, ...data } = doc;
    batch.set(db.collection(name).doc(_id), deserializeValue(data));
  });
  console.log(name + ':', n, 'documents restored');
}

async function restoreReplies() {
  const file = path.join(backupDir, 'posts_replies.json');
  if (!fs.existsSync(file)) { console.log('posts_replies.json not found, skipping'); return; }
  const replies = JSON.parse(fs.readFileSync(file, 'utf8'));
  const n = await commitInBatches(replies, (batch, r) => {
    const { _id, postId, ...data } = r;
    batch.set(db.collection('posts').doc(postId).collection('replies').doc(_id), deserializeValue(data));
  });
  console.log('replies:', n, 'documents restored');
}

(async () => {
  for (const name of TOP_LEVEL_COLLECTIONS) await restoreCollection(name);
  await restoreReplies();
  console.log('\nRestore complete from: ' + backupDir);
})().catch((e) => {
  console.error('Restore failed:', e);
  process.exit(1);
});
