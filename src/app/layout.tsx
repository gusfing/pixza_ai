import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { SessionProvider } from "@/components/SessionProvider";
import { WPAuthProvider } from "@/lib/wp-auth-context";
import { PromoPopup } from "@/components/ui/promo-popup";
import { LowCreditsPopup } from "@/components/ui/low-credits-popup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://pixzaai.com").replace(/\/$/, "");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0d1117",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pixza Studio — AI Image, Video & 3D Generation",
    template: "%s | Pixza Studio",
  },
  description: "The AI creative studio for image, video, audio and 3D generation. Free tier with FLUX, Gemini Flash, and Cloudflare AI. Pro plans from ₹999/month.",
  keywords: ["AI image generation", "AI video generation", "FLUX AI", "Imagen 4", "Veo 3", "AI studio", "background remover", "magic eraser", "AI tools India"],
  authors: [{ name: "Pixza Studio", url: BASE_URL }],
  creator: "Pixza Studio",
  publisher: "Pixza Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Pixza Studio",
    title: "Pixza Studio — AI Image, Video & 3D Generation",
    description: "The AI creative studio for image, video, audio and 3D generation. Free tier included. Starting at ₹0/month.",
    images: [
      {
        url: `${BASE_URL}/pixza-logo.png`,
        width: 1200,
        height: 630,
        alt: "Pixza Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixza Studio — AI Image, Video & 3D Generation",
    description: "The AI creative studio for image, video, audio and 3D generation. Free tier included.",
    images: [`${BASE_URL}/pixza-logo.png`],
    creator: "@pixzastudio",
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: [
      { url: "/pixza-logo.png", type: "image/png" },
      { url: "/favicon.png",    type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/pixza-logo.png",
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Pixza Studio",
              "url": "https://pixzaai.com",
              "logo": "https://pixzaai.com/pixza-logo.png",
              "description": "AI creative studio for image, video, audio and 3D generation",
              "sameAs": ["https://twitter.com/pixzastudio"]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased selection:bg-white/10`}>
        {/* Global Grain Overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <WPAuthProvider>
          <SessionProvider>
            {children}
            <Toast />
            <PromoPopup />
            <LowCreditsPopup />
          </SessionProvider>
        </WPAuthProvider>
      </body>
    </html>
  );
}
