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
  title: "Raymond Maharjan — QA Engineer",
  description:
    "Raymond Maharjan, Software Quality Assurance Engineer. Test automation with Playwright, Cypress, Appium and WebdriverIO across web and mobile, plus API, performance and manual QA.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Raymond Maharjan — QA Engineer",
    description:
      "Software Quality Assurance Engineer specialising in test automation across web and mobile.",
    url: "/",
    siteName: "Raymond Maharjan",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

// Tells Google this site is the entity "Raymond Maharjan" — every field here is
// already stated on the page itself.
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Raymond Maharjan",
  jobTitle: "Software Quality Assurance Engineer",
  url: SITE_URL,
  image: "https://github.com/rays63.png",
  email: "mailto:raymondmhz63@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kathmandu",
    addressCountry: "NP"
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "IIMS College",
    address: "Kathmandu, Nepal"
  },
  sameAs: ["https://github.com/rays63", "https://www.linkedin.com/in/raymz/"],
  knowsAbout: [
    "Software Quality Assurance",
    "Test Automation",
    "Playwright",
    "Cypress",
    "Appium",
    "WebdriverIO",
    "REST API Testing",
    "Performance Testing",
    "Manual Testing",
    "CI/CD"
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${cormorantGaramond.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
