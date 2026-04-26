/**
 * WordPress REST API client
 * Handles auth, users, subscriptions, credits, admin via WP backend
 */

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "";
const WP_API = `${WP_URL}/wp-json`;
const WP_SECRET = process.env.WP_API_SECRET ?? "";

// ── Types ────────────────────────────────────────────────────

export interface WPUser {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_urls: Record<string, string>;
  meta: {
    plan?: "free" | "pro" | "agency";
    credits?: number;               // remaining credits
    credits_limit?: number;         // monthly credit cap
    generations_count?: number;     // lifetime total
    api_keys?: Record<string, string>;
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

// Credit costs per generation type
export const CREDIT_COSTS: Record<string, number> = {
  image: 1,
  video: 10,
  audio: 3,
  "3d": 5,
};

// Default credit limits per plan
export const PLAN_CREDIT_LIMITS: Record<string, number> = {
  free: 50,
  pro: 2000,
  agency: 10000,
};

// ── Auth ─────────────────────────────────────────────────────

export async function wpLogin(username: string, password: string): Promise<{ token: string; user: WPUser }> {
  const res = await fetch("/api/wp-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "/jwt-auth/v1/token", method: "POST", body: { username, password } }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
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
  const res = await fetch("/api/wp-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "/pixza/v1/register", method: "POST", body: data }),
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
  const res = await fetch("/api/wp-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "/jwt-auth/v1/token/validate", method: "POST", token }),
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

// ── Credits ───────────────────────────────────────────────────

/**
 * Get current credit balance for the authenticated user.
 * Falls back to plan default if meta not set yet.
 */
export async function wpGetCredits(token: string): Promise<{ credits: number; limit: number; plan: string }> {
  const user = await wpGetMe(token);
  const plan = user.meta?.plan ?? "free";
  const limit = user.meta?.credits_limit ?? PLAN_CREDIT_LIMITS[plan] ?? 50;
  const credits = user.meta?.credits ?? limit; // first time: full balance
  return { credits, limit, plan };
}

/**
 * Deduct credits from a user. Called server-side using WP_API_SECRET.
 * Returns updated balance or throws if insufficient.
 */
export async function wpDeductCredits(
  userId: number,
  amount: number,
  reason: string,
  model?: string,
  provider?: string,
): Promise<{ credits: number; limit: number }> {
  const res = await fetch(`${WP_API}/pixza/v1/credits/deduct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Secret": WP_SECRET,
    },
    body: JSON.stringify({ user_id: userId, amount, reason, model: model ?? "", provider: provider ?? "" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Insufficient credits");
  }
  return res.json();
}

/**
 * Admin: set credits and/or plan for any user.
 */
export async function wpAdminSetUserCredits(
  userId: number,
  data: { credits?: number; credits_limit?: number; plan?: string }
): Promise<void> {
  const res = await fetch(`${WP_API}/pixza/v1/admin/users/${userId}/credits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Secret": WP_SECRET,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user credits");
}

// ── Admin ─────────────────────────────────────────────────────

export interface WPAdminUser {
  id: number;
  username: string;
  name: string;
  email: string;
  registered: string;
  roles: string[];
  meta: {
    plan?: string;
    credits?: number;
    credits_limit?: number;
    generations_count?: number;
  };
}

/**
 * Admin: list all users with their plan/credit data.
 */
export async function wpAdminGetUsers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<{ users: WPAdminUser[]; total: number; pages: number }> {
  const qs = new URLSearchParams({
    per_page: String(params?.per_page ?? 20),
    page: String(params?.page ?? 1),
    context: "edit",
  });
  if (params?.search) qs.set("search", params.search);

  const res = await fetch(`${WP_API}/pixza/v1/admin/users?${qs}`, {
    headers: { "X-WP-Secret": WP_SECRET },
  });
  if (!res.ok) return { users: [], total: 0, pages: 1 };
  return res.json();
}

/**
 * Admin: update a user's plan, credits, or role.
 */
export async function wpAdminUpdateUser(
  userId: number,
  data: { plan?: string; credits?: number; credits_limit?: number; role?: string; name?: string }
): Promise<void> {
  const res = await fetch(`${WP_API}/pixza/v1/admin/users/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Secret": WP_SECRET,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
}

/**
 * Admin: get platform stats.
 */
export async function wpAdminGetStats(): Promise<{
  total_users: number;
  total_generations: number;
  pro_users: number;
  agency_users: number;
  free_users: number;
  credits_issued: number;
}> {
  const res = await fetch(`${WP_API}/pixza/v1/admin/stats`, {
    headers: { "X-WP-Secret": WP_SECRET },
  });
  if (!res.ok) return { total_users: 0, total_generations: 0, pro_users: 0, agency_users: 0, free_users: 0, credits_issued: 0 };
  return res.json();
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
      "X-WP-Secret": WP_SECRET,
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

// Use server-side proxy when called from browser to avoid CORS
// NOTE: If WordPress blocks server-to-server (common on shared hosting),
// browser calls go directly to WP (CORS must be configured on WP side)
const isBrowser = typeof window !== "undefined";

async function wpFetch(
  path: string,
  token?: string,
  options: RequestInit = {}
): Promise<Response> {
  // Always proxy through Next.js to avoid CORS issues
  if (isBrowser) {
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    return fetch("/api/wp-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        method: options.method ?? "GET",
        body,
        token,
      }),
    });
  }

  // Server-side: call WP directly (no CORS restriction)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let url = `${WP_API}${path}`;
  if (token) {
    const sep = url.includes("?") ? "&" : "?";
    url += `${sep}_pixza_token=${encodeURIComponent(token)}`;
  }

  return fetch(url, { ...options, headers });
}
