// Cloudflare Access JWT verification.
//
// Access already blocks unauthenticated requests at the edge, but the Worker
// verifies the assertion too. Without this, anything that reached the Worker
// by another path (a route change, a misconfigured Access policy) would be
// treated as authenticated.
//
// Fails closed: if ACCESS_TEAM_DOMAIN or ACCESS_AUD is unset, every admin
// request is refused rather than allowed through unprotected.

const CERTS_TTL_MS = 60 * 60 * 1000;
let certsCache = { url: null, fetchedAt: 0, keys: null };

const b64urlToBytes = (input) => {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

const b64urlToText = (input) => new TextDecoder().decode(b64urlToBytes(input));

async function loadKeys(teamDomain) {
  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const fresh = certsCache.url === url && Date.now() - certsCache.fetchedAt < CERTS_TTL_MS;
  if (fresh && certsCache.keys) return certsCache.keys;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`certs fetch failed: ${response.status}`);
  const { keys } = await response.json();
  if (!Array.isArray(keys) || !keys.length) throw new Error("no keys in certs response");

  certsCache = { url, fetchedAt: Date.now(), keys };
  return keys;
}

/**
 * Verifies the Cf-Access-Jwt-Assertion header.
 * Returns { ok: true, email } or { ok: false, status, error }.
 */
export async function verifyAccess(request, env) {
  const teamDomain = env.ACCESS_TEAM_DOMAIN;
  const expectedAud = env.ACCESS_AUD;

  if (!teamDomain || !expectedAud) {
    return {
      ok: false,
      status: 503,
      error: "Admin is not configured yet (ACCESS_TEAM_DOMAIN / ACCESS_AUD missing)."
    };
  }

  const token =
    request.headers.get("cf-access-jwt-assertion") ??
    (request.headers.get("cookie") ?? "").match(/CF_Authorization=([^;]+)/)?.[1];

  if (!token) return { ok: false, status: 401, error: "Not signed in." };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, status: 401, error: "Malformed token." };

  let header;
  let claims;
  try {
    header = JSON.parse(b64urlToText(parts[0]));
    claims = JSON.parse(b64urlToText(parts[1]));
  } catch {
    return { ok: false, status: 401, error: "Unreadable token." };
  }

  let keys;
  try {
    keys = await loadKeys(teamDomain);
  } catch (error) {
    console.error("access certs error:", error?.message);
    return { ok: false, status: 503, error: "Couldn't verify sign-in right now." };
  }

  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return { ok: false, status: 401, error: "Unknown signing key." };

  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!valid) return { ok: false, status: 401, error: "Invalid signature." };

  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(expectedAud)) {
    return { ok: false, status: 403, error: "Token is for a different application." };
  }

  if (claims.iss !== `https://${teamDomain}`) {
    return { ok: false, status: 403, error: "Unexpected token issuer." };
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || claims.exp < now) {
    return { ok: false, status: 401, error: "Session expired. Reload the page." };
  }
  if (typeof claims.nbf === "number" && claims.nbf > now + 60) {
    return { ok: false, status: 401, error: "Token not yet valid." };
  }

  // Optional extra gate: only these addresses may edit, even if the Access
  // policy is ever loosened.
  const allowed = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (claims.email ?? "").toLowerCase();
  if (allowed.length && !allowed.includes(email)) {
    return { ok: false, status: 403, error: "This account isn't allowed to edit." };
  }

  return { ok: true, email: claims.email ?? "unknown" };
}
