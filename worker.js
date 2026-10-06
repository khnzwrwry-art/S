// worker.js — Cloudflare Worker backend for Startlet
// Order: Gemini 3.5 Flash -> Gemini 3.1 Flash-Lite -> Cloudflare Workers AI (Llama 3.3 70B)
// Requires: secret GEMINI_API_KEY, and a Workers AI binding named "AI".

const ALLOWED_ORIGIN = "https://launchpad-e6280.web.app";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_FIELD_LENGTH = 2000; // for /content's biz/task fields

const MENTOR_SYSTEM =
  "You are a business mentor for teenagers starting their first business. " +
  "Answer in English, short and direct, with practical steps they can take today. " +
  "No get-rich promises. If something requires a parent, a bank account or tax " +
  "reporting, say so explicitly. If you need more information, ask one focused question.";

const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
const CF_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// messages format: [{ role: 'user' | 'assistant', content: '...' }]
async function callGeminiModel(model, apiKey, systemPrompt, messages) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 800 },
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(model + " error " + res.status + ": " + detail.slice(0, 300));
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("\n").trim();
  if (!text) throw new Error(model + " returned empty text");
  return text;
}

async function callCloudflareAI(ai, systemPrompt, messages) {
  const result = await ai.run(CF_MODEL, {
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    max_tokens: 800,
  });
  const text =
    (typeof result?.response === "string" && result.response) ||
    result?.choices?.[0]?.message?.content ||
    "";
  if (!text.trim()) throw new Error("Workers AI returned empty text: " + JSON.stringify(result).slice(0, 300));
  return text.trim();
}

async function generate(env, systemPrompt, messages) {
  const errors = [];

  if (env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      try {
        return await callGeminiModel(model, env.GEMINI_API_KEY, systemPrompt, messages);
      } catch (err) {
        console.error("GEMINI_FAIL", String(err));
        errors.push(String(err));
      }
    }
  }

  if (env.AI) {
    try {
      return await callCloudflareAI(env.AI, systemPrompt, messages);
    } catch (err) {
      console.error("WORKERS_AI_FAIL", String(err));
      errors.push(String(err));
    }
  } else {
    errors.push("No Workers AI binding named AI");
  }

  throw new Error(errors.join(" | "));
}

export default {
  async fetch(request, env) {
    // Reject anything whose Origin isn't our own site. This doesn't stop a determined
    // attacker spoofing the header with curl, but it blocks casual direct hits to this URL
    // and any other website's browser-side JS from using it — real browsers can't lie about
    // Origin on a cross-origin request, so this holds for every normal (non-curl) caller.
    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403, headers: corsHeaders() });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: corsHeaders() });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/mentor") {
        const raw = Array.isArray(body.messages) ? body.messages : [];
        if (raw.length > MAX_HISTORY_MESSAGES) {
          return Response.json(
            { error: `Too many messages in one request (max ${MAX_HISTORY_MESSAGES}).` },
            { status: 400, headers: corsHeaders() }
          );
        }
        for (const m of raw) {
          if (typeof m.content === "string" && m.content.length > MAX_MESSAGE_LENGTH) {
            return Response.json(
              { error: `A message is too long (max ${MAX_MESSAGE_LENGTH} characters).` },
              { status: 400, headers: corsHeaders() }
            );
          }
        }
        const messages = raw.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || ""),
        }));
        const text = await generate(env, MENTOR_SYSTEM, messages);
        return Response.json({ text }, { headers: corsHeaders() });
      }

      if (url.pathname === "/content") {
        const biz = String(body.biz || "");
        const task = String(body.task || "");
        if (biz.length > MAX_FIELD_LENGTH || task.length > MAX_FIELD_LENGTH) {
          return Response.json(
            { error: `That's too long (max ${MAX_FIELD_LENGTH} characters).` },
            { status: 400, headers: corsHeaders() }
          );
        }
        const prompt =
          `You write marketing content for teenagers running a small business.\n` +
          `Business: "${biz}".\nTask: ${task}\n` +
          `Write in a direct, young tone. No hype, no preamble — go straight to the content.`;
        const text = await generate(
          env,
          "You are a concise marketing copywriter for teenage entrepreneurs.",
          [{ role: "user", content: prompt }]
        );
        return Response.json({ text }, { headers: corsHeaders() });
      }

      return Response.json({ error: "Unknown path" }, { status: 404, headers: corsHeaders() });
    } catch (err) {
      console.error("ALL_PROVIDERS_FAILED", String(err));
      return Response.json(
        { error: "Upstream failure", detail: String(err) },
        { status: 502, headers: corsHeaders() }
      );
    }
  },
};
