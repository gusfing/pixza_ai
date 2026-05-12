"use client";

import Link from "next/link";
import { useState } from "react";
import { Code2, Zap, Image, Video, Layers, Copy, Check, ArrowRight, Terminal, Key, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Code block with copy ─────────────────────────────────────
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl bg-[#0d1117] border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs text-white/70 overflow-x-auto leading-relaxed font-mono">{code}</pre>
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────
function SectionHeading({ label, title, desc }: { label: string; title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">{label}</p>
      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2">{title}</h2>
      {desc && <p className="text-sm text-white/40 max-w-xl">{desc}</p>}
    </div>
  );
}

// ── Endpoint card ────────────────────────────────────────────
function EndpointCard({
  method, path, desc, badge
}: { method: string; path: string; desc: string; badge?: string }) {
  const colors: Record<string, string> = {
    POST: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    GET:  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <div className="p-5 rounded-xl border border-white/7 bg-white/[0.02] hover:border-white/12 transition-all">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border", colors[method] ?? colors.GET)}>
          {method}
        </span>
        <code className="text-sm font-mono text-white/80">{path}</code>
        {badge && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-white/40">{desc}</p>
    </div>
  );
}

// ── Nav items ────────────────────────────────────────────────
const NAV = [
  { id: "overview",      label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "generate",      label: "Generate" },
  { id: "models",        label: "Models" },
  { id: "errors",        label: "Errors" },
  { id: "sdks",          label: "SDKs & Plugins" },
];

// ── Code examples ────────────────────────────────────────────
const CURL_EXAMPLE = `curl -X POST https://pixzaai.com/api/v1/generate \\
  -H "Authorization: Bearer pk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "image",
    "prompt": "A luxury product on marble surface, cinematic lighting",
    "model": "flux-pro",
    "width": 1024,
    "height": 1024
  }'`;

const JS_EXAMPLE = `const response = await fetch("https://pixzaai.com/api/v1/generate", {
  method: "POST",
  headers: {
    "Authorization": "Bearer pk_live_YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "image",
    prompt: "A luxury product on marble surface, cinematic lighting",
    model: "flux-pro",
    width: 1024,
    height: 1024,
  }),
});

const data = await response.json();
console.log(data.output_url); // https://cdn.pixzaai.com/gen/abc123.jpg`;

const PYTHON_EXAMPLE = `import requests

response = requests.post(
    "https://pixzaai.com/api/v1/generate",
    headers={
        "Authorization": "Bearer pk_live_YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "type": "image",
        "prompt": "A luxury product on marble surface, cinematic lighting",
        "model": "flux-pro",
        "width": 1024,
        "height": 1024,
    }
)

data = response.json()
print(data["output_url"])`;

const PHP_EXAMPLE = `<?php
$response = wp_remote_post("https://pixzaai.com/api/v1/generate", [
    "headers" => [
        "Authorization" => "Bearer pk_live_YOUR_API_KEY",
        "Content-Type"  => "application/json",
    ],
    "body" => json_encode([
        "type"   => "image",
        "prompt" => "A luxury product on marble surface, cinematic lighting",
        "model"  => "flux-pro",
        "width"  => 1024,
        "height" => 1024,
    ]),
]);

$data = json_decode(wp_remote_retrieve_body($response), true);
echo $data["output_url"];`;

const RESPONSE_EXAMPLE = `{
  "id": "gen_abc123xyz",
  "status": "completed",
  "type": "image",
  "model": "flux-pro",
  "prompt": "A luxury product on marble surface, cinematic lighting",
  "output_url": "https://cdn.pixzaai.com/gen/abc123.jpg",
  "width": 1024,
  "height": 1024,
  "credits_used": 4,
  "created_at": "2026-05-11T12:00:00Z"
}`;

const MODELS_LIST = [
  { id: "flux-schnell",    type: "image",  credits: 1,  desc: "Fastest image generation — 4 steps" },
  { id: "flux-dev",        type: "image",  credits: 2,  desc: "Balanced quality and speed" },
  { id: "flux-pro",        type: "image",  credits: 4,  desc: "Highest quality FLUX model" },
  { id: "flux-kontext",    type: "image",  credits: 4,  desc: "Image-to-image editing with FLUX" },
  { id: "seedream",        type: "image",  credits: 3,  desc: "ByteDance Seedream 4.5" },
  { id: "gemini-imagen-4", type: "image",  credits: 3,  desc: "Google Imagen 4 via Gemini" },
  { id: "veo-3-fast",      type: "video",  credits: 50, desc: "Google Veo 3 Fast — text to video" },
  { id: "wan-i2v",         type: "video",  credits: 20, desc: "Image to video animation" },
];

const ERRORS = [
  { code: "401", title: "Unauthorized",       desc: "Missing or invalid API key" },
  { code: "402", title: "Insufficient Credits", desc: "Your account has run out of credits" },
  { code: "422", title: "Validation Error",   desc: "Invalid request parameters" },
  { code: "429", title: "Rate Limited",       desc: "Too many requests — slow down" },
  { code: "500", title: "Server Error",       desc: "Something went wrong on our end" },
];

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "js" | "python" | "php">("curl");
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased">

      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/pixza-logo.png" alt="" className="w-6 h-6 rounded-lg object-contain" />
            <span className="text-sm font-bold text-white">Pixza Studio</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/40">Developers</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/signup" className="text-sm text-white/50 hover:text-white transition-colors">
            Get API Key
          </Link>
          <Link href="/create" className="text-sm font-black px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all">
            Try Studio →
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 flex gap-10 py-12">

        {/* Sidebar nav */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-4">On this page</p>
            <nav className="flex flex-col gap-1">
              {NAV.map(n => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={() => setActiveSection(n.id)}
                  className={cn(
                    "text-sm py-1.5 px-3 rounded-lg transition-all",
                    activeSection === n.id
                      ? "bg-violet-500/10 text-violet-400 font-bold"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-20">

          {/* Hero */}
          <section id="overview">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Code2 className="w-3 h-3" />
              API Reference v1
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
              Pixza API
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mb-8 leading-relaxed">
              Integrate AI image, video, and 3D generation into your website, app, WordPress site, or Shopify store. One API. All models.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: Image,  label: "Image Generation" },
                { icon: Video,  label: "Video Generation" },
                { icon: Layers, label: "3D Models" },
                { icon: Zap,    label: "< 3s avg response" },
                { icon: Globe,  label: "REST API" },
                { icon: Shield, label: "API Key Auth" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-white/60">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              ))}
            </div>

            {/* Base URL */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/7 flex items-center gap-3">
              <Terminal className="w-4 h-4 text-white/30 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-0.5">Base URL</p>
                <code className="text-sm font-mono text-white/80">https://pixzaai.com/api/v1</code>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication">
            <SectionHeading
              label="Authentication"
              title="API Keys"
              desc="All API requests require a Bearer token in the Authorization header."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Key,    title: "Get your key",   desc: "Sign up and generate an API key from your dashboard" },
                { icon: Shield, title: "Keep it secret", desc: "Never expose your API key in client-side code or public repos" },
                { icon: Zap,    title: "Rate limits",    desc: "Free: 10 req/min · Pro: 60 req/min · Agency: 300 req/min" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-5 rounded-xl border border-white/7 bg-white/[0.02]">
                  <Icon className="w-5 h-5 text-violet-400 mb-3" />
                  <p className="text-sm font-bold text-white mb-1">{title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <CodeBlock lang="http" code={`Authorization: Bearer pk_live_YOUR_API_KEY`} />

            <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs text-amber-400/80">
                <span className="font-black">Coming soon:</span> API keys are not yet available. Sign up to get notified when the API launches.{" "}
                <Link href="/auth/signup" className="underline hover:text-amber-300">Join waitlist →</Link>
              </p>
            </div>
          </section>

          {/* Generate endpoint */}
          <section id="generate">
            <SectionHeading
              label="Endpoints"
              title="Generate"
              desc="The core endpoint for all AI generation — images, videos, and 3D models."
            />

            <div className="space-y-3 mb-8">
              <EndpointCard method="POST" path="/api/v1/generate"      desc="Generate an image, video, or 3D model from a prompt" badge="Core" />
              <EndpointCard method="GET"  path="/api/v1/generate/{id}" desc="Get the status and result of a generation" />
              <EndpointCard method="GET"  path="/api/v1/generations"   desc="List your recent generations" />
              <EndpointCard method="GET"  path="/api/v1/models"        desc="List all available models" />
              <EndpointCard method="GET"  path="/api/v1/credits"       desc="Get your current credit balance" />
            </div>

            {/* Request body */}
            <h3 className="text-base font-black text-white mb-4">Request Body</h3>
            <div className="overflow-x-auto rounded-xl border border-white/7 mb-8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/7 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Parameter</th>
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Type</th>
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Required</th>
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { param: "type",        type: "string",  req: "Yes", desc: 'Generation type: "image" | "video" | "3d"' },
                    { param: "prompt",      type: "string",  req: "Yes", desc: "Text description of what to generate" },
                    { param: "model",       type: "string",  req: "No",  desc: 'Model ID (default: "flux-schnell")' },
                    { param: "input_image", type: "string",  req: "No",  desc: "URL of input image for img2img or video" },
                    { param: "width",       type: "integer", req: "No",  desc: "Output width in pixels (default: 1024)" },
                    { param: "height",      type: "integer", req: "No",  desc: "Output height in pixels (default: 1024)" },
                    { param: "steps",       type: "integer", req: "No",  desc: "Inference steps (default: model-specific)" },
                    { param: "seed",        type: "integer", req: "No",  desc: "Random seed for reproducibility" },
                    { param: "webhook_url", type: "string",  req: "No",  desc: "URL to POST result to when complete" },
                  ].map(row => (
                    <tr key={row.param} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3"><code className="text-violet-400 font-mono">{row.param}</code></td>
                      <td className="px-4 py-3 text-white/40 font-mono">{row.type}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                          row.req === "Yes" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/30"
                        )}>{row.req}</span>
                      </td>
                      <td className="px-4 py-3 text-white/50">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Code examples */}
            <h3 className="text-base font-black text-white mb-4">Code Examples</h3>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(["curl", "js", "python", "php"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    activeTab === tab ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-white/5 text-white/40 hover:text-white border border-transparent"
                  )}
                >
                  {tab === "js" ? "JavaScript" : tab === "php" ? "PHP / WordPress" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "curl"   && <CodeBlock lang="bash"       code={CURL_EXAMPLE} />}
            {activeTab === "js"     && <CodeBlock lang="javascript" code={JS_EXAMPLE} />}
            {activeTab === "python" && <CodeBlock lang="python"     code={PYTHON_EXAMPLE} />}
            {activeTab === "php"    && <CodeBlock lang="php"        code={PHP_EXAMPLE} />}

            {/* Response */}
            <h3 className="text-base font-black text-white mt-8 mb-4">Response</h3>
            <CodeBlock lang="json" code={RESPONSE_EXAMPLE} />
          </section>

          {/* Models */}
          <section id="models">
            <SectionHeading
              label="Models"
              title="Available Models"
              desc="All models are billed in credits. 1 credit ≈ ₹0.10."
            />

            <div className="overflow-x-auto rounded-xl border border-white/7">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/7 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Model ID</th>
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Type</th>
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Credits</th>
                    <th className="text-left px-4 py-3 text-white/40 font-black uppercase tracking-widest text-[10px]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MODELS_LIST.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3"><code className="text-cyan-400 font-mono">{m.id}</code></td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                          m.type === "image" ? "bg-violet-500/10 text-violet-400" : "bg-orange-500/10 text-orange-400"
                        )}>{m.type}</span>
                      </td>
                      <td className="px-4 py-3 text-white/60 font-mono">{m.credits}</td>
                      <td className="px-4 py-3 text-white/40">{m.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Errors */}
          <section id="errors">
            <SectionHeading
              label="Errors"
              title="Error Codes"
              desc="All errors return a JSON body with a message field."
            />

            <div className="space-y-3 mb-8">
              {ERRORS.map(e => (
                <div key={e.code} className="flex items-center gap-4 p-4 rounded-xl border border-white/7 bg-white/[0.02]">
                  <span className={cn(
                    "text-sm font-black font-mono w-12 shrink-0",
                    e.code === "401" || e.code === "402" ? "text-red-400" :
                    e.code === "429" ? "text-amber-400" :
                    e.code === "500" ? "text-red-400" : "text-white/60"
                  )}>{e.code}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{e.title}</p>
                    <p className="text-xs text-white/40">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <CodeBlock lang="json" code={`{
  "error": "insufficient_credits",
  "message": "Your account has 0 credits remaining. Upgrade your plan to continue.",
  "credits_remaining": 0
}`} />
          </section>

          {/* SDKs & Plugins */}
          <section id="sdks">
            <SectionHeading
              label="Integrations"
              title="SDKs & Plugins"
              desc="Official integrations for popular platforms. More coming soon."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "JavaScript / Node.js",
                  status: "coming-soon",
                  desc: "Official npm package for Node.js and browser environments.",
                  code: "npm install @pixzaai/sdk",
                  lang: "bash",
                },
                {
                  title: "WordPress Plugin",
                  status: "coming-soon",
                  desc: "Add AI generation to any WordPress site. Gutenberg block + shortcode support.",
                  code: "Search: Pixza AI in WP Plugin Directory",
                  lang: "bash",
                },
                {
                  title: "Shopify App",
                  status: "coming-soon",
                  desc: "Generate product images and backgrounds directly from your Shopify admin.",
                  code: "Search: Pixza AI in Shopify App Store",
                  lang: "bash",
                },
                {
                  title: "Python",
                  status: "coming-soon",
                  desc: "Python SDK for data science, automation, and backend integrations.",
                  code: "pip install pixzaai",
                  lang: "bash",
                },
                {
                  title: "REST API",
                  status: "available",
                  desc: "Use the raw REST API from any language or platform.",
                  code: "https://pixzaai.com/api/v1",
                  lang: "http",
                },
                {
                  title: "Webhooks",
                  status: "coming-soon",
                  desc: "Get notified when async generations complete via HTTP POST.",
                  code: 'POST { "id": "gen_xxx", "status": "completed" }',
                  lang: "json",
                },
              ].map(item => (
                <div key={item.title} className="p-5 rounded-xl border border-white/7 bg-white/[0.02] flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0",
                      item.status === "available"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-white/5 text-white/30 border-white/10"
                    )}>
                      {item.status === "available" ? "Available" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed flex-1">{item.desc}</p>
                  <code className="text-[10px] font-mono text-white/30 bg-white/[0.03] px-2 py-1.5 rounded-lg block truncate">
                    {item.code}
                  </code>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/5 border border-violet-500/20 text-center">
            <h2 className="text-2xl font-black text-white tracking-tighter mb-3">Ready to build?</h2>
            <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
              Sign up for a free account to get your API key and 100 free credits to start building.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all"
              >
                Get API Key <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                Try Studio first
              </Link>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
