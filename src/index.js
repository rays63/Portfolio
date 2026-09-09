import { EmailMessage } from "cloudflare:email";
import { createMimeMessage, Mailbox } from "mimetext";

// Email Routing only delivers to a verified destination address, so the
// recipient is fixed here rather than taken from the request.
const MAIL_TO = "raymondmhz63@gmail.com";
const MAIL_FROM = "noreply@maharjanraymond.com.np";
const ALLOWED_ORIGINS = [
  "https://www.maharjanraymond.com.np",
  "https://maharjanraymond.com.np"
];

const LIMITS = { name: 100, email: 200, message: 5000, messageMin: 10 };

// The _headers file only covers static assets, so Worker responses set their
// own. no-store matters most: nothing here should ever be cached.
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin"
    }
  });

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

// Name and email land in mail headers, so every control character goes --
// a stray CRLF there would let someone inject their own headers.
// eslint-disable-next-line no-control-regex
const HEADER_CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
// The message is body text, so real line breaks survive; everything else goes.
// eslint-disable-next-line no-control-regex
const BODY_CONTROL_CHARS = /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g;

const cleanHeader = (value) =>
  typeof value === "string" ? value.replace(HEADER_CONTROL_CHARS, "").trim() : "";

const cleanBody = (value) =>
  typeof value === "string"
    ? value.replace(/\r\n?/g, "\n").replace(BODY_CONTROL_CHARS, "").trim()
    : "";

async function handleContact(request, env) {
  if (!ALLOWED_ORIGINS.includes(request.headers.get("origin"))) {
    return json({ ok: false, error: "Bad origin." }, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Expected JSON." }, 415);
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  // Two tiers on purpose. This one counts every request, including malformed
  // ones, so nobody can hammer the endpoint for free.
  const guard = await env.CONTACT_LIMITER.limit({ key: ip });
  if (!guard.success) {
    return json({ ok: false, error: "Too many requests. Try again in a minute." }, 429);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }

  // Honeypot: real people never see this field, so anything in it is a bot.
  // Report success so the bot gets no signal to retry against.
  if (cleanHeader(payload.company)) return json({ ok: true });

  const name = cleanHeader(payload.name);
  const email = cleanHeader(payload.email);
  const message = cleanBody(payload.message);

  if (!name || !email || !message) {
    return json({ ok: false, error: "Please fill in every field." }, 400);
  }
  if (name.length > LIMITS.name || email.length > LIMITS.email) {
    return json({ ok: false, error: "Name or email is too long." }, 400);
  }
  if (!isEmail(email)) {
    return json({ ok: false, error: "That email address doesn't look right." }, 400);
  }
  if (message.length < LIMITS.messageMin) {
    return json({ ok: false, error: "Please write a little more." }, 400);
  }
  if (message.length > LIMITS.message) {
    return json({ ok: false, error: "Message is too long (5000 characters max)." }, 400);
  }

  const meta = [
    `IP:      ${ip}`,
    `Country: ${request.cf?.country ?? "unknown"}`,
    `Agent:   ${(request.headers.get("user-agent") ?? "unknown").slice(0, 200)}`
  ].join("\n");

  const sendQuota = await env.SEND_LIMITER.limit({ key: ip });
  if (!sendQuota.success) {
    return json({ ok: false, error: "Too many messages. Try again in a minute." }, 429);
  }

  try {
    const mail = createMimeMessage();
    mail.setSender({ name: "Portfolio contact form", addr: MAIL_FROM });
    mail.setRecipient(MAIL_TO);
    // Replying in the mail client answers the visitor, not the form.
    // mimetext validates Reply-To as a single mailbox, so it must be a Mailbox
    // instance -- a formatted string or plain object is rejected.
    mail.setHeader("Reply-To", new Mailbox({ addr: email, name }));
    mail.setSubject(`Portfolio contact — ${name}`);
    mail.addMessage({
      contentType: "text/plain",
      data: `${name} <${email}> sent this from your portfolio:\n\n${message}\n\n---\n${meta}\n`
    });

    await env.EMAIL.send(new EmailMessage(MAIL_FROM, MAIL_TO, mail.asRaw()));
  } catch (error) {
    console.error("contact form send failed:", error?.message ?? error);
    return json({ ok: false, error: "Couldn't send that. Please email me directly." }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/contact") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed." }, 405);
      }
      try {
        return await handleContact(request, env);
      } catch (error) {
        console.error("contact form crashed:", error?.stack ?? error);
        return json({ ok: false, error: "Unexpected error. Please email me directly." }, 500);
      }
    }

    // Everything else is the static site.
    return env.ASSETS.fetch(request);
  }
};
