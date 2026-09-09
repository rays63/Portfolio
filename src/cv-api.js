// CV upload.
//
// Commits public/cv.pdf to the repo, exactly like content.json, so the deploy
// workflow rebuilds and the new PDF ships as a static asset. That keeps one
// storage mechanism instead of two, versions every CV in git, and needs no
// extra Cloudflare service.

const CV_PATH = "public/cv.pdf";

// GitHub's contents API wants base64 and gets unhappy well before its hard
// limit, so cap this at a size no real CV exceeds.
export const MAX_BYTES = 2 * 1024 * 1024;

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

const githubHeaders = (env) => ({
  authorization: `Bearer ${env.GITHUB_TOKEN}`,
  accept: "application/vnd.github+json",
  "user-agent": "portfolio-admin-worker",
  "x-github-api-version": "2022-11-28"
});

const cvUrl = (env) => `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${CV_PATH}`;

export const toBase64 = (bytes) => {
  // Chunked so a large file can't blow the argument limit on String.fromCharCode.
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

// A PDF always starts with "%PDF-". Checking the bytes rather than trusting the
// content-type header stops a renamed .exe or .html being published as a CV.
export const looksLikePdf = (bytes) =>
  bytes.length > 5 &&
  bytes[0] === 0x25 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x44 &&
  bytes[3] === 0x46 &&
  bytes[4] === 0x2d;

async function currentSha(env) {
  const response = await fetch(`${cvUrl(env)}?ref=${encodeURIComponent(env.CONTENT_BRANCH)}`, {
    headers: githubHeaders(env)
  });
  if (response.status === 404) return null; // first upload; no file to replace
  if (!response.ok) throw new Error(`sha lookup failed: ${response.status}`);
  const file = await response.json();
  return file.sha ?? null;
}

export async function getCvInfo(env) {
  try {
    const response = await fetch(`${cvUrl(env)}?ref=${encodeURIComponent(env.CONTENT_BRANCH)}`, {
      headers: githubHeaders(env)
    });
    if (response.status === 404) return json({ ok: true, exists: false });
    if (!response.ok) {
      return json({ ok: false, error: `Couldn't read the CV (${response.status}).` }, 502);
    }
    const file = await response.json();
    return json({ ok: true, exists: true, size: file.size, sha: file.sha });
  } catch (error) {
    console.error("cv info failed:", error?.message);
    return json({ ok: false, error: "Couldn't read the current CV." }, 502);
  }
}

export async function putCv(request, env, editor) {
  const body = new Uint8Array(await request.arrayBuffer());

  if (!body.length) {
    return json({ ok: false, error: "No file received." }, 400);
  }
  if (body.length > MAX_BYTES) {
    const mb = (body.length / 1024 / 1024).toFixed(1);
    return json({ ok: false, error: `That file is ${mb}MB. Maximum is 2MB.` }, 413);
  }
  if (!looksLikePdf(body)) {
    return json({ ok: false, error: "That doesn't look like a PDF file." }, 415);
  }

  let sha;
  try {
    sha = await currentSha(env);
  } catch (error) {
    console.error("cv sha lookup failed:", error?.message);
    return json({ ok: false, error: "Couldn't reach GitHub. Try again." }, 502);
  }

  const response = await fetch(cvUrl(env), {
    method: "PUT",
    headers: { ...githubHeaders(env), "content-type": "application/json" },
    body: JSON.stringify({
      message: `content: update CV via admin\n\nUploaded by ${editor}`,
      content: toBase64(body),
      branch: env.CONTENT_BRANCH,
      ...(sha ? { sha } : {})
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("cv write failed:", response.status, detail.slice(0, 300));
    return json({ ok: false, error: `Couldn't save the CV (${response.status}).` }, 502);
  }

  const result = await response.json();
  return json({
    ok: true,
    commit: result.commit?.sha?.slice(0, 7),
    size: body.length,
    message: "CV uploaded. It goes live in about a minute."
  });
}
