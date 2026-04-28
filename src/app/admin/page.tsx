"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import { PLAN_CREDIT_LIMITS } from "@/lib/wordpress";
import { Search, RefreshCw, Users, Zap, Crown, TrendingUp } from "lucide-react";

interface AdminUser {
  id: number;
  username: string;
  name: string;
  email: string;
  registered: string;
  roles: string[];
  meta: { plan?: string; credits?: number; credits_limit?: number; generations_count?: number };
}

interface Stats {
  total_users: number;
  total_generations: number;
  pro_users: number;
  agency_users: number;
  free_users: number;
  credits_issued: number;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useWPAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Auth guard — only WP admins
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [authLoading, user, router]);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) setStats(await res.json());
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), per_page: "15" });
    if (debouncedSearch) qs.set("search", debouncedSearch);
    const res = await fetch(`/api/admin/users?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: editingUser.meta.plan,
          credits: editingUser.meta.credits,
          credits_limit: editingUser.meta.credits_limit,
        }),
      });
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  );

  const planColor: Record<string, string> = {
    free: "text-white/40",
    pro: "text-violet-400",
    agency: "text-amber-400",
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased">
      {/* Nav */}
      <nav className="h-14 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <img src="/pixza-logo.png" alt="" className="w-6 h-6 invert" />
          <span className="font-black tracking-tighter">Admin</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs font-medium">Pixza Studio</span>
        </div>
        <button onClick={() => { fetchUsers(); fetchStats(); }} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-10">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Users" value={stats.total_users} icon={Users} color="bg-white/10 text-white" />
            <StatCard label="Generations" value={stats.total_generations} icon={Zap} color="bg-violet-500/20 text-violet-400" />
            <StatCard label="Pro Users" value={stats.pro_users} icon={Crown} color="bg-violet-500/20 text-violet-400" />
            <StatCard label="Agency" value={stats.agency_users} icon={Crown} color="bg-amber-500/20 text-amber-400" />
            <StatCard label="Free Users" value={stats.free_users} icon={Users} color="bg-white/10 text-white/40" />
            <StatCard label="Credits Issued" value={stats.credits_issued.toLocaleString()} icon={TrendingUp} color="bg-cyan-500/20 text-cyan-400" />
          </div>
        )}

        {/* Users Table */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tighter">Users</h2>
              <p className="text-white/30 text-xs mt-1">{total} total</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users…"
                className="bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 w-64"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {["User", "Plan", "Credits", "Limit", "Generations", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-3 bg-white/5 rounded animate-pulse w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30">No users found</td></tr>
                ) : users.map(u => {
                  const plan = u.meta?.plan ?? "free";
                  const credits = u.meta?.credits ?? PLAN_CREDIT_LIMITS[plan] ?? 50;
                  const limit = u.meta?.credits_limit ?? PLAN_CREDIT_LIMITS[plan] ?? 50;
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{u.name || u.username}</div>
                        <div className="text-white/30 text-xs">{u.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-black uppercase tracking-widest ${planColor[plan] ?? "text-white/40"}`}>{plan}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm">{credits.toLocaleString()}</td>
                      <td className="px-5 py-4 font-mono text-sm text-white/40">{limit.toLocaleString()}</td>
                      <td className="px-5 py-4 text-white/40">{(u.meta?.generations_count ?? 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-white/30 text-xs">{new Date(u.registered).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser({ ...u, meta: { ...u.meta, plan, credits, credits_limit: limit } })}
                            className="text-xs font-bold text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
                              await fetch(`/api/admin/users/${u.id}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ role: "deleted" }),
                              });
                              fetchUsers();
                            }}
                            className="text-xs font-bold text-red-500/40 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-red-500/10 hover:border-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border border-white/10 text-sm text-white/40 disabled:opacity-30 hover:text-white hover:border-white/20 transition-all">← Prev</button>
              <span className="px-4 py-2 text-sm text-white/40">{page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 rounded-xl border border-white/10 text-sm text-white/40 disabled:opacity-30 hover:text-white hover:border-white/20 transition-all">Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md space-y-6" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-xl font-black tracking-tighter">Edit User</h3>
              <p className="text-white/40 text-sm mt-1">{editingUser.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Plan</label>
                <select
                  value={editingUser.meta.plan ?? "free"}
                  onChange={e => setEditingUser(u => u ? { ...u, meta: { ...u.meta, plan: e.target.value, credits_limit: PLAN_CREDIT_LIMITS[e.target.value] ?? 50 } } : u)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Credits (current balance)</label>
                <input
                  type="number"
                  value={editingUser.meta.credits ?? 0}
                  onChange={e => setEditingUser(u => u ? { ...u, meta: { ...u.meta, credits: Number(e.target.value) } } : u)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Credit Limit (monthly cap)</label>
                <input
                  type="number"
                  value={editingUser.meta.credits_limit ?? PLAN_CREDIT_LIMITS[editingUser.meta.plan ?? "free"]}
                  onChange={e => setEditingUser(u => u ? { ...u, meta: { ...u.meta, credits_limit: Number(e.target.value) } } : u)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all">
                Cancel
              </button>
              <button onClick={handleSaveUser} disabled={saving} className="flex-1 py-3 rounded-2xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all disabled:opacity-50">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

