import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { SessionProvider } from "@/components/SessionProvider";
import { WPAuthProvider } from "@/lib/wp-auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pixza Studio | Create Without Limits",
  description: "Advanced AI image and video workflows for creators.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased selection:bg-white/10`}>
        {/* Global Grain Overlay for Premium Texture */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
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
