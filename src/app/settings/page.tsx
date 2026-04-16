"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import { wpCancelSubscription, wpUpdateUserMeta } from "@/lib/wordpress";

const C = { bg: "#040406", surface: "#0e0e10", surface2: "#161618", border: "rgba(255,255,255,0.08)", text: "#fff", text2: "rgba(255,255,255,0.5)", text3: "rgba(255,255,255,0.25)", accent: "#92dce5", action: "#d64933" };

type Tab = "profile" | "subscription" | "notifications" | "appearance";


const PLANS = [
  { id: "free",   name: "Free",   price: "$0",  period: "",     features: ["20 generations/day", "Basic models", "Community templates"], color: C.text3 },
  { id: "pro",    name: "Pro",    price: "$9",  period: "/mo",  features: ["200 generations/day", "All models", "Priority queue", "R2 storage", "API access"], color: C.accent },
  { id: "agency", name: "Agency", price: "$29", period: "/mo",  features: ["Unlimited generations", "Team seats", "White-label", "Custom domain", "SLA support"], color: "#f97316" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "0 0 16px", letterSpacing: "-0.01em" }}>{children}</h3>;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>;
}

// ── Profile tab ──────────────────────────────────────────────
function ProfileTab() {
  const { user, token } = useWPAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
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

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle>Personal Info</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: C.text3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.text3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Email</label>
            <input value={user?.email ?? ""} disabled style={{ ...inp, opacity: 0.5, cursor: "not-allowed" }} />
          </div>
          <button onClick={save} disabled={saving} style={{ alignSelf: "flex-start", padding: "9px 20px", borderRadius: 9, border: "none", background: saved ? "#10b981" : C.accent, color: "#080808", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
          </button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Danger Zone</SectionTitle>
        <p style={{ fontSize: 13, color: C.text3, margin: "0 0 14px" }}>Permanently delete your account and all data.</p>
        <button style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(214,73,51,0.1)", border: "1px solid rgba(214,73,51,0.25)", color: C.action, fontSize: 13, cursor: "pointer" }}>
          Delete account
        </button>
      </Card>
    </div>
  );
}


// ── Subscription tab ─────────────────────────────────────────
function SubscriptionTab() {
  const { user, token } = useWPAuth();
  const [sub, setSub] = useState<any | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In WordPress version, the subscription info is often in the user meta or 
    // fetched via wpGetSubscription in wordpress.ts
  }, [user]);

  const currentPlan = user?.meta?.plan?.toLowerCase() ?? "free";

  const handleCancel = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setLoading(true);
    try {
      await wpCancelSubscription(token);
      alert("Subscription cancelled successfully.");
    } catch (e) {
      alert("Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setLoading(true);
    try {
      // Future Stripe integration
      alert("Redirecting to checkout...");
    } catch (e) {
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async () => {
    setCouponMsg("Coupons currently disabled");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Current plan */}
      {sub && (
        <Card>
          <SectionTitle>Current Subscription</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, textTransform: "capitalize" }}>{sub.plan} Plan</div>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>
                {sub.status === "active" ? `Renews ${new Date(sub.next_payment).toLocaleDateString()}` : `Status: ${sub.status}`}
              </div>
            </div>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: sub.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(214,73,51,0.15)", color: sub.status === "active" ? "#10b981" : C.action, fontWeight: 600, textTransform: "uppercase" }}>{sub.status}</span>
          </div>
          {sub.status === "active" && (
            <button onClick={handleCancel} style={{ marginTop: 14, padding: "8px 16px", borderRadius: 8, background: "transparent", border: `1px solid rgba(214,73,51,0.3)`, color: C.action, fontSize: 12, cursor: "pointer" }}>
              Cancel subscription
            </button>
          )}
        </Card>
      )}

      {/* Promo code */}
      <Card>
        <SectionTitle>Promo Code</SectionTitle>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter code" style={{ flex: 1, padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          <button onClick={validateCoupon} style={{ padding: "9px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.text2, fontSize: 12, cursor: "pointer" }}>Apply</button>
        </div>
        {couponMsg && <p style={{ fontSize: 12, color: couponMsg.startsWith("✓") ? "#10b981" : C.action, margin: "8px 0 0" }}>{couponMsg}</p>}
      </Card>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} style={{ padding: 20, borderRadius: 14, border: `1px solid ${isCurrent ? plan.color : C.border}`, background: isCurrent ? `${plan.color}08` : C.surface2, position: "relative" }}>
              {isCurrent && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 9, padding: "2px 8px", borderRadius: 99, background: `${plan.color}20`, color: plan.color, fontWeight: 700 }}>CURRENT</span>}
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: plan.color, marginBottom: 14 }}>{plan.price}<span style={{ fontSize: 13, color: C.text3 }}>{plan.period}</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 12, color: C.text2, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && plan.id !== "free" && (
                <button onClick={() => handleUpgrade(plan.id as "pro" | "agency")} disabled={loading} style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: "none", background: plan.color === C.accent ? C.accent : plan.color, color: "#080808", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {loading ? "…" : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Notifications tab ────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({ generation_done: true, weekly_digest: true, product_updates: true, promotions: false });
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <SectionTitle>Email Notifications</SectionTitle>
        {Object.entries({ generation_done: "Generation complete", weekly_digest: "Weekly digest", product_updates: "Product updates", promotions: "Promotions & offers" }).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 13, color: C.text }}>{label}</div>
            </div>
            <div onClick={() => setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))} style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer", position: "relative", background: prefs[key as keyof typeof prefs] ? C.accent : "rgba(255,255,255,0.15)", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: 3, left: prefs[key as keyof typeof prefs] ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
          </div>
        ))}
        <button onClick={save} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 9, border: "none", background: saved ? "#10b981" : C.accent, color: "#080808", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {saved ? "✓ Saved" : "Save preferences"}
        </button>
      </Card>
    </div>
  );
}

