"use client";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "";
      await fetch(`${WP_URL}/wp-json/pixza/v1/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          subject: "Welcome to the Pixza Journal",
          template: "welcome",
          vars: { name: email.split("@")[0] },
        }),
      });
    } catch { /* non-fatal */ }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <p style={{ color: "#92dce5", fontSize: 15, fontWeight: 600 }}>
        ✓ You're subscribed! Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        style={{ flex: 1, padding: "11px 14px", borderRadius: 10, background: "#161618", border: "1px solid rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: "#92dce5", color: "#080808", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", opacity: status === "loading" ? 0.6 : 1 }}
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}
