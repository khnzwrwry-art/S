// legal-pages.js
// Legal page content for Launchpad.
//
// ⚠️ IMPORTANT — READ BEFORE PUBLISHING
// I am not a lawyer and this is not legal advice. This is a well-researched
// starting draft that covers the obligations that clearly apply to this app.
// Before taking payments or promoting this publicly, have a lawyer review it —
// especially the children's-data sections, which carry the highest risk here.
//
// EVERY [BRACKETED] PLACEHOLDER MUST BE FILLED IN BEFORE GOING LIVE.
// Publishing with placeholders left in is itself a compliance failure.

export const LAST_UPDATED = "September 2026";

/* ============================================================
   PRIVACY POLICY
   ============================================================ */
export const PRIVACY_POLICY = [
  { t: "Who we are",
    d: "Launchpad ('we', 'us') provides educational content and tools about entrepreneurship for teenagers. " +
       "The data controller responsible for your personal data is [FULL LEGAL NAME OF OPERATOR / REGISTERED BUSINESS], " +
       "[REGISTERED ADDRESS], contactable at [CONTACT EMAIL]." },

  { t: "Age requirements — please read first",
    d: "This service is intended for users aged 13 and over. We do not knowingly collect personal data from " +
       "children under 13. If you are under 13, do not create an account or submit any information. " +
       "If we learn we have collected data from a child under 13 without verified parental consent, we will delete it promptly. " +
       "In some countries the minimum age for consenting to data processing is higher (up to 16 in parts of the EU/EEA); " +
       "if you are under that age in your country, you need your parent or guardian's permission to use this service. " +
       "A parent or guardian can contact us at [CONTACT EMAIL] to review, correct, or delete their child's data." },

  { t: "What data we collect",
    d: "Account data: your name, email address and profile photo, received from Google when you sign in with Google. " +
       "We do not receive or store your Google password. " +
       "Usage data you create: which business-path steps you mark complete, your selected country, the fact and time " +
       "of your acceptance of these terms, posts you publish to the community feed, and any leaderboard entry you submit. " +
       "Content you type into the AI mentor or AI content tool, which is sent to Google's Gemini API to generate a response. " +
       "Technical data: standard server logs (IP address, browser type, timestamps) kept by our hosting and infrastructure " +
       "providers for security and reliability. We do not run advertising trackers or third-party analytics." },

  { t: "Why we process it, and on what legal basis",
    d: "To provide the service you asked for (creating your account, saving your progress, showing the feed) — " +
       "performance of a contract with you. " +
       "To generate AI responses when you use the mentor or content tool — performance of a contract, at your request. " +
       "To keep the service secure and prevent abuse — our legitimate interests. " +
       "To meet legal obligations, such as responding to lawful requests or keeping records of consent — legal obligation. " +
       "We do not sell your personal data, and we do not use it for behavioural advertising." },

  { t: "Who we share it with",
    d: "Google Firebase (Google Ireland Ltd / Google LLC) — authentication, database hosting and web hosting. " +
       "Google Gemini API — receives the text you submit to the AI mentor or content tool in order to generate a reply. " +
       "Cloudflare, Inc. — runs the server-side function that passes your AI requests to Google and returns the reply. " +
       "Cloudflare Workers AI — if Google's Gemini API is unavailable, your request may instead be processed by " +
       "Cloudflare's own AI model (Llama 3.3) running on Cloudflare's infrastructure, as an automatic fallback. " +
       "These providers process data on our behalf under their own data processing terms. " +
       "We do not share your data with anyone else except where required by law." },

  { t: "International data transfers",
    d: "Our providers store and process data on servers that may be located outside your country, including in the " +
       "European Union and the United States. Where data is transferred out of the EEA, UK or Israel, our providers rely on " +
       "recognised safeguards such as the European Commission's Standard Contractual Clauses and, where applicable, " +
       "the EU-US Data Privacy Framework." },

  { t: "How long we keep it",
    d: "Account data and progress: for as long as your account exists. " +
       "Feed posts and leaderboard entries: until you delete them or your account. " +
       "AI conversations: not stored by us after the reply is returned; your provider (Google) may retain them " +
       "according to their own API terms. " +
       "Server logs: retained by our providers for a limited period for security purposes. " +
       "You can ask us to delete your account and associated data at any time at [CONTACT EMAIL]." },

  { t: "Your rights",
    d: "Depending on where you live, you may have the right to access the personal data we hold about you, to correct it, " +
       "to delete it, to restrict or object to how we use it, to receive a copy in a portable format, and to withdraw consent " +
       "where we rely on it. " +
       "If you are in the EEA or UK (GDPR): you also have the right to lodge a complaint with your local supervisory authority. " +
       "If you are in California (CCPA/CPRA): you have the right to know what personal information we collect and to request " +
       "its deletion, and the right not to be discriminated against for exercising those rights. We do not sell or share " +
       "personal information as those terms are defined under the CCPA. " +
       "If you are in Israel (Protection of Privacy Law, as amended by Amendment 13): you have the right to review data held " +
       "about you and to request its correction or deletion. " +
       "To exercise any of these rights, email [CONTACT EMAIL]. We will respond within the time required by the applicable law." },

  { t: "Security",
    d: "We use HTTPS throughout, rely on Google's authentication rather than storing passwords ourselves, and restrict " +
       "database access with server-side security rules so that each user can only read and write their own data " +
       "(with the community feed and leaderboard being deliberately public to signed-in users). " +
       "No system is perfectly secure, and we cannot guarantee absolute security." },

  { t: "Changes to this policy",
    d: "We may update this policy. If we make a significant change, we will update the date at the top and, where " +
       "appropriate, notify you in the app. Continued use after an update means you accept the updated policy." },

  { t: "Contact",
    d: "Questions, requests, or complaints about privacy: [CONTACT EMAIL]. Postal address: [REGISTERED ADDRESS]." },
];

