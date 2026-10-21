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

// Startlet's Acceptable Use Policy for the AI tools (published at https://startlet.app/#acceptable-use).
// Added to both system prompts so every model, including the Workers AI fallback, follows it.
const SAFETY_RULES =
  "Content rules (Startlet Acceptable Use Policy) - these always apply and override any user request: " +
  "never produce sexually explicit, sexually suggestive, erotic, pornographic or other NSFW content, nudity, " +
  "sexual role-play or anything that sexualises a person, and never respond to such content in a photo. " +
  "Any sexual content involving minors is absolutely forbidden. Do not help with illegal or age-restricted " +
  "products or services (drugs, weapons, alcohol, tobacco, vapes, gambling, adult or sexual products), hate, " +
  "harassment, self-harm, violence, fraud, scams, hacking, fake reviews or deceptive marketing. If a request or " +
  "photo breaks these rules, refuse in one or two sentences, say it is not allowed under Startlet's Acceptable " +
  "Use Policy, do not describe the content, and offer to help with a legitimate business question instead.";

// Sent to the user when a provider's safety filter blocks a request.
const REFUSAL_TEXT =
  "Sorry, I can't help with that. It isn't allowed under Startlet's Acceptable Use Policy. " +
  "Ask me anything about building a legitimate business instead.";

