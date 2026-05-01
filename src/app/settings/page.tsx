"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, CreditCard, History, LogOut, Check, Zap, Crown,
  Shield, Trash2, Copy, ExternalLink, ChevronRight, ArrowLeft,
  Camera, Mail, Calendar, Hash, Activity, TrendingUp
} from "lucide-react";
import { useWPAuth } from "@/lib/wp-auth-context";
import { cn } from "@/lib/utils";

type Tab = "profile" | "billing" | "usage" | "security";

/* ── helpers ─────────────────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function planColor(plan: string) {
  if (plan === "agency") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  if (plan === "pro")    return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  return "text-white/40 bg-white/5 border-white/10";
}

/* ── Avatar ──────────────────────────────────────────────── */
function Avatar({ name, size = 16 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-black shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials || "?"}
    </div>
  );
}

/* ── Profile Tab ─────────────────────────────────────────── */
function ProfileTab() {
  const { user, token, refreshUser } = useWPAuth();
  const [name, setName]       = useState(user?.name ?? "");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [copied, setCopied]   = useState(false);

  const plan = user?.meta?.plan ?? "free";
  const credits = user?.meta?.credits ?? 0;
  const creditsLimit = user?.meta?.credits_limit ?? 50;
  const generations = user?.meta?.generations_count ?? 0;
  const joinDate = (user as any)?.registered ?? "";

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const { wpUpdateUserMeta } = await import("@/lib/wordpress");
      await wpUpdateUserMeta(token, { name } as any);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert("Failed to save. Try again."); }
    finally { setSaving(false); }
  };

  const copyId = () => {
    navigator.clipboard.writeText(String(user?.id ?? ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/8">
        <div className="flex items-start gap-5 mb-6">
          <div className="relative">
            <Avatar name={user?.name || user?.username || "U"} size={72} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0d1117] border border-white/10 flex items-center justify-center">
              <Camera className="w-3 h-3 text-white/40" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight">{user?.name || user?.username}</h2>
              <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", planColor(plan))}>
                {plan}
              </span>
            </div>
            <p className="text-sm text-white/40 mt-0.5">@{user?.username}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-white/20 font-mono">ID: {user?.id}</span>
              <button onClick={copyId} className="text-white/20 hover:text-white/60 transition-colors">
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Credits Left", value: credits.toLocaleString(), icon: Zap, color: "text-violet-400" },
            { label: "Generations", value: generations.toLocaleString(), icon: Activity, color: "text-cyan-400" },
            { label: "Member Since", value: joinDate ? fmtDate(joinDate) : "—", icon: Calendar, color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <s.icon className={cn("w-4 h-4 mx-auto mb-1.5", s.color)} />
              <div className="text-sm font-black text-white">{s.value}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Edit fields */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/20 transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1.5">Email Address</label>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <Mail className="w-4 h-4 text-white/20 shrink-0" />
              <span className="text-sm text-white/50">{user?.email}</span>
              <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-full">Verified</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1.5">Username</label>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <Hash className="w-4 h-4 text-white/20 shrink-0" />
              <span className="text-sm text-white/50">{user?.username}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all",
              saved ? "bg-green-500 text-white" : "bg-white text-black hover:bg-white/90"
            )}
          >
            {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Billing Tab ─────────────────────────────────────────── */
function BillingTab() {
  const { user, token } = useWPAuth();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  const plan = user?.meta?.plan ?? "free";
  const credits = user?.meta?.credits ?? 0;
  const creditsLimit = user?.meta?.credits_limit ?? 100;
  const creditsPct = creditsLimit > 0 ? Math.min(100, Math.round((credits / creditsLimit) * 100)) : 0;

  const loadInvoices = async () => {
    setInvoicesLoading(true); setShowInvoices(true);
    try {
      const res = await fetch("/api/razorpay/invoices");
      if (res.ok) { const d = await res.json(); setInvoices(d.payments ?? []); }
    } catch { /* silent */ }
    finally { setInvoicesLoading(false); }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel subscription? You'll keep access until the end of the billing period.")) return;
    setCancelling(true);
    try {
      const subId = (user as any)?.meta?.razorpay_subscription_id;
      const res = await fetch("/api/razorpay/cancel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: subId }),
      });
      const d = await res.json();
      setMsg(res.ok ? { type: "ok", text: d.message } : { type: "err", text: d.error });
    } catch { setMsg({ type: "err", text: "Failed to cancel. Contact support." }); }
    finally { setCancelling(false); }
  };

  const handleUpgrade = async (targetPlan: "pro" | "agency") => {
    if (!token) { window.location.href = "/auth/signin"; return; }
    setUpgrading(targetPlan);
    try {
      const { openRazorpayCheckout } = await import("@/lib/razorpay");
      await openRazorpayCheckout({
        plan: targetPlan,
        onSuccess: (data) => {
          setMsg({ type: "ok", text: `🎉 Upgraded to ${data.plan}! ${data.credits} credits added.` });
          setUpgrading(null);
        },
        onError: (err) => { setMsg({ type: "err", text: err }); setUpgrading(null); },
        onDismiss: () => setUpgrading(null),
      });
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Checkout failed" });
      setUpgrading(null);
    }
  };

  return (
    <div className="space-y-5">
      {msg && (
        <div className={cn("p-3 rounded-xl text-xs font-bold flex items-center justify-between",
          msg.type === "ok" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
          {msg.text}
          <button onClick={() => setMsg(null)} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Current plan */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-black text-white capitalize">{plan}</span>
              <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", planColor(plan))}>
                {plan === "free" ? "Free" : "Active"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 mb-1">Credits remaining</p>
            <p className="text-2xl font-black text-white tabular-nums">{credits.toLocaleString()}<span className="text-sm text-white/30">/{creditsLimit.toLocaleString()}</span></p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700",
              creditsPct > 50 ? "bg-violet-500" : creditsPct > 20 ? "bg-amber-400" : "bg-red-400")}
            style={{ width: `${creditsPct}%` }}
          />
        </div>
        <p className="text-[10px] text-white/20 mt-2">{creditsPct}% remaining this period</p>
        {creditsPct < 20 && (
          <p className="text-[10px] text-amber-400 font-bold mt-1">⚠ Running low — consider upgrading</p>
        )}
      </div>

      {/* Cancel subscription */}
      {plan !== "free" && (
        <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Manage Subscription</p>
            <p className="text-xs text-white/30 mt-0.5">Cancel anytime — access continues until period end</p>
          </div>
          <button onClick={handleCancel} disabled={cancelling}
            className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all disabled:opacity-50">
            {cancelling ? "Cancelling…" : "Cancel Plan"}
          </button>
        </div>
      )}

      {/* Invoice history */}
      <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Payment History</p>
          <button onClick={loadInvoices} disabled={invoicesLoading}
            className="text-xs text-white/30 hover:text-white transition-colors">
            {invoicesLoading ? "Loading…" : showInvoices ? "Refresh" : "Load history"}
          </button>
        </div>
        {showInvoices && (
          invoices.length === 0 ? (
            <p className="text-xs text-white/20 py-2">No payments found</p>
          ) : (
            <div className="space-y-1">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-white">₹{inv.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30">{new Date(inv.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                    inv.status === "captured" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/30")}>
                    {inv.status === "captured" ? "Paid" : inv.status}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Upgrade cards */}
      {plan === "free" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: "pro" as const, name: "Pro", price: "₹999", credits: "3,000", color: "violet", features: ["3,000 credits/month", "FLUX + Imagen 3 & 4", "Seedance video", "No watermarks", "Commercial license"] },
            { id: "agency" as const, name: "Agency", price: "₹2,999", credits: "8,000", color: "amber", features: ["8,000 credits/month", "Everything in Pro", "Veo 2 & 3 video", "Team seats (soon)", "Priority support"] },
          ].map(p => (
            <div key={p.id} className={cn("p-5 rounded-2xl border", p.color === "violet" ? "border-violet-500/20 bg-violet-500/5" : "border-amber-500/20 bg-amber-500/5")}>
              <div className="flex items-center justify-between mb-3">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", p.color === "violet" ? "text-violet-400" : "text-amber-400")}>{p.name}</span>
                <span className="text-lg font-black text-white">{p.price}<span className="text-xs text-white/30">/mo</span></span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                    <Check className={cn("w-3 h-3 shrink-0", p.color === "violet" ? "text-violet-400" : "text-amber-400")} /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={upgrading === p.id}
                className={cn("w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60",
                  p.color === "violet" ? "bg-violet-500 text-white hover:bg-violet-400" : "bg-amber-500 text-white hover:bg-amber-400")}
              >
                {upgrading === p.id ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</> : `Upgrade to ${p.name}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Credit cost reference */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Credit Costs</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Image (free model)", cost: 1 },
            { label: "Image (pro model)", cost: 3 },
            { label: "Video", cost: 10 },
            { label: "Audio", cost: 3 },
            { label: "3D", cost: 5 },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <span className="text-xs text-white/40">{item.label}</span>
              <span className="text-xs font-black text-white">{item.cost} cr</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Usage History Tab ───────────────────────────────────── */
function UsageTab() {
  const { token } = useWPAuth();
  const [usage, setUsage]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter]     = useState<string>("all");

  const fetchUsage = useCallback(async (p: number) => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/wp-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `/pixza/v1/usage?page=${p}&per_page=20`,
          method: "GET",
          token,
        }),
      });
      const data = await res.json();
      setUsage(data.items ?? []);
      setTotalPages(data.pages ?? 1);
    } catch { setUsage([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchUsage(page); }, [page, fetchUsage]);

  const filtered = filter === "all" ? usage : usage.filter(r => r.action === filter);
  const actions = [...new Set(usage.map(r => r.action))];

  const actionColor = (action: string) => {
    if (action === "image") return "text-cyan-400 bg-cyan-500/10";
    if (action === "video") return "text-purple-400 bg-purple-500/10";
    if (action === "audio") return "text-amber-400 bg-amber-500/10";
    if (action === "3d")    return "text-orange-400 bg-orange-500/10";
    return "text-white/40 bg-white/5";
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", ...actions].map(a => (
          <button key={a} onClick={() => setFilter(a)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
              filter === a ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white")}>
            {a}
          </button>
        ))}
        <button onClick={() => fetchUsage(page)} className="ml-auto text-white/20 hover:text-white/60 transition-colors">
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No usage history yet</p>
          <p className="text-white/15 text-xs mt-1">Generate something to see it here</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-4 gap-3 px-4 pb-2 border-b border-white/5">
            {["Action", "Model", "Credits", "Date"].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-white/20">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-1">
            {filtered.map((row: any) => (
              <div key={row.id} className="grid grid-cols-4 gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md", actionColor(row.action))}>
                    {row.action}
                  </span>
                </div>
                <span className="text-xs text-white/40 truncate self-center">{row.model || "—"}</span>
                <span className="text-xs font-black text-white self-center">−{row.credits}</span>
                <span className="text-xs text-white/20 self-center">{fmtTime(row.created_at)}</span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-white/40 hover:text-white disabled:opacity-30 transition-all">
                ← Prev
              </button>
              <span className="text-xs text-white/30">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-white/40 hover:text-white disabled:opacity-30 transition-all">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Security Tab ────────────────────────────────────────── */
function SecurityTab() {
  const { user, token, logout } = useWPAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleLogoutAll = () => {
    logout();
    router.push("/auth/signin");
  };

  return (
    <div className="space-y-4">
      {/* Session info */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/8">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Active Session</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Current browser session</p>
            <p className="text-xs text-white/30 mt-0.5">Logged in as {user?.email}</p>
          </div>
          <button onClick={handleLogoutAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 text-xs font-bold hover:text-white hover:border-white/20 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/8">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Password</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Change your password</p>
            <p className="text-xs text-white/30 mt-0.5">Managed via your WordPress account</p>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_WP_URL}/wp-login.php?action=lostpassword`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 text-xs font-bold hover:text-white hover:border-white/20 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Reset Password
          </a>
        </div>
      </div>

      {/* Account info */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/8">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Account Details</p>
        <div className="space-y-2">
          {[
            { label: "User ID",   value: String(user?.id ?? "—") },
            { label: "Username",  value: user?.username ?? "—" },
            { label: "Email",     value: user?.email ?? "—" },
            { label: "Plan",      value: (user?.meta?.plan ?? "free").toUpperCase() },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-xs text-white/30">{item.label}</span>
              <span className="text-xs font-bold text-white/70 font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-400/60 mb-3">Danger Zone</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Delete Account</p>
            <p className="text-xs text-white/30 mt-0.5">Permanently remove all your data. This cannot be undone.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you absolutely sure? This will permanently delete your account and all data.")) {
                setDeleting(true);
                // Contact support for deletion
                window.open("mailto:support@pixza.ai?subject=Account Deletion Request&body=Please delete my account. User ID: " + user?.id, "_blank");
                setDeleting(false);
              }
            }}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile",  label: "Profile",       icon: User       },
  { id: "billing",  label: "Billing",        icon: CreditCard },
  { id: "usage",    label: "Usage History",  icon: History    },
  { id: "security", label: "Security",       icon: Shield     },
];

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useWPAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin?next=/settings");
  }, [authLoading, user, router]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const plan = user?.meta?.plan ?? "free";

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased">
      {/* Header */}
      <nav className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Link href="/create" className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <Avatar name={user.name || user.username || "U"} size={28} />
            <div>
              <p className="text-sm font-bold text-white leading-none">{user.name || user.username}</p>
              <p className="text-[10px] text-white/30 leading-none mt-0.5">{user.email}</p>
            </div>
          </div>
          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ml-1", planColor(plan))}>
            {plan}
          </span>
        </div>
        <button onClick={() => { logout(); router.push("/auth/signin"); }}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold whitespace-nowrap text-sm",
                  tab === t.id ? "bg-white text-black" : "text-white/30 hover:text-white hover:bg-white/5"
                )}>
                <t.icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              {tab === "profile"  && <ProfileTab />}
              {tab === "billing"  && <BillingTab />}
              {tab === "usage"    && <UsageTab />}
              {tab === "security" && <SecurityTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
