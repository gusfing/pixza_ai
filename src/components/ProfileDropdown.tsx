"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings, CreditCard, FileText, LogOut, User, Sparkles, LayoutTemplate,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";

function Avatar({ name, image, size = 32 }: { name: string; image?: string; size?: number }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "P";
  if (image) {
    return (
      <div style={{ width: size, height: size }} className="rounded-full overflow-hidden flex-shrink-0 bg-white/5 p-[1px]">
        <img src={image} alt={name} className="w-full h-full rounded-full object-cover" />
      </div>
    );
  }
  return (
    <div 
      style={{ width: size, height: size, fontSize: size * 0.4 }} 
      className="rounded-full flex-shrink-0 bg-white text-black flex items-center justify-center font-black"
    >
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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/landing");
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/signin" className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest">
          Sign In
        </Link>
        <Link href="/auth/signup" className="px-6 py-2 text-xs font-black uppercase tracking-tighter bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          Join
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center gap-3 pl-1 pr-3 py-1 rounded-full transition-all border border-transparent",
          open ? "bg-white/10 border-white/10" : "hover:bg-white/5"
        )}>
          <Avatar name={user.name || "User"} image={user.image || undefined} size={28} />
          <span className="hidden md:inline text-xs font-bold text-white/80 tracking-tight">
            {user.name?.split(' ')[0]}
          </span>
          <ChevronDown className={cn("w-3 h-3 text-white/40 transition-transform", open && "rotate-180")} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        sideOffset={12} 
        className="w-64 glass-panel rounded-[32px] border-white/5 p-2 animate-obsidian shadow-2xl"
      >
        <div className="px-4 py-4 flex items-center gap-4">
          <Avatar name={user.name || "User"} image={user.image || undefined} size={44} />
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{user.name || "User"}</p>
            <p className="text-[10px] font-bold text-white/50 truncate uppercase tracking-widest">{plan} Account</p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/5 mx-2" />

        <div className="p-1 space-y-1">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/90 hover:text-white hover:bg-white/5 transition-all outline-none">
              <User className="w-4 h-4" />
              <span className="text-xs font-bold tracking-tight">Gallery</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/90 hover:text-white hover:bg-white/5 transition-all outline-none">
              <Settings className="w-4 h-4" />
              <span className="text-xs font-bold tracking-tight">Studio Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings#subscription" className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/90 hover:text-white hover:bg-white/5 transition-all outline-none">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-bold tracking-tight">Billing</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-white/5 mx-2" />

        <div className="p-1">
          <DropdownMenuItem asChild>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold tracking-tight">Sign Out</span>
            </button>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
