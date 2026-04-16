import type { Metadata } from "next";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { SessionProvider } from "@/components/SessionProvider";
import { WPAuthProvider } from "@/lib/wp-auth-context";

export const metadata: Metadata = {
  title: "Pixza Studio - AI Image Workflow",
  description: "Node-based image annotation and generation workflow using Pixza Studio",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
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
