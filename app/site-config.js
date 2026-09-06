// Single source of truth for the public site URL.
// Must exactly match the property registered in Google Search Console
// (protocol + www/non-www, no trailing slash).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maharjanraymond.com.np/").replace(/\/$/, "");