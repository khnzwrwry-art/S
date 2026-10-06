#!/usr/bin/env node
// scripts/firestore-rules.test.js
// Tests for firestore.rules against the Firebase Local Emulator Suite.
// This never touches production data — it runs entirely against a local emulator.
//
// I can't run this myself: this sandbox has no network path to npm or to download the
// emulator's Java-based Firestore binary. It's meant to run from Cloud Shell, which has both.
//
// ---- ONE-TIME SETUP (in Cloud Shell) ----
//   cd ~/S
//   npm install --no-save @firebase/rules-unit-testing firebase
// (both packages are required — the test helpers come from the first, the
// doc/setDoc/... query functions this file calls come from the second)
//
// ---- RUN ----
//   firebase emulators:exec --only firestore "node scripts/firestore-rules.test.js"
// (emulators:exec starts the emulator, runs the command, then shuts the emulator down)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc } = require('firebase/firestore');

const RULES_PATH = path.join(__dirname, '..', 'firestore.rules');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log('  ok  ' + name);
  } catch (e) {
    failed++;
    console.log('FAIL  ' + name);
    console.log('      ' + (e && e.message ? e.message : e));
  }
}

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'startlet-rules-test',
    firestore: { rules: fs.readFileSync(RULES_PATH, 'utf8') },
  });

  const alice = testEnv.authenticatedContext('alice');
  const bob = testEnv.authenticatedContext('bob');
  const anon = testEnv.unauthenticatedContext();

  console.log('\n--- users/{uid} ---');

  await test('signed-out cannot read a user doc', async () => {
    await assertFails(getDoc(doc(anon.firestore(), 'users/alice')));
  });

  await test('alice can write her own valid user doc', async () => {
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice'), { streakCount: 3 }, { merge: true }));
  });

  await test('alice cannot write to bob\'s user doc', async () => {
    await assertFails(setDoc(doc(alice.firestore(), 'users/bob'), { streakCount: 3 }, { merge: true }));
  });

  await test('alice cannot write an unknown field to her own user doc', async () => {
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice'), { isAdmin: true }, { merge: true }));
  });

  await test('alice cannot write a streakCount above the sanity cap', async () => {
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice'), { streakCount: 999999 }, { merge: true }));
  });

  await test('bob cannot delete alice\'s user doc', async () => {
    await assertFails(deleteDoc(doc(bob.firestore(), 'users/alice')));
  });

  await test('alice CAN delete her own user doc (account deletion)', async () => {
    await assertSucceeds(deleteDoc(doc(alice.firestore(), 'users/alice')));
  });

  console.log('\n--- posts/{postId} ---');

  await test('signed-out cannot create a post', async () => {
    await assertFails(addDoc(collection(anon.firestore(), 'posts'), {
      authorId: 'anon', authorName: 'Anon', businessId: 'dropship', milestone: 'Just started',
      text: 'hi', cheers: {},
    }));
  });

  await test('alice can create her own post with createdAt as request.time', async () => {
    const { serverTimestamp } = require('firebase/firestore');
    await assertSucceeds(addDoc(collection(alice.firestore(), 'posts'), {
      authorId: 'alice', authorName: 'Alice', businessId: 'dropship', milestone: 'Just started',
      text: 'hello world', cheers: {}, createdAt: serverTimestamp(),
    }));
  });

  await test('alice cannot create a post impersonating bob', async () => {
    const { serverTimestamp } = require('firebase/firestore');
    await assertFails(addDoc(collection(alice.firestore(), 'posts'), {
      authorId: 'bob', authorName: 'Bob', businessId: 'dropship', milestone: 'Just started',
      text: 'hello world', cheers: {}, createdAt: serverTimestamp(),
    }));
  });

  await test('a post over 1000 characters is rejected', async () => {
    const { serverTimestamp } = require('firebase/firestore');
    await assertFails(addDoc(collection(alice.firestore(), 'posts'), {
      authorId: 'alice', authorName: 'Alice', businessId: 'dropship', milestone: 'Just started',
      text: 'x'.repeat(1001), cheers: {}, createdAt: serverTimestamp(),
    }));
  });

  await test('a post with a client-supplied createdAt (not request.time) is rejected', async () => {
    await assertFails(addDoc(collection(alice.firestore(), 'posts'), {
      authorId: 'alice', authorName: 'Alice', businessId: 'dropship', milestone: 'Just started',
      text: 'hello', cheers: {}, createdAt: Date.now(),
    }));
  });

  // Seed one real post as alice (bypassing rules) to test edit/delete/cheer permissions on it.
  let alicePostId;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const { serverTimestamp } = require('firebase/firestore');
    const ref = await addDoc(collection(ctx.firestore(), 'posts'), {
      authorId: 'alice', authorName: 'Alice', businessId: 'dropship', milestone: 'Just started',
      text: 'seed post', cheers: {}, createdAt: serverTimestamp(),
    });
    alicePostId = ref.id;
  });

  await test('bob cannot edit alice\'s post text', async () => {
    await assertFails(updateDoc(doc(bob.firestore(), 'posts/' + alicePostId), { text: 'hacked' }));
  });

  await test('bob CAN toggle a cheer on alice\'s post', async () => {
    await assertSucceeds(updateDoc(doc(bob.firestore(), 'posts/' + alicePostId), { 'cheers.bob': true }));
  });

  await test('alice CAN edit her own post text', async () => {
    await assertSucceeds(updateDoc(doc(alice.firestore(), 'posts/' + alicePostId), { text: 'edited by alice' }));
  });

  await test('bob cannot delete alice\'s post', async () => {
    await assertFails(deleteDoc(doc(bob.firestore(), 'posts/' + alicePostId)));
  });

  await test('alice CAN delete her own post', async () => {
    await assertSucceeds(deleteDoc(doc(alice.firestore(), 'posts/' + alicePostId)));
  });

  console.log('\n--- posts/{postId}/replies/{replyId} ---');

  let replyHostPostId;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const { serverTimestamp } = require('firebase/firestore');
    const ref = await addDoc(collection(ctx.firestore(), 'posts'), {
      authorId: 'alice', authorName: 'Alice', businessId: 'dropship', milestone: 'Just started',
      text: 'host post for replies', cheers: {}, createdAt: serverTimestamp(),
    });
    replyHostPostId = ref.id;
  });

  await test('bob can reply to alice\'s post', async () => {
    const { serverTimestamp } = require('firebase/firestore');
    await assertSucceeds(addDoc(collection(bob.firestore(), 'posts/' + replyHostPostId + '/replies'), {
      authorId: 'bob', authorName: 'Bob', text: 'nice!', createdAt: serverTimestamp(),
    }));
  });

  await test('a reply over 500 characters is rejected', async () => {
    const { serverTimestamp } = require('firebase/firestore');
    await assertFails(addDoc(collection(bob.firestore(), 'posts/' + replyHostPostId + '/replies'), {
      authorId: 'bob', authorName: 'Bob', text: 'x'.repeat(501), createdAt: serverTimestamp(),
    }));
  });

  let bobReplyId;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const { serverTimestamp } = require('firebase/firestore');
    const ref = await addDoc(collection(ctx.firestore(), 'posts/' + replyHostPostId + '/replies'), {
      authorId: 'bob', authorName: 'Bob', text: 'seed reply', createdAt: serverTimestamp(),
    });
    bobReplyId = ref.id;
  });

  await test('replies cannot be edited, even by their own author', async () => {
    await assertFails(updateDoc(doc(bob.firestore(), 'posts/' + replyHostPostId + '/replies/' + bobReplyId), { text: 'edited' }));
  });

  await test('alice cannot delete bob\'s reply', async () => {
    await assertFails(deleteDoc(doc(alice.firestore(), 'posts/' + replyHostPostId + '/replies/' + bobReplyId)));
  });

  await test('bob CAN delete his own reply', async () => {
    await assertSucceeds(deleteDoc(doc(bob.firestore(), 'posts/' + replyHostPostId + '/replies/' + bobReplyId)));
  });

  console.log('\n--- leaderboard/{uid}_{businessId} ---');

  await test('alice can create her own leaderboard entry with the correct doc id', async () => {
    await assertSucceeds(setDoc(doc(alice.firestore(), 'leaderboard/alice_dropship'), {
      ownerId: 'alice', displayName: 'Alice', businessId: 'dropship', businessName: 'Dropshipping',
      salesCount: 10, proofUrl: 'https://example.com/store', selfReported: true,
    }));
  });

  await test('alice cannot create an entry under a doc id pretending to be bob', async () => {
    await assertFails(setDoc(doc(alice.firestore(), 'leaderboard/bob_dropship'), {
      ownerId: 'alice', displayName: 'Alice', businessId: 'dropship', businessName: 'Dropshipping',
      salesCount: 10, proofUrl: null, selfReported: true,
    }));
  });

  await test('a sales count above 1,000,000 is rejected', async () => {
    await assertFails(setDoc(doc(alice.firestore(), 'leaderboard/alice_affiliate'), {
      ownerId: 'alice', displayName: 'Alice', businessId: 'affiliate', businessName: 'Affiliate Marketing',
      salesCount: 2000000, proofUrl: null, selfReported: true,
    }));
  });

  await test('a non-https proof link is rejected', async () => {
    await assertFails(setDoc(doc(alice.firestore(), 'leaderboard/alice_pod'), {
      ownerId: 'alice', displayName: 'Alice', businessId: 'pod', businessName: 'Print on Demand',
      salesCount: 5, proofUrl: 'javascript:alert(1)', selfReported: true,
    }));
  });

  await test('bob cannot update alice\'s leaderboard entry', async () => {
    await assertFails(setDoc(doc(bob.firestore(), 'leaderboard/alice_dropship'), {
      ownerId: 'alice', displayName: 'Alice', businessId: 'dropship', businessName: 'Dropshipping',
      salesCount: 999999999, proofUrl: null, selfReported: true,
    }));
  });

  await testEnv.cleanup();

  console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
  if (failed > 0) process.exit(1);
})().catch((e) => {
  console.error('Test run crashed:', e);
  process.exit(1);
});
