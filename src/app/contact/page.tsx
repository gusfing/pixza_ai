"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Mail, MapPin, MessageSquare, Share2, MessageCircle, GitBranch } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white selection:text-black py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/landing" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-20 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Studio</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
          {/* Left Column: Content */}
          <div className="animate-obsidian">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 italic">
              Connect.
            </h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md mb-12">
              Whether you're looking for enterprise solutions, technical support, or just want to say hello—we're active and ready to build.
            </p>

            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-white shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Email Us</h4>
                  <p className="text-white/30 text-sm font-medium">hello@pixza.studio</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Headquarters</h4>
                  <p className="text-white/30 text-sm font-medium">London, United Kingdom</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-white shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Community</h4>
                  <div className="flex gap-4 mt-2">
                    <Share2 className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
                    <MessageCircle className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
                    <GitBranch className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="relative">
            {submitted ? (
              <div className="glass-panel p-16 rounded-[40px] text-center animate-obsidian">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
                  <Send className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">Transmission Received</h2>
                <p className="text-white/40 font-medium">Our neural agents will process your request and respond shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-10 btn-minimal btn-minimal-secondary px-8 py-3"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-panel p-12 lg:p-16 rounded-[40px] space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Alex Rivera"
                      className="w-full minimal-input py-4 px-6 text-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="alex@example.com"
                      className="w-full minimal-input py-4 px-6 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">Subject</label>
                  <select className="w-full minimal-input py-4 px-6 text-sm appearance-none cursor-pointer">
                    <option>General Inquiry</option>
                    <option>Enterprise Solutions</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="How can we help you evolve?"
                    className="w-full minimal-input py-4 px-6 text-sm resize-none"
                  ></textarea>
                </div>

                <button type="submit" className="w-full btn-minimal btn-minimal-primary py-5 text-lg group">
                  Send Transmission
                  <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            )}

            {/* Decorative detail */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </main>
  );
}
