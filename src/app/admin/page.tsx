import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const session = await auth();

  // Security check: only ADMINs can see this
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Fetch some basic stats
  const [userCount, generationCount, recentUsers] = await Promise.all([
    db.user.count(),
    db.generation.count(),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { email: true, plan: true, createdAt: true },
    }),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Real-time platform metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card border rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
          <p className="text-4xl font-bold mt-2">{userCount}</p>
        </div>
        <div className="p-6 bg-card border rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Generations</p>
          <p className="text-4xl font-bold mt-2">{generationCount}</p>
        </div>
      </div>

      <div className="p-6 bg-card border rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Signups</h2>
        <div className="space-y-4">
          {recentUsers.map((u) => (
            <div key={u.email} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{u.email}</p>
                <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                {u.plan}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
