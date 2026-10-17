// worker.js — Cloudflare Worker backend for Startlet
// Text:  Gemini 3.5 Flash -> Gemini 3.1 Flash-Lite -> Workers AI Llama 3.3 70B
// Image: Gemini 3.5 Flash -> Gemini 3.1 Flash-Lite -> Workers AI Llama 4 Scout (vision)
// Gemini calls time out, and a failed Gemini model is skipped for 5 minutes.
// Requires: secret GEMINI_API_KEY, and a Workers AI binding named "AI".

// Sites allowed to call this Worker. The old Firebase address stays during the move.
const ALLOWED_ORIGINS = [
  "https://startlet.app",
  "https://www.startlet.app",
  "https://launchpad-e6280.web.app",
];

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_FIELD_LENGTH = 2000; // for /content's biz/task fields

const MENTOR_SYSTEM =
  "You are a business mentor for teenagers starting their first business. " +
  "Answer in English, short and direct, with practical steps they can take today. " +
  "No get-rich promises. If something requires a parent, a bank account or tax " +
  "reporting, say so explicitly. If you need more information, ask one focused question. " +
  "If the user sends a photo, give specific, constructive feedback on what you see " +
  "(a product, a design, a price list, a shop page). Never try to identify people in photos. " +
  "If a photo shows a face, a school uniform, an address, a phone number or other personal " +
  "details, gently remind them not to share personal information online.";

const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
const CF_TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const CF_VISION_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const GEMINI_TIMEOUT_TEXT_MS = 6000;
const GEMINI_TIMEOUT_IMAGE_MS = 10000;
const GEMINI_COOLDOWN_MS = 5 * 60 * 1000;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

// Remembered while this Worker instance stays warm.
const skipUntil = {};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

class BadRequest extends Error {}

// Accepts [{ role, content, image?: { mimeType, data } }]. Only the newest user message may carry an image.
function normalizeMessages(raw) {
  const list = Array.isArray(raw) ? raw : [];
  if (list.length > MAX_HISTORY_MESSAGES) {
    throw new BadRequest(`Too many messages in one request (max ${MAX_HISTORY_MESSAGES}).`);
  }
  let lastUserIndex = -1;
  list.forEach((m, i) => { if (m && m.role !== "assistant") lastUserIndex = i; });

  let hasImage = false;
  const messages = list.map((m, i) => {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    let content = String((m && m.content) || "");
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequest(`A message is too long (max ${MAX_MESSAGE_LENGTH} characters).`);
    }
    let image = null;

    if (m && m.image && i === lastUserIndex) {
      const mimeType = String(m.image.mimeType || "").toLowerCase();
      const data = String(m.image.data || "").replace(/^data:[^,]+,/, "").replace(/\s/g, "");
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        throw new BadRequest("Only JPEG, PNG or WebP images are allowed.");
      }
      if (!/^[A-Za-z0-9+/=]+$/.test(data)) {
        throw new BadRequest("Image data is not valid.");
      }
      if (Math.floor((data.length * 3) / 4) > MAX_IMAGE_BYTES) {
        throw new BadRequest("Image is too large. Please use a smaller photo.");
      }
      image = { mimeType, data };
      hasImage = true;
      if (!content.trim()) content = "What do you think of this?";
    } else if (m && m.image) {
      content = (content ? content + " " : "") + "(sent a photo earlier)";
    }
    return { role, content, image };
  });

  return { messages, hasImage };
}

