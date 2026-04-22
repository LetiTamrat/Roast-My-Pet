import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Roast My Pet — Free AI Pet Roast Generator",
    template: "%s · Roast My Pet",
  },
  description:
    "Upload a photo of your pet, get a hilarious AI-generated roast and a shareable meme. Free, no signup. Every pet is cute. Some just deserve a little roasting.",
  openGraph: {
    title: "Roast My Pet",
    description:
      "Upload a photo, get a ridiculous roast and a meme worth sharing. Free.",
    type: "website",
    url: siteUrl,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Roast My Pet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roast My Pet",
    description: "AI-generated roasts of your pet, ready to share.",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFBF5" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E13" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${caveat.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        <Providers>{children}</Providers>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Roast My Pet",
              url: siteUrl,
              applicationCategory: "EntertainmentApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </body>
    </html>
  );
}
