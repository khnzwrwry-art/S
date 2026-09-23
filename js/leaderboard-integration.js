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
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { app, auth } from "./auth.js";

const db = getFirestore(app);

/* ---------------- Submit / update your own entry ---------------- */

// proofUrl is optional but encouraged — a link to the real storefront, so at
// least the business's existence (not the sales count) can be spot-checked.
export async function submitLeaderboardEntry({ businessId, businessName, salesCount, proofUrl }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  if (!Number.isFinite(salesCount) || salesCount < 0) {
    throw new Error("Sales count must be a non-negative number");
  }
  await setDoc(doc(db, "leaderboard", user.uid), {
    displayName: user.displayName || "Someone in the community",
    businessId,
    businessName,
    salesCount,
    proofUrl: proofUrl || null,
    selfReported: true, // always true today — flip only once real API verification exists
    updatedAt: Date.now(),
  });
}

export async function getMyLeaderboardEntry() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "leaderboard", user.uid));
  return snap.exists() ? snap.data() : null;
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

/* ---------------- Wiring notes for Claude Code ----------------

Add a new view (mirror the existing feed view pattern in logic.js):

  function renderLeaderboard(){
    document.getElementById('view-leaderboard').innerHTML =
    '<div class="hero"><h1 class="sm">Leaderboard</h1>' +
    '<p>Active businesses and reported sales. Numbers are self-reported by ' +
    'each person, not independently verified — treat them as a rough signal, ' +
    'not a certified fact.</p></div>' +
    '<div class="panel"><h4>Add or update your entry</h4>' +
      '<select id="lbBiz">' + DATA.map(c=>`<option value="${c.id}">${c.name}</option>`).join('') + '</select>' +
      '<input type="number" id="lbSales" placeholder="Sales so far" min="0">' +
      '<input type="text" id="lbProof" placeholder="Link to your store (optional, adds credibility)">' +
      '<button class="btn-primary" id="lbSubmit">Update my entry</button>' +
      '<p class="hint" id="lbHint"></p></div>' +
    '<div id="lbList"><p class="hint">Loading...</p></div>';

    document.getElementById('lbSubmit').onclick = async () => {
      const hint = document.getElementById('lbHint');
      try {
        await submitLeaderboardEntry({
          businessId: document.getElementById('lbBiz').value,
          businessName: DATA.find(c=>c.id===document.getElementById('lbBiz').value).name,
          salesCount: parseInt(document.getElementById('lbSales').value, 10) || 0,
          proofUrl: document.getElementById('lbProof').value.trim(),
        });
        hint.textContent = 'Updated.';
      } catch(e) { hint.textContent = 'Could not update — try again.'; }
    };

    watchLeaderboard((entries) => {
      document.getElementById('lbList').innerHTML = entries.map((e, i) => `
        <div class="panel">
          <div class="post-top">
            <span class="post-tag" style="background:var(--accent)">#${i+1}</span>
            <span class="muted-xs">${esc(e.businessName)}</span>
            <span class="muted-xs ml">self-reported</span>
          </div>
          <p style="font-size:14px;margin:0 0 6px"><b>${e.salesCount}</b> sales — ${esc(e.displayName)}</p>
          ${e.proofUrl ? `<a class="pill" target="_blank" rel="noopener" href="${esc(e.proofUrl)}">View store</a>` : ''}
        </div>
      `).join('');
    });
  }

Add a tile on the home screen (same pattern as the other nav-tiles) pointing to
this view, and a `<main id="view-leaderboard" hidden></main>` container in shell.html.
------------------------------------------------------------------ */