// Gemini safety filters. Sexually explicit content is blocked at the strictest level.
const GEMINI_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];
const SAFETY_FINISH_REASONS = ["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "IMAGE_SAFETY"];

const MENTOR_SYSTEM =
  "You are a business mentor for teenagers starting their first business. " +
  "Answer in English, short and direct, with practical steps they can take today. " +
  "No get-rich promises. If something requires a parent, a bank account or tax " +
  "reporting, say so explicitly. If you need more information, ask one focused question. " +
  "If the user sends a photo, give specific, constructive feedback on what you see " +
  "(a product, a design, a price list, a shop page). Never try to identify people in photos. " +
  "If a photo shows a face, a school uniform, an address, a phone number or other personal " +
  "details, gently remind them not to share personal information online." +
  " " + SAFETY_RULES;

const CONTENT_SYSTEM =
  "You are a concise marketing copywriter for teenage entrepreneurs. " + SAFETY_RULES;

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
// Thrown when Gemini's safety filter blocks a request. Not a provider failure:
// we answer with REFUSAL_TEXT and don't fall back to another model.
class SafetyBlocked extends Error {}

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
    const parts = m.image
      ? [{ text: m.content }, { inlineData: { mimeType: m.image.mimeType, data: m.image.data } }]
      : [{ text: m.content }];
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
          safetySettings: GEMINI_SAFETY_SETTINGS,
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
    const blockReason = data?.promptFeedback?.blockReason;
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (blockReason || SAFETY_FINISH_REASONS.includes(finishReason)) {
      throw new SafetyBlocked(model + " safety block: " + (blockReason || finishReason));
    }
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
        if (err instanceof SafetyBlocked) {
          console.log("SAFETY_BLOCK", kind, String(err));
          return REFUSAL_TEXT;
        }
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

/* =====================================================================
   BILLING (Creem) + Firebase helpers
   Secrets (Cloudflare → Worker → Settings → Variables and Secrets):
     CREEM_API_KEY            Creem API key (test key while CREEM_MODE is "test")
     CREEM_WEBHOOK_SECRET     Creem webhook signing secret
     FIREBASE_SERVICE_ACCOUNT the whole service-account JSON from Firebase
   Plain variables (optional):
     CREEM_MODE               "test" (default) or "live"
     CREEM_PRODUCT_MONTHLY    product id (defaults to the test product below)
     CREEM_PRODUCT_YEARLY     product id (defaults to the test product below)
     REQUIRE_SUBSCRIPTION     "true" to block /mentor and /content without an active plan
   ===================================================================== */

const FIREBASE_PROJECT = "launchpad-e6280";
const SITE_URL = "https://startlet.app";
const TEST_PRODUCTS = { monthly: "prod_4glFUdmCsSywNGXygD8C2g", yearly: "prod_7LhEcxkat6pOd8540IRxIU" };
// Statuses that give access to the app. "canceled" still gives access until the paid period ends.
const ACCESS_STATUSES = ["active", "trialing", "scheduled_cancel", "past_due"];

class AuthError extends Error {}

function creemBase(env) {
  return env.CREEM_MODE === "live" ? "https://api.creem.io" : "https://test-api.creem.io";
}
function productFor(env, plan) {
  if (plan === "yearly") return env.CREEM_PRODUCT_YEARLY || TEST_PRODUCTS.yearly;
  return env.CREEM_PRODUCT_MONTHLY || TEST_PRODUCTS.monthly;
}

async function creem(env, method, path, body) {
  if (!env.CREEM_API_KEY) throw new Error("CREEM_API_KEY is not set");
  const res = await fetch(creemBase(env) + path, {
    method,
    headers: { "x-api-key": env.CREEM_API_KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* keep text */ }
  if (!res.ok) throw new Error("Creem " + path + " " + res.status + ": " + text.slice(0, 300));
  return data;
}

// ---- base64url / PEM helpers ----
function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
function bytesToB64url(bytes) {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function strToB64url(s) { return bytesToB64url(new TextEncoder().encode(s)); }

// ---- Verify a Firebase ID token sent by the app ----
let jwksCache = { keys: null, exp: 0 };
async function firebaseJwks() {
  if (jwksCache.keys && jwksCache.exp > Date.now()) return jwksCache.keys;
  const res = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
  const data = await res.json();
  jwksCache = { keys: data.keys || [], exp: Date.now() + 60 * 60 * 1000 };
  return jwksCache.keys;
}
async function verifyIdToken(token) {
  if (!token || typeof token !== "string") throw new AuthError("Please sign in again.");
  const parts = token.split(".");
  if (parts.length !== 3) throw new AuthError("Please sign in again.");
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== "RS256") throw new AuthError("Please sign in again.");
  if (payload.aud !== FIREBASE_PROJECT || payload.iss !== "https://securetoken.google.com/" + FIREBASE_PROJECT)
    throw new AuthError("Please sign in again.");
  if (!payload.sub || payload.exp < now || payload.iat > now + 300) throw new AuthError("Please sign in again.");
  const jwk = (await firebaseJwks()).find((k) => k.kid === header.kid);
  if (!jwk) throw new AuthError("Please sign in again.");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!ok) throw new AuthError("Please sign in again.");
  return { uid: payload.sub, email: payload.email || null };
}

// ---- Firestore REST access with the service account ----
let gToken = { value: null, exp: 0 };
async function googleAccessToken(env) {
  if (gToken.value && gToken.exp > Date.now() + 60000) return gToken.value;
  if (!env.FIREBASE_SERVICE_ACCOUNT) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const unsigned = strToB64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + strToB64url(JSON.stringify({
    iss: sa.client_email, scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = await crypto.subtle.importKey("pkcs8", b64urlToBytes(pem.replace(/\+/g, "-").replace(/\//g, "_")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + unsigned + "." + bytesToB64url(sig),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Google token error: " + JSON.stringify(data).slice(0, 200));
  gToken = { value: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return gToken.value;
}
const FS_BASE = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT + "/databases/(default)/documents";
function toFs(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
function fromFs(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) {
    out[k] = "stringValue" in v ? v.stringValue : "integerValue" in v ? Number(v.integerValue)
      : "doubleValue" in v ? v.doubleValue : "booleanValue" in v ? v.booleanValue : null;
  }
  return out;
}
async function fsGetSub(env, uid) {
  const res = await fetch(FS_BASE + "/subscriptions/" + encodeURIComponent(uid), {
    headers: { Authorization: "Bearer " + (await googleAccessToken(env)) },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Firestore read " + res.status);
  return fromFs((await res.json()).fields);
}
async function fsSetSub(env, uid, data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toFs(v);
  const mask = Object.keys(data).map((k) => "updateMask.fieldPaths=" + encodeURIComponent(k)).join("&");
  const res = await fetch(FS_BASE + "/subscriptions/" + encodeURIComponent(uid) + "?" + mask, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + (await googleAccessToken(env)), "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error("Firestore write " + res.status + ": " + (await res.text()).slice(0, 200));
}
async function fsFindUidByCustomer(env, customerId) {
  const res = await fetch(FS_BASE + ":runQuery", {
    method: "POST",
    headers: { Authorization: "Bearer " + (await googleAccessToken(env)), "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: "subscriptions" }],
      where: { fieldFilter: { field: { fieldPath: "customerId" }, op: "EQUAL", value: { stringValue: customerId } } },
      limit: 1,
    } }),
  });
  const rows = await res.json();
  const name = rows && rows[0] && rows[0].document && rows[0].document.name;
  return name ? decodeURIComponent(name.split("/").pop()) : null;
}

function hasAccess(sub) {
  if (!sub) return false;
  if (ACCESS_STATUSES.includes(sub.status)) return true;
  return sub.status === "canceled" && sub.periodEnd && Date.parse(sub.periodEnd) > Date.now();
}
const accessCache = new Map(); // uid -> { ok, exp }
async function requireAccess(env, idToken) {
  const { uid } = await verifyIdToken(idToken);
  const c = accessCache.get(uid);
  if (c && c.exp > Date.now()) { if (!c.ok) throw new AuthError("An active Startlet Pro plan is needed."); return uid; }
  const ok = hasAccess(await fsGetSub(env, uid));
  accessCache.set(uid, { ok, exp: Date.now() + (ok ? 10 : 1) * 60 * 1000 });
  if (!ok) throw new AuthError("An active Startlet Pro plan is needed.");
  return uid;
}

// ---- Creem webhook ----
async function verifyCreemSignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  const expected = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  const got = header.trim().toLowerCase();
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}
async function handleCreemWebhook(request, env) {
  const raw = await request.text();
  if (!(await verifyCreemSignature(raw, request.headers.get("creem-signature"), env.CREEM_WEBHOOK_SECRET))) {
    console.error("WEBHOOK_BAD_SIGNATURE");
    return new Response("Invalid signature", { status: 401 });
  }
  const evt = JSON.parse(raw);
  const type = evt.eventType;
  const obj = evt.object || {};
  // checkout.completed carries the subscription nested; subscription.* events carry it at the top.
  const sub = type === "checkout.completed" ? (obj.subscription || {}) : obj;
  const customer = obj.customer || sub.customer || {};
  const customerId = typeof customer === "string" ? customer : customer.id;
  const meta = obj.metadata || sub.metadata || {};
  let uid = meta.uid || null;
  if (!uid && customerId) uid = await fsFindUidByCustomer(env, customerId);
  console.log("WEBHOOK", type, "uid=" + uid, "status=" + (sub.status || ""));
  if (!uid) return new Response("ok (no user)", { status: 200 });
  if (!type.startsWith("subscription.") && type !== "checkout.completed") return new Response("ok", { status: 200 });
  const product = sub.product || obj.product || {};
  await fsSetSub(env, uid, {
    status: sub.status || (type === "checkout.completed" ? "trialing" : "unknown"),
    subscriptionId: sub.id || null,
    customerId: customerId || null,
    productId: typeof product === "string" ? product : product.id || null,
    periodEnd: sub.current_period_end_date || null,
    lastEvent: type,
    mode: env.CREEM_MODE === "live" ? "live" : "test",
    updatedAt: new Date().toISOString(),
  });
  accessCache.delete(uid);
  return new Response("ok", { status: 200 });
}

async function handleBilling(path, body, env) {
  const { uid, email } = await verifyIdToken(body.idToken);
  if (path === "/checkout") {
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const forParent = body.forParent === true;
    const payload = {
      product_id: productFor(env, plan),
      request_id: uid + "_" + Date.now(),
      success_url: SITE_URL + "/?checkout=success",
      metadata: { uid, plan, forParent: forParent ? "yes" : "no" },
    };
    if (email && !forParent) payload.customer = { email };
    const out = await creem(env, "POST", "/v1/checkouts", payload);
    return { url: out.checkout_url };
  }
  if (path === "/portal") {
    const sub = await fsGetSub(env, uid);
    if (!sub || !sub.customerId) throw new BadRequest("No subscription found yet.");
    const out = await creem(env, "POST", "/v1/customers/billing", { customer_id: sub.customerId });
    return { url: out.customer_portal_link };
  }
  if (path === "/cancel-now") {
    // Used when a user deletes their account: stop billing immediately.
    const sub = await fsGetSub(env, uid);
    if (sub && sub.subscriptionId && hasAccess(sub)) {
      await creem(env, "POST", "/v1/subscriptions/" + encodeURIComponent(sub.subscriptionId) + "/cancel", { mode: "immediate" });
    }
    return { ok: true };
  }
  throw new BadRequest("Unknown billing action");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Creem calls this from its servers (no browser Origin). It's protected by the signature instead.
    if (url.pathname === "/webhooks/creem" && request.method === "POST") {
      try { return await handleCreemWebhook(request, env); }
      catch (err) { console.error("WEBHOOK_FAIL", String(err)); return new Response("error", { status: 500 }); }
    }

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

    try {
      if (["/checkout", "/portal", "/cancel-now"].includes(url.pathname)) {
        return Response.json(await handleBilling(url.pathname, body, env), { headers: cors });
      }
      if ((url.pathname === "/mentor" || url.pathname === "/content") && env.REQUIRE_SUBSCRIPTION === "true") {
        await requireAccess(env, body.idToken);
      }
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
          CONTENT_SYSTEM,
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
      if (err instanceof AuthError) {
        return Response.json({ error: err.message }, { status: 401, headers: cors });
      }
      if (String(err).includes("Creem") || String(err).includes("Firestore") || String(err).includes("CREEM") || String(err).includes("FIREBASE")) {
        console.error("BILLING_FAIL", String(err));
        return Response.json({ error: "Billing is temporarily unavailable. Please try again." }, { status: 502, headers: cors });
      }
      console.error("ALL_PROVIDERS_FAILED", String(err));
      return Response.json(
        { error: "Upstream failure", detail: String(err) },
        { status: 502, headers: cors }
      );
    }
  },
};
