// worker-client.js
// Connects the Launchpad site to the Cloudflare Worker backend (free, no credit card).
// Replaces every claude.use('sample') call in logic.js.
// Worker: launchpad-mentor (uses Google Gemini free tier, key stored as a Worker secret)

const WORKER_URL = "https://launchpad-mentor.khnzwrwry.workers.dev";

// AI mentor chat.
// messages: [{ role: 'user' | 'assistant', content: '...' }, ...]
export async function mentorChat(messages) {
  const res = await fetch(WORKER_URL + "/mentor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Mentor request failed");
  return data.text;
}

// AI content tool (captions, scripts, hashtags, etc.)
export async function generateContent(biz, task) {
  const res = await fetch(WORKER_URL + "/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ biz, task }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Content request failed");
  return data.text;
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
