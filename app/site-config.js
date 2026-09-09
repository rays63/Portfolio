// Single source of truth for the public site URL.
// Must exactly match the property registered in Google Search Console
// (protocol + www/non-www, no trailing slash).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maharjanraymond.com.np/").replace(/\/$/, "");

// Bump this ONLY when page content actually changes — it becomes <lastmod> in
// sitemap.xml. Using the build date instead would claim a change on every
// deploy and teach Google to distrust the signal.
export const CONTENT_LAST_MODIFIED = "2026-09-07";