/* ============================================================
   COOKIE POLICY
   ============================================================ */
export const COOKIE_POLICY = [
  { t: "Do we use cookies?",
    d: "We use only what is strictly necessary to make the service work. Specifically: " +
       "authentication tokens (set by Google Firebase so you stay signed in), and local browser storage " +
       "used to remember your progress instantly while it syncs. " +
       "We do not use advertising cookies, analytics cookies, social media pixels, or any tracking that follows you " +
       "across other websites." },

  { t: "Do we need your consent?",
    d: "Under EU/UK rules (the ePrivacy Directive) and Israeli guidance, consent is required for cookies that are not " +
       "strictly necessary for a service the user has requested. Because we currently use only strictly necessary " +
       "storage, a cookie consent banner is not required for our current setup. " +
       "This changes the moment we add analytics, advertising, or any third-party tracking — at that point we must " +
       "show a consent banner with a genuine 'reject' option before those cookies are set. " +
       "If we add any such tool, this policy will be updated and a consent banner will appear." },

  { t: "Managing storage",
    d: "You can clear cookies and local storage at any time through your browser settings. Doing so will sign you out " +
       "and clear locally cached progress (your synced progress will reload when you sign in again)." },
];

/* ============================================================
   REFUND POLICY  (currently free — see note)
   ============================================================ */
export const REFUND_POLICY = [
  { t: "Current status: the service is free",
    d: "Launchpad does not currently charge users. No payments are collected, so there is nothing to refund. " +
       "This policy is published in advance and will apply if and when paid features are introduced." },

  { t: "If we introduce paid features",
    d: "Before any purchase or subscription is confirmed, we will clearly display, on the payment screen itself: " +
       "the total price including tax; the billing frequency for a subscription; and — where payment is split into " +
       "instalments — the number of instalments, the exact amount of each instalment, and the total amount payable " +
       "across all instalments. You will not be charged until you have seen those figures and confirmed." },

  { t: "Right of cancellation",
    d: "Consumers in the EU/UK generally have a 14-day right of withdrawal on distance purchases; " +
       "consumers in Israel have cancellation rights under the Consumer Protection Law. " +
       "For digital content delivered immediately, that right can be lost once you begin accessing the content and " +
       "have agreed to that — where this applies, we will say so clearly at checkout before you confirm. " +
       "Subscriptions can be cancelled at any time and will remain active until the end of the paid period." },

  { t: "How to request a refund",
    d: "Email [CONTACT EMAIL] with your account email and the reason for the request. We will respond within " +
       "[NUMBER] business days and, where a refund is due, issue it to the original payment method." },

  { t: "Users under 18",
    d: "If a purchase was made by a minor without their parent or guardian's permission, contact us at [CONTACT EMAIL] " +
       "and we will refund it." },
];

