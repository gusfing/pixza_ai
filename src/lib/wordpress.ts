/**
 * WordPress REST API client
 * Handles auth, users, subscriptions, settings, emails via WP backend
 */

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://seashell-peafowl-234313.hostingersite.com";
const WP_API = `${WP_URL}/wp-json`;

// ── Types ────────────────────────────────────────────────────

export interface WPUser {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_urls: Record<string, string>;
  meta: {
    plan?: "free" | "pro" | "agency";
    api_keys?: Record<string, string>;
    generations_count?: number;
    onboarding_done?: boolean;
    preferred_model?: string;
    preferred_tab?: string;
  };
}

export interface WPSubscription {
  id: number;
  status: "active" | "cancelled" | "expired" | "pending";
  plan: "free" | "pro" | "agency";
  next_payment: string;
  trial_end?: string;
}

export interface WPTemplate {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  acf: {
    prompt: string;
    model: string;
    provider: string;
    tab: string;
    emoji: string;
    color: string;
    needs_ref: boolean;
    is_featured: boolean;
    category: string;
  };
}

export interface WPPromotion {
  id: number;
  code: string;
  discount_type: "percent" | "fixed_cart";
  amount: string;
  description: string;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
}

// ── Auth ─────────────────────────────────────────────────────

export async function wpLogin(username: string, password: string): Promise<{ token: string; user: WPUser }> {
  const res = await fetch(`${WP_API}/jwt-auth/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }
  const data = await res.json();
  return { token: data.token, user: data.user_display_name };
}

export async function wpRegister(data: {
  username: string;
  email: string;
  password: string;
  name?: string;
}): Promise<WPUser> {
  const res = await fetch(`${WP_API}/pixza/v1/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }
  return res.json();
}

export async function wpGetMe(token: string): Promise<WPUser> {
  const res = await wpFetch("/wp/v2/users/me?context=edit", token);
  return res.json();
}

export async function wpValidateToken(token: string): Promise<boolean> {
  const res = await fetch(`${WP_API}/jwt-auth/v1/token/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

// ── User meta / settings ─────────────────────────────────────

export async function wpUpdateUserMeta(
  token: string,
  meta: Partial<WPUser["meta"]>
): Promise<WPUser> {
  const res = await wpFetch("/wp/v2/users/me", token, {
    method: "POST",
    body: JSON.stringify({ meta }),
  });
  return res.json();
}

export async function wpSaveApiKey(
  token: string,
  provider: string,
  key: string
): Promise<void> {
  await wpFetch("/pixza/v1/api-keys", token, {
    method: "POST",
    body: JSON.stringify({ provider, key }),
  });
}

export async function wpGetApiKeys(token: string): Promise<Record<string, string>> {
  const res = await wpFetch("/pixza/v1/api-keys", token);
  const data = await res.json();
  return data.keys ?? {};
}

// ── Subscriptions (WooCommerce) ───────────────────────────────

export async function wpGetSubscription(token: string): Promise<WPSubscription | null> {
  const res = await wpFetch("/pixza/v1/subscription", token);
  if (!res.ok) return null;
  return res.json();
}

export async function wpCreateCheckout(
  token: string,
  plan: "pro" | "agency",
  coupon?: string
): Promise<{ checkout_url: string }> {
  const res = await wpFetch("/pixza/v1/checkout", token, {
    method: "POST",
    body: JSON.stringify({ plan, coupon }),
  });
  if (!res.ok) throw new Error("Failed to create checkout");
  return res.json();
}

export async function wpCancelSubscription(token: string): Promise<void> {
  await wpFetch("/pixza/v1/subscription/cancel", token, { method: "POST" });
}

// ── Promotions / Coupons ──────────────────────────────────────

export async function wpValidateCoupon(code: string): Promise<WPPromotion | null> {
  const res = await fetch(`${WP_API}/pixza/v1/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Templates (Custom Post Type) ─────────────────────────────

export async function wpGetTemplates(params?: {
  tab?: string;
  featured?: boolean;
  per_page?: number;
}): Promise<WPTemplate[]> {
  const qs = new URLSearchParams({
    per_page: String(params?.per_page ?? 20),
    ...(params?.tab ? { "filter[meta_key]": "tab", "filter[meta_value]": params.tab } : {}),
  });
  const res = await fetch(`${WP_API}/wp/v2/pixza_template?${qs}`);
  if (!res.ok) return [];
  return res.json();
}

// ── Email (via WP REST) ───────────────────────────────────────

export async function wpSendEmail(data: {
  to: string;
  subject: string;
  template: "welcome" | "upgrade" | "reset_password" | "generation_done";
  vars?: Record<string, string>;
}): Promise<void> {
  await fetch(`${WP_API}/pixza/v1/email/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Secret": process.env.WP_API_SECRET!,
    },
    body: JSON.stringify(data),
  });
}

// ── Generations (save to WP) ──────────────────────────────────

export async function wpSaveGeneration(
  token: string,
  data: {
    prompt: string;
    mode: string;
    model: string;
    provider: string;
    output_url?: string;
    output_type: string;
    status: "done" | "failed";
  }
): Promise<{ id: number }> {
  const res = await wpFetch("/pixza/v1/generations", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save generation");
  return res.json();
}

export async function wpGetGenerations(
  token: string,
  page = 1
): Promise<{ items: Array<{ id: number; prompt: string; output_url: string; mode: string; created_at: string }>; total: number }> {
  const res = await wpFetch(`/pixza/v1/generations?page=${page}&per_page=20`, token);
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

// ── Blog / Content ────────────────────────────────────────────

export async function wpGetPosts(params?: { per_page?: number; page?: number; search?: string }) {
  const qs = new URLSearchParams({
    per_page: String(params?.per_page ?? 6),
    page: String(params?.page ?? 1),
    _embed: "1",
  });
  if (params?.search) qs.set("search", params.search);
  const res = await fetch(`${WP_API}/wp/v2/posts?${qs}`);
  if (!res.ok) return { items: [], pages: 1 };
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
  const raw: any[] = await res.json();
  const items = raw.map((p: any) => {
    const embedded = p._embedded ?? {};
    return {
      id: p.id,
      slug: p.slug,
      title: p.title?.rendered?.replace(/<[^>]*>/g, "") ?? "",
      excerpt: p.excerpt?.rendered?.replace(/<[^>]*>/g, "").trim() ?? "",
      thumbnail: embedded["wp:featuredmedia"]?.[0]?.source_url ?? "",
      author: embedded["author"]?.[0]?.name ?? "Pixza Team",
      date: p.date,
      categories: (embedded["wp:term"]?.[0] ?? []).map((c: any) => c.name),
      read_time: `${Math.max(1, Math.round((p.content?.rendered?.split(/\s+/).length ?? 0) / 200))} min read`,
    };
  });
  return { items, pages: totalPages };
}

// ── Helpers ───────────────────────────────────────────────────

async function wpFetch(
  path: string,
  token?: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Append token as query param fallback (for hosts that strip Authorization header)
  let url = `${WP_API}${path}`;
  if (token) {
    const sep = url.includes("?") ? "&" : "?";
    url += `${sep}_pixza_token=${encodeURIComponent(token)}`;
  }

  return fetch(url, { ...options, headers });
}