async function callGeminiModel(model, apiKey, systemPrompt, messages, timeoutMs) {
  const contents = messages.map((m) => {
    const parts = [{ text: m.content }];
    if (m.image) parts.push({ inlineData: { mimeType: m.image.mimeType, data: m.image.data } });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
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
        signal: controller.signal,
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
  } catch (err) {
    if (err.name === "AbortError") throw new Error(model + " timed out after " + timeoutMs + "ms");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function callCloudflareAI(ai, systemPrompt, messages, hasImage) {
  const model = hasImage ? CF_VISION_MODEL : CF_TEXT_MODEL;
  const cfMessages = [{ role: "system", content: systemPrompt }].concat(
    messages.map((m) => {
      if (!m.image) return { role: m.role, content: m.content };
      return {
        role: m.role,
        content: [
          { type: "text", text: m.content },
          { type: "image_url", image_url: { url: "data:" + m.image.mimeType + ";base64," + m.image.data } },
        ],
      };
    })
  );
  const result = await ai.run(model, { messages: cfMessages, max_tokens: 800 });
  const text =
    (typeof result?.response === "string" && result.response) ||
    result?.choices?.[0]?.message?.content ||
    "";
  if (!text.trim()) throw new Error(model + " returned empty text: " + JSON.stringify(result).slice(0, 300));
  return { text: text.trim(), model };
}

async function generate(env, systemPrompt, messages, hasImage) {
  const errors = [];
  const now = Date.now();
  const timeoutMs = hasImage ? GEMINI_TIMEOUT_IMAGE_MS : GEMINI_TIMEOUT_TEXT_MS;
  const kind = hasImage ? "image" : "text";

  if (env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      if (skipUntil[model] && skipUntil[model] > now) continue;
      const started = Date.now();
      try {
        const text = await callGeminiModel(model, env.GEMINI_API_KEY, systemPrompt, messages, timeoutMs);
        console.log("PROVIDER_OK", model, kind, Date.now() - started + "ms");
        return text;
      } catch (err) {
        skipUntil[model] = Date.now() + GEMINI_COOLDOWN_MS;
        console.error("GEMINI_FAIL", kind, String(err), Date.now() - started + "ms");
        errors.push(String(err));
      }
    }
  }

  if (env.AI) {
    const started = Date.now();
    try {
      const out = await callCloudflareAI(env.AI, systemPrompt, messages, hasImage);
      console.log("PROVIDER_OK", out.model, kind, Date.now() - started + "ms");
      return out.text;
    } catch (err) {
      console.error("WORKERS_AI_FAIL", kind, String(err));
      errors.push(String(err));
    }
  } else {
    errors.push("No Workers AI binding named AI");
  }

  throw new Error(errors.join(" | "));
}

export default {
  async fetch(request, env) {
    // Reject anything whose Origin isn't one of our own sites. This doesn't stop someone
    // spoofing the header with curl, but it blocks other websites' browser code from using
    // this Worker: real browsers can't fake Origin on a cross-origin request.
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin);
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403, headers: cors });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: cors });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/mentor") {
        const { messages, hasImage } = normalizeMessages(body.messages);
        const text = await generate(env, MENTOR_SYSTEM, messages, hasImage);
        return Response.json({ text }, { headers: cors });
      }

      if (url.pathname === "/content") {
        const biz = String(body.biz || "");
        const task = String(body.task || "");
        if (biz.length > MAX_FIELD_LENGTH || task.length > MAX_FIELD_LENGTH) {
          throw new BadRequest(`That's too long (max ${MAX_FIELD_LENGTH} characters).`);
        }
        const prompt =
          `You write marketing content for teenagers running a small business.\n` +
          `Business: "${biz}".\nTask: ${task}\n` +
          `Write in a direct, young tone. No hype, no preamble — go straight to the content.`;
        const text = await generate(
          env,
          "You are a concise marketing copywriter for teenage entrepreneurs.",
          [{ role: "user", content: prompt, image: null }],
          false
        );
        return Response.json({ text }, { headers: cors });
      }

      return Response.json({ error: "Unknown path" }, { status: 404, headers: cors });
    } catch (err) {
      if (err instanceof BadRequest) {
        return Response.json({ error: err.message }, { status: 400, headers: cors });
      }
      console.error("ALL_PROVIDERS_FAILED", String(err));
      return Response.json(
        { error: "Upstream failure", detail: String(err) },
        { status: 502, headers: cors }
      );
    }
  },
};
