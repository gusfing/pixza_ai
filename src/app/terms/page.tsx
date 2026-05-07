"use client";

import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using Pixza Studio, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our platform."
    },
    {
      title: "Use License",
      content: "Permission is granted to use Pixza Studio for your creative projects. For Pro and Enterprise users, this includes a full commercial license for all generated outputs. Starter plan users are limited to non-commercial use."
    },
    {
      title: "Content Rights",
      content: "You retain all rights to the media assets you upload. You grant Pixza Studio a worldwide, non-exclusive, royalty-free license to use, reproduce, and process your content solely for the purpose of providing and improving the service."
    },
    {
      title: "Prohibited Use",
      content: "You may not use Pixza Studio to generate illegal, harmful, or deceptive content. We reserve the right to terminate access for users who violate these guidelines or attempt to exploit our neural infrastructure."
    },
    {
      title: "Disclaimer",
      content: "The materials on Pixza Studio are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties of merchantability or fitness for a particular purpose."
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
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-6 italic">Terms of Service</h1>
          <p className="text-white/40 text-lg font-medium">Last updated: April 20, 2026</p>
        </div>

        <div className="space-y-12">
          {sections.map((section, i) => (
            <div key={i} className="glass-panel p-10 lg:p-16 rounded-[40px] border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">{section.title}</h2>
              <p className="text-white/50 leading-relaxed text-lg font-medium">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center p-16 glass-panel rounded-[40px] border-white/5 bg-white/[0.02]">
          <p className="text-white/30 text-sm font-medium italic">
            Questions regarding our terms? <Link href="/contact" className="text-white hover:underline underline-offset-4">Connect with our legal team.</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

