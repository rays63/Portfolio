import "./globals.css";
import { SITE_URL } from "./site-config";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant"
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "QA Engineer Portfolio",
  description: "Interactive portfolio website for a QA Engineer",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "QA Engineer Portfolio",
    description: "Interactive portfolio website for a QA Engineer",
    url: "/",
    siteName: "QA Engineer Portfolio",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${cormorantGaramond.variable}`}>{children}</body>
    </html>
  );
}
