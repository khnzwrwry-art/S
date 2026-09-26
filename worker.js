// worker.js — Cloudflare Worker backend for Launchpad
// Replaces Firebase Cloud Functions (which require the paid Blaze plan).
// Uses Google Gemini's free API tier (no credit card required).
//
// SETUP:
// 1. Get a free Gemini API key: https://aistudio.google.com/apikey
//    (sign in with the same Google account; the free tier needs no card)
// 2. In the Cloudflare dashboard for this Worker:
//    Settings -> Variables and Secrets -> Add -> type: Secret
//    Name: GEMINI_API_KEY    Value: <paste the key>
//    NEVER paste the key into this file or into chat.
// 3. Paste this whole file into the Worker's "Edit code" editor and Deploy.

const ALLOWED_ORIGIN = "https://launchpad-e6280.web.app";

const MENTOR_SYSTEM =
  "You are a business mentor for teenagers starting their first business. " +
  "Answer in English, short and direct, with practical steps they can take today. " +
  "No get-rich promises. If something requires a parent, a bank account or tax " +
  "reporting, say so explicitly. If you need more information, ask one focused question.";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function callGemini(apiKey, systemPrompt, userContent) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: userContent,
        generationConfig: { maxOutputTokens: 800 },
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error("Gemini error " + res.status + ": " + detail);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("\n").trim();
}

export default {
  async fetch(request, env) {
    // Browser preflight check
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: corsHeaders() });
    }

    if (!env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Server not configured: missing GEMINI_API_KEY secret." },
        { status: 500, headers: corsHeaders() }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
    }

    const url = new URL(request.url);

    try {
      // ---- AI mentor chat ----
      // POST /mentor  { messages: [{role:'user'|'assistant', content:'...'}, ...] }
      if (url.pathname === "/mentor") {
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: String(m.content || "") }],
        }));
        const text = await callGemini(env.GEMINI_API_KEY, MENTOR_SYSTEM, contents);
        return Response.json({ text }, { headers: corsHeaders() });
      }

      // ---- AI content tool ----
      // POST /content  { biz: '...', task: '...' }
      if (url.pathname === "/content") {
        const prompt =
          `You write marketing content for teenagers running a small business.\n` +
          `Business: "${body.biz || ""}".\nTask: ${body.task || ""}\n` +
          `Write in a direct, young tone. No hype, no preamble — go straight to the content.`;
        const text = await callGemini(
          env.GEMINI_API_KEY,
          "You are a concise marketing copywriter for teenage entrepreneurs.",
          [{ role: "user", parts: [{ text: prompt }] }]
        );
        return Response.json({ text }, { headers: corsHeaders() });
      }

      return Response.json({ error: "Unknown path" }, { status: 404, headers: corsHeaders() });
    } catch (err) {
      return Response.json(
        { error: "Upstream failure", detail: String(err) },
        { status: 502, headers: corsHeaders() }
      );
    }
  },
};