// ── Appearance tab ───────────────────────────────────────────
function AppearanceTab() {
  const { user } = useWPAuth();
  const [model, setModel] = useState(user?.meta?.preferred_model ?? "fal-ai/flux-pro");
  const [tab, setTab] = useState(user?.meta?.preferred_tab ?? "Image");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const sel: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <SectionTitle>Default Preferences</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: C.text3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Default Tab</label>
            <select value={tab} onChange={e => setTab(e.target.value)} style={sel}>
              {["Image", "Video", "Audio", "3D"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.text3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Default Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} style={sel}>
              <option value="fal-ai/flux-pro">FLUX.1 Pro</option>
              <option value="fal-ai/flux/schnell">FLUX.1 Schnell</option>
              <option value="nano-banana-2">Gemini Imagen 4</option>
              <option value="fal-ai/kling-video/v1.6/pro/text-to-video">Kling 1.6 Pro</option>
            </select>
          </div>
          <button onClick={save} style={{ alignSelf: "flex-start", padding: "9px 20px", borderRadius: 9, border: "none", background: saved ? "#10b981" : C.accent, color: "#080808", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {saved ? "✓ Saved" : "Save preferences"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useWPAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [authLoading, user, router]);

  if (authLoading) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(146,220,229,0.2)", borderTopColor: C.accent, animation: "spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!user) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "subscription", label: "Subscription" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid ${C.border}`, background: "rgba(4,4,6,0.9)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/create" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/pixza-logo.png" alt="" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "contain" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Pixza Studio</span>
        </Link>
        <button onClick={() => logout()} style={{ fontSize: 12, color: C.text3, background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>Settings</h1>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 16px", borderRadius: 9, border: "none", cursor: "pointer", whiteSpace: "nowrap", background: tab === t.id ? C.surface2 : "transparent", color: tab === t.id ? C.text : C.text3, fontSize: 13, fontWeight: tab === t.id ? 600 : 400, outline: tab === t.id ? `1px solid ${C.border}` : "none" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "profile"      && <ProfileTab />}

        {tab === "subscription" && <SubscriptionTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "appearance"   && <AppearanceTab />}
      </div>
    </div>
  );
}
