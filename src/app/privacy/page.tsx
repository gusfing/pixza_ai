"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Data Collection",
      content: "We collect information you provide directly to us when you create an account, use our creative engine, or communicate with us. This includes your name, email address, and any media assets you upload for synthesis."
    },
    {
      title: "Usage of Information",
      content: "Your data is used to provide, maintain, and improve Pixza Studio services. We process your media assets through our neural models to generate the requested output. We do not sell your personal data to third parties."
    },
    {
      title: "Security",
      content: "We implement a variety of security measures to maintain the safety of your personal information. Your media assets are processed on secure, high-performance GPU clusters and are encrypted at rest."
    },
    {
      title: "Cookies",
      content: "We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future."
    }
  ];

  return (
    <main className="min-h-screen bg-[#0d1117] selection:bg-white selection:text-black py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-20 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Studio</span>
        </Link>

        <div className="mb-20">
          <div className="w-16 h-16 glass-panel rounded-3xl flex items-center justify-center text-white mb-10">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-6 italic">Privacy Policy</h1>
          <p className="text-white/40 text-lg font-medium">Last updated: April 20, 2026</p>
        </div>

        <div className="space-y-16">
          {sections.map((section, i) => (
            <div key={i} className="glass-panel p-10 lg:p-16 rounded-[40px] border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">{section.title}</h2>
              <p className="text-white/50 leading-relaxed text-lg font-medium">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center p-16 glass-panel rounded-[40px] border-white/5">
          <p className="text-white/30 text-sm font-medium italic">
            Questions about your data? <Link href="/contact" className="text-white hover:underline underline-offset-4">Contact our security team.</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

