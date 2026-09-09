import { SITE_URL, CONTENT_LAST_MODIFIED } from "./site-config";

export const dynamic = "force-static";

export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1
    }
  ];
}
