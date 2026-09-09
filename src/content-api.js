// Admin content API.
//
// Reads and writes app/content.json in the GitHub repo. Writing commits to the
// production branch, which triggers the deploy workflow -- so the site rebuilds
// with the new content instead of serving it dynamically. That keeps every page
// statically rendered (good for search engines) and every edit in git history.

const CONTENT_PATH = "app/content.json";
const MAX_BYTES = 128 * 1024;

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

// btoa() only handles latin1, so multibyte characters must be encoded first.
const toBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const fromBase64 = (b64) => {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const githubHeaders = (env) => ({
  authorization: `Bearer ${env.GITHUB_TOKEN}`,
  accept: "application/vnd.github+json",
  "user-agent": "portfolio-admin-worker",
  "x-github-api-version": "2022-11-28"
});

const repoUrl = (env) =>
  `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${CONTENT_PATH}`;

// ---------------------------------------------------------------------------
// Validation. This payload ends up committed and deployed, so it is checked
// structurally rather than trusted -- a malformed shape would break the build.
// ---------------------------------------------------------------------------

const isStr = (v, max = 2000) => typeof v === "string" && v.length <= max;
const isStrArray = (v, max) => Array.isArray(v) && v.every((x) => isStr(x, max));

const shape = {
  profile: (v) =>
    v &&
    typeof v === "object" &&
    ["name", "role", "tagline", "about", "location", "availability", "email", "github", "linkedin"].every(
      (k) => isStr(v[k], 4000)
    ),
  highlights: (v) =>
    Array.isArray(v) && v.length <= 6 && v.every((x) => isStr(x?.metric, 40) && isStr(x?.label, 300)),
  competencies: (v) =>
    Array.isArray(v) && v.length <= 12 && v.every((x) => isStr(x?.title, 200) && isStr(x?.icon, 40)),
  pillars: (v) =>
    Array.isArray(v) &&
    v.length <= 6 &&
    v.every((x) => isStr(x?.label, 80) && isStr(x?.desc, 400) && isStr(x?.icon, 40)),
  skillFilters: (v) =>
    Array.isArray(v) && v.length <= 12 && v.every((x) => isStr(x?.key, 40) && isStr(x?.label, 60)),
  skills: (v) =>
    Array.isArray(v) &&
    v.length <= 80 &&
    v.every((x) => isStr(x?.name, 80) && isStr(x?.group, 40) && isStr(x?.icon, 40)),
  experience: (v) =>
    Array.isArray(v) &&
    v.length >= 1 &&
    v.length <= 20 &&
    v.every(
      (x) =>
        isStr(x?.company, 200) &&
        isStr(x?.location, 200) &&
        isStr(x?.role, 200) &&
        isStr(x?.period, 100) &&
        isStrArray(x?.responsibilities, 600)
    ),
  education: (v) =>
    Array.isArray(v) &&
    v.length <= 20 &&
    v.every(
      (x) =>
        isStr(x?.school, 200) && isStr(x?.period, 100) && isStr(x?.program, 300) && isStr(x?.location, 200)
    ),
  sections: (v) =>
    v && typeof v === "object" && ["projectsSubtitle", "contactIntro", "cvIntro"].every((k) => isStr(v[k], 1000))
};

export function validateContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return "Content must be an object.";
  }
  const expected = Object.keys(shape);
  const extra = Object.keys(content).filter((k) => !expected.includes(k));
  if (extra.length) return `Unexpected field(s): ${extra.join(", ")}`;

  for (const key of expected) {
    if (!(key in content)) return `Missing field: ${key}`;
    if (!shape[key](content[key])) return `Invalid value for: ${key}`;
  }
  // The experience section renders experience[0], so it must never be empty.
  if (!content.experience.length) return "At least one experience entry is required.";
  return null;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function getContent(env) {
  const response = await fetch(`${repoUrl(env)}?ref=${encodeURIComponent(env.CONTENT_BRANCH)}`, {
    headers: githubHeaders(env)
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("github read failed:", response.status, detail.slice(0, 300));
    return json({ ok: false, error: `Couldn't read content from GitHub (${response.status}).` }, 502);
  }

  const file = await response.json();
  let content;
  try {
    content = JSON.parse(fromBase64(file.content));
  } catch (error) {
    console.error("content.json is not valid JSON:", error?.message);
    return json({ ok: false, error: "Stored content is not valid JSON." }, 500);
  }

  // sha is required to write back -- GitHub rejects an update without it,
  // which is what stops two edits from silently overwriting each other.
  return json({ ok: true, content, sha: file.sha, branch: env.CONTENT_BRANCH });
}

export async function putContent(request, env, editor) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }

  const { content, sha } = payload ?? {};
  if (!isStr(sha, 100)) {
    return json({ ok: false, error: "Missing file sha. Reload the editor and try again." }, 400);
  }

  const invalid = validateContent(content);
  if (invalid) return json({ ok: false, error: invalid }, 400);

  const serialised = `${JSON.stringify(content, null, 2)}\n`;
  if (new TextEncoder().encode(serialised).length > MAX_BYTES) {
    return json({ ok: false, error: "Content is too large." }, 413);
  }

  const response = await fetch(repoUrl(env), {
    method: "PUT",
    headers: { ...githubHeaders(env), "content-type": "application/json" },
    body: JSON.stringify({
      message: `content: update site content via admin\n\nEdited by ${editor}`,
      content: toBase64(serialised),
      sha,
      branch: env.CONTENT_BRANCH
    })
  });

  if (response.status === 409) {
    return json(
      { ok: false, error: "Someone else changed the content. Reload the editor and reapply your edit." },
      409
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("github write failed:", response.status, detail.slice(0, 300));
    return json({ ok: false, error: `Couldn't save to GitHub (${response.status}).` }, 502);
  }

  const result = await response.json();
  return json({
    ok: true,
    sha: result.content?.sha,
    commit: result.commit?.sha?.slice(0, 7),
    message: "Saved. The site rebuilds and goes live in about a minute."
  });
}

export { json as contentJson };
