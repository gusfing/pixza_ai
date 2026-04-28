import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { SessionProvider } from "@/components/SessionProvider";
import { WPAuthProvider } from "@/lib/wp-auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Pixza Studio | Create Without Limits",
  description: "Advanced AI image and video workflows for creators.",
  icons: {
    icon: [
      { url: "/pixza-logo.png", type: "image/png" },
      { url: "/favicon.png",    type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/pixza-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} antialiased selection:bg-white/10`}>
        {/* Global Grain Overlay for Premium Texture */}
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.02]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }} 
        />
        
        <WPAuthProvider>
          <SessionProvider>
            {children}
            <Toast />
          </SessionProvider>
        </WPAuthProvider>
      </body>
    </html>
  );
}