/* ============================================================
   ACCESSIBILITY STATEMENT  (replaces the earlier draft)
   ============================================================ */
export const ACCESSIBILITY_STATEMENT = [
  { t: "Our commitment",
    d: "We want Launchpad to be usable by as many people as possible, including people using screen readers, " +
       "keyboard-only navigation, screen magnification, or reduced-motion settings. We treat accessibility as " +
       "ongoing work, not a one-time task." },

  { t: "Conformance status",
    d: "We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. " +
       "We believe the app substantially conforms, but it has not been independently audited, and some areas " +
       "may fall short. Israeli websites serving the Israeli public are additionally subject to standard IS 5568, " +
       "which is based on WCAG 2.0 Level AA." },

  { t: "What has been implemented",
    d: "Semantic HTML with headings in logical order; text contrast meeting WCAG AA in both light and dark themes; " +
       "automatic support for the system light/dark preference; full keyboard operation with visible focus indicators; " +
       "form fields with associated labels; buttons with descriptive names rather than generic 'click here' text; " +
       "text that scales with browser zoom without breaking the layout; a responsive layout from small phones to desktop; " +
       "no flashing content and no auto-playing motion; and respect for the prefers-reduced-motion setting. " +
       "All informative illustrations carry text alternatives and are accompanied by a written explanation, " +
       "so no information is conveyed by image alone." },

  { t: "Known limitations",
    d: "Diagram illustrations convey information visually; each has a text alternative and surrounding explanation, " +
       "but complex layouts may still be harder to follow with a screen reader. " +
       "Content generated by the AI tools cannot be checked for accessibility in advance. " +
       "Third-party sites we link to are outside our control and may not be accessible." },

  { t: "Feedback and reporting a problem",
    d: "If you hit an accessibility barrier, tell us the page you were on, what you were trying to do, and what " +
       "assistive technology you use, and we will work to fix it: [CONTACT EMAIL]. " +
       "We aim to respond within [NUMBER] business days." },

  { t: "Accessibility coordinator",
    d: "[NAME OF ACCESSIBILITY COORDINATOR — required in Israel for businesses above certain thresholds; " +
       "fill in or remove after checking whether it applies to you], [CONTACT EMAIL], [PHONE]." },
];

/* ============================================================
   CONSENT TEXT FOR FORMS
   ============================================================ */
export const CONSENT_TEXT = {
  // Shown at the sign-up gate, next to a checkbox that must be actively ticked.
  signup:
    "I confirm I am 13 or older (and, if under 18, that my parent or guardian agrees to my use of this service). " +
    "I have read and accept the Terms of Use and the Privacy Policy, including how my data is used and shared as " +
    "described there.",

  // Shown above the community feed composer.
  feedPost:
    "Anything you post here is visible to every signed-in user of Launchpad. Do not post your full name, phone number, " +
    "address, school, payment details, or anyone else's personal information.",

  // Shown above the leaderboard submission form.
  leaderboard:
    "Your entry — including your name, business type, reported sales figure and any link you provide — will be visible " +
    "to all signed-in users. Sales figures are self-reported and are not verified by us.",

  // Shown above the AI mentor and AI content tool inputs.
  aiTools:
    "What you type here is sent to Google's Gemini API to generate a reply. Do not enter personal, financial, or " +
    "confidential information. AI responses can be wrong — check anything important before acting on it.",
};
