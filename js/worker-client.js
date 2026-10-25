// worker-client.js
// Connects the Startlet site to the Cloudflare Worker backend (free, no credit card).
// Replaces every claude.use('sample') call in logic.js.
// Worker: launchpad-mentor (uses Google Gemini free tier, key stored as a Worker secret)

const WORKER_URL = "https://launchpad-mentor.khnzwrwry.workers.dev";
import { auth } from "./auth.js";

async function idToken() {
  const u = auth.currentUser;
  return u ? await u.getIdToken() : null;
}
async function post(path, payload) {
  const res = await fetch(WORKER_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, idToken: await idToken() }),
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* non-JSON */ }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Billing (Creem). plan: "monthly" | "yearly". forParent: true leaves the email blank
// so a parent can pay with their own details. Returns the Creem checkout URL.
export async function startCheckout(plan, forParent) {
  return (await post("/checkout", { plan, forParent: !!forParent })).url;
}
// Returns the Creem customer-portal URL (manage / cancel subscription).
export async function openPortal() {
  return (await post("/portal", {})).url;
}
// Cancels billing immediately (used right before deleting the account).
export async function cancelNow() {
  return post("/cancel-now", {});
}

// AI mentor chat.
// messages: [{ role: 'user' | 'assistant', content: '...' }, ...]
export async function mentorChat(messages) {
  return (await post("/mentor", { messages })).text;
}

// AI mentor chat, streamed: onText(fullTextSoFar) is called as words arrive.
// Returns the final text. Throws before any text arrives if streaming isn't available,
// so the caller can fall back to mentorChat().
export async function mentorChatStream(messages, onText) {
  const res = await fetch(WORKER_URL + "/mentor-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, idToken: await idToken() }),
  });
  if (!res.ok || !res.body) {
    let data = {};
    try { data = await res.json(); } catch (e) { /* not JSON */ }
    const err = new Error(data.error || "Mentor request failed");
    err.status = res.status;
    throw err;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let raw = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    raw += dec.decode(value, { stream: true });
    // "\u001e" means: replace everything before it with what follows.
    const cut = raw.lastIndexOf("\u001e");
    const text = cut >= 0 ? raw.slice(cut + 1) : raw;
    if (text) onText(text);
  }
  const cut = raw.lastIndexOf("\u001e");
  return cut >= 0 ? raw.slice(cut + 1) : raw;
}

// AI content tool (captions, scripts, hashtags, etc.)
export async function generateContent(biz, task) {
  return (await post("/content", { biz, task })).text;
}

/* ---------------- Wiring notes for Claude Code ----------------
In js/logic.js:

- sendChat(): replace the claude.use('sample') block with:
    const text = await mentorChat(turns);
    chatHistory[chatHistory.length - 1].content = text;
  (turns = the array of {role, content} messages already built in that function,
   WITHOUT the system prompt prepended — the Worker adds its own system prompt.)

- generate() (content tool): replace the claude.use('sample') block with:
    const text = await generateContent(biz, task);
    box.textContent = text;

- Wrap both in try/catch and show a friendly error message on failure.
- Streaming (word-by-word) is not supported this way; show "Thinking..." until the full reply arrives.

This file REPLACES functions-client.js (Firebase Cloud Functions path, which needs the paid Blaze plan).
------------------------------------------------------------------ */
