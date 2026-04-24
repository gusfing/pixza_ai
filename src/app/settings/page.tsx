"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  CreditCard, 
  Bell, 
  Palette, 
  LogOut, 
  ChevronRight, 
  Shield, 
  Trash2,
  Check,
  Zap,
  Globe,
  Settings as SettingsIcon,
  Crown
} from "lucide-react";
import { useWPAuth } from "@/lib/wp-auth-context";
import { wpCancelSubscription, wpUpdateUserMeta } from "@/lib/wordpress";
import { cn } from "@/lib/utils";

type Tab = "profile" | "subscription" | "notifications" | "appearance";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "subscription", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "appearance", label: "Preferences", icon: Palette },
];

/* ── UI Components ────────────────────────────────────────── */

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-8 rounded-[32px] glass-panel border border-white/5", className)}>
      {children}
    </div>
  );
}

function SettingInput({ label, value, onChange, disabled, type = "text" }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean; type?: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none transition-all focus:border-white/20 focus:bg-white/10",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      />
    </div>
  );
}

/* ── Tab Components ────────────────────────────────────────── */

function ProfileTab() {
  const { user, token } = useWPAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await wpUpdateUserMeta(token, { name } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SettingSection title="Personal Identity">
        <SettingCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SettingInput label="Display Name" value={name} onChange={setName} />
            <SettingInput label="Email Address" value={user?.email ?? ""} disabled />
          </div>
          <div className="mt-10 flex items-center justify-between">
            <p className="text-xs text-white/30 font-medium">Your display name is visible to other studio members.</p>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className={cn(
                "btn-minimal px-8 py-3 rounded-2xl text-xs flex items-center gap-2",
                saved ? "bg-green-500 text-white" : "btn-minimal-primary"
              )}
            >
              {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
              {saving ? "Syncing..." : saved ? "Updated" : "Update Profile"}
            </button>
          </div>
        </SettingCard>
      </SettingSection>

      <SettingSection title="Security & Access">
        <SettingCard className="border-red-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">Deactivate Account</h4>
                <p className="text-xs text-white/30">Permanently remove your studio data and generations.</p>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              Initiate Deletion
            </button>
          </div>
        </SettingCard>
      </SettingSection>
    </div>
  );
}

function SubscriptionTab() {
  const { user, token } = useWPAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<{ next_payment?: string } | null>(null);

  const currentPlan = user?.meta?.plan?.toLowerCase() ?? "free";
  const isPro = currentPlan !== "free";
  const credits = user?.meta?.credits ?? (currentPlan === "pro" ? 2000 : currentPlan === "agency" ? 10000 : 50);
  const creditsLimit = user?.meta?.credits_limit ?? (currentPlan === "pro" ? 2000 : currentPlan === "agency" ? 10000 : 50);
  const generationsCount = user?.meta?.generations_count ?? 0;
  const creditsUsed = creditsLimit - credits;
  const creditsPct = Math.min(100, Math.round((creditsUsed / creditsLimit) * 100));

  useEffect(() => {
    if (!token) return;
    import("@/lib/wordpress").then(({ wpGetSubscription }) =>
      wpGetSubscription(token).then(s => setSubscription(s)).catch(() => {})
    );
  }, [token]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SettingSection title="Active Pipeline">
        <SettingCard className={cn(isPro && "bg-gradient-to-br from-white/5 to-transparent border-white/10")}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl",
                isPro ? "bg-white text-black" : "bg-white/5 text-white/20"
              )}>
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tighter text-white capitalize">{currentPlan} Tier</h4>
                <p className="text-xs text-white/40 font-medium">
                  {subscription?.next_payment
                    ? `Next billing: ${new Date(subscription.next_payment).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : isPro ? "Subscription active" : "Free plan"}
                </p>
              </div>
            </div>
            {isPro && (
              <span className="px-4 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/10">
                Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Credits Used</span>
              <span className="text-xl font-black text-white">{creditsUsed.toLocaleString()}<span className="text-white/30 text-sm font-medium">/{creditsLimit.toLocaleString()}</span></span>
              <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-white/40 transition-all" style={{ width: `${creditsPct}%` }} />
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Credits Left</span>
              <span className="text-xl font-black text-white">{credits.toLocaleString()}</span>
              <p className="text-[10px] text-white/40 mt-1">Remaining this period</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">All Time</span>
              <span className="text-xl font-black text-white">{generationsCount.toLocaleString()}</span>
              <p className="text-[10px] text-white/40 mt-1">Total generations</p>
            </div>
          </div>
        </SettingCard>
      </SettingSection>

      <SettingSection title="Tier Management">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingCard className="flex flex-col h-full">
            <h4 className="font-black text-white text-lg mb-2">Upgrade Engine</h4>
            <p className="text-xs text-white/30 mb-8 leading-relaxed">Unlock priority queuing, unlimited 4K exports, and hyper-speed generation.</p>
            <button
              onClick={async () => {
                if (!token) { window.location.href = "/auth/signin"; return; }
                try {
                  const { wpCreateCheckout } = await import("@/lib/wordpress");
                  const { checkout_url } = await wpCreateCheckout(token, "pro");
                  window.location.href = checkout_url;
                } catch {
                  alert("Failed to start checkout. Please try again.");
                }
              }}
              className="mt-auto btn-minimal btn-minimal-primary w-full py-4 text-[11px] font-black uppercase tracking-widest"
            >
              Upgrade to Pro — $29/mo
            </button>
          </SettingCard>
          <SettingCard className="flex flex-col h-full bg-transparent border-white/5">
            <h4 className="font-black text-white/40 text-lg mb-2">Billing History</h4>
            <p className="text-xs text-white/20 mb-8 leading-relaxed">Download invoices and manage payment methods.</p>
            <button
              onClick={async () => {
                if (!token) return;
                try {
                  const { wpCreateCheckout } = await import("@/lib/wordpress");
                  const { checkout_url } = await wpCreateCheckout(token, "pro");
                  window.location.href = checkout_url;
                } catch {
                  window.open("https://woocommerce.com", "_blank");
                }
              }}
              className="mt-auto px-6 py-4 rounded-3xl border border-white/10 text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all"
            >
              Manage Portal
            </button>
          </SettingCard>
        </div>
      </SettingSection>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useWPAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [authLoading, user, router]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased selection:bg-white selection:text-black">
      {/* Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[300] opacity-[0.02]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Navigation */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-[100]">
        <Link href="/create" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <img src="/pixza-logo.png" alt="" className="w-4 h-4 invert" />
          </div>
          <span className="text-lg font-black tracking-tighter">Pixza Studio</span>
        </Link>
        <button 
          onClick={logout}
          className="text-xs font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-20 lg:py-32 flex flex-col lg:flex-row gap-20">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0 space-y-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">Settings.</h1>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Studio Configuration & <br/> Pipeline Management.
            </p>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold whitespace-nowrap",
                  tab === t.id 
                    ? "bg-white text-[#0A0A0A] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)]" 
                    : "text-white/30 hover:text-white hover:bg-white/5"
                )}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "profile" && <ProfileTab />}
              {tab === "subscription" && <SubscriptionTab />}
              {(tab === "notifications" || tab === "appearance") && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 glass-panel rounded-[40px] flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <SettingsIcon className="w-10 h-10 text-white/20" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-white mb-4">Neural Tuning.</h2>
                  <p className="text-white/30 text-sm font-medium uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                    This subsystem is being calibrated for optimal response.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
