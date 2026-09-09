// The editor must never appear in search results. A client component can't
// export metadata, so the noindex lives here.
export const metadata = {
  title: "Site content",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }) {
  return children;
}
