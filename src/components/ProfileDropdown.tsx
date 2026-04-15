"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings, CreditCard, FileText, LogOut, User, Sparkles, LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";

const PLAN_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  PRO:    { bg: "rgba(146,220,229,0.1)", text: "#92dce5", border: "rgba(146,220,229,0.2)" },
  FREE:   { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)" },
};

function Avatar({ name, image, size = 36 }: { name: string; image?: string; size?: number }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "P";
  if (image) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#92dce5,#d64933)", padding: 1.5 }}>
        <img src={image} alt={name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #92dce5, #d64933)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#080808",
    }}>
      {initials}
    </div>
  );
}

export function ProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const user = session?.user;
  const plan = (user?.plan ?? "FREE") as "FREE" | "PRO";
  const planStyle = PLAN_STYLES[plan] ?? PLAN_STYLES.FREE;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/landing");
  };

  if (!user) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <Link href="/auth/signin" style={{ padding: "6px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", transition: "color 0.15s" }}>
          Sign in
        </Link>
        <Link href="/auth/signup" style={{ padding: "6px 14px", borderRadius: 9, background: "#92dce5", color: "#080808", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          Get started
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "6px 10px 6px 6px", borderRadius: 12,
            background: open ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`,
            cursor: "pointer", transition: "all 0.15s", outline: "none",
          }}
        >
          <Avatar name={user.name || "User"} image={user.image || undefined} size={30} />
          <div style={{ textAlign: "left", minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
              {user.name || "User"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.2 }}>
              {plan.toUpperCase()}
            </div>
          </div>
          <svg
            width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth={2.5}
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} style={{ width: 260 }}>
        {/* Profile header */}
        <div style={{ padding: "12px 14px 10px", display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={user.name || "User"} image={user.image || undefined} size={40} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name || "User"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          </div>
          <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: planStyle.bg, color: planStyle.text, border: `1px solid ${planStyle.border}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {plan}
          </span>
        </div>

        <DropdownMenuSeparator />

        {/* Status badge */}
        <div style={{ padding: "6px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Sparkles size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Status</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "rgba(146,220,229,0.1)", color: "#92dce5", border: "1px solid rgba(146,220,229,0.15)", textTransform: "capitalize" }}>
            {plan === "PRO" ? "Pro Member" : "Free Plan"}
          </span>
        </div>

        <DropdownMenuSeparator />

        {/* Nav items */}
        {[
          { label: "Profile",        href: "/profile",   icon: <User size={14} /> },
          { label: "Settings",       href: "/settings",  icon: <Settings size={14} /> },
          { label: "Subscription",   href: "/settings#subscription", icon: <CreditCard size={14} /> },
          { label: "Templates",      href: "/examples",  icon: <LayoutTemplate size={14} /> },
          { label: "Terms & Privacy",href: "/terms",     icon: <FileText size={14} /> },
        ].map(item => (
          <DropdownMenuItem key={item.label} asChild>
            <Link href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", color: "rgba(255,255,255,0.6)", textDecoration: "none", borderRadius: 10, transition: "all 0.12s" }}
              className="group"
            >
              <span style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem asChild>
          <button
            onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, background: "rgba(214,73,51,0.08)", border: "none", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(214,73,51,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(214,73,51,0.08)")}
          >
            <LogOut size={14} style={{ color: "#d64933" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#d64933" }}>Sign out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

