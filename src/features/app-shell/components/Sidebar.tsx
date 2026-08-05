"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Sparkles, CreditCard, Settings, Plus, LogOut } from "lucide-react";
import { useLogout } from "@/features/auth/use-logout";
import { BusinessSwitcher } from "./BusinessSwitcher";

export const NAV_ITEMS = {
  menu: [
    { href: "/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/detail", label: "Detail Platform", icon: BarChart3 },
    { href: "/insight", label: "AI Insight", icon: Sparkles },
  ],
  lainnya: [
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/connect-platform", label: "Connect Platform", icon: Plus },
  ],
};

export function Sidebar() {
  const activePath = usePathname();
  const logout = useLogout();

  return (
    <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-line bg-card p-3.5 max-[760px]:w-[72px] max-[760px]:px-2">
      <div className="flex items-center gap-2 px-1.5 pb-4 pt-1 text-[15px] font-extrabold max-[760px]:justify-center max-[760px]:px-0">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-xs text-ink">L</span>
        <span className="max-[760px]:hidden">Lensa</span>
      </div>

      <BusinessSwitcher />

      <div className="px-2.5 pb-2 pt-3.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-3 max-[760px]:hidden">Menu</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.menu.map((item) => (
          <NavLink key={item.href} item={item} active={activePath === item.href} />
        ))}
      </nav>

      <div className="px-2.5 pb-2 pt-3.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-3 max-[760px]:hidden">Lainnya</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.lainnya.map((item) => (
          <NavLink key={item.href} item={item} active={activePath === item.href} />
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5 max-[760px]:flex-col max-[760px]:gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#ffe27a] text-xs font-bold text-ink">
          S
        </div>
        <div className="min-w-0 flex-1 max-[760px]:hidden">
          <div className="truncate text-[12.5px] font-bold">Sinta W.</div>
          <div className="text-[10.5px] text-ink-3">Owner</div>
        </div>
        <Link href="/settings" className="shrink-0 text-ink-3 hover:text-ink-2" title="Settings">
          <Settings className="size-4" />
        </Link>
        <button
          type="button"
          onClick={logout}
          className="shrink-0 text-ink-3 hover:text-red"
          title="Keluar"
          aria-label="Keluar"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium max-[760px]:justify-center max-[760px]:px-0 ${
        active ? "bg-accent text-ink" : "text-ink-2 hover:bg-bg"
      }`}
    >
      <Icon className="size-[17px] shrink-0" />
      <span className="max-[760px]:hidden">{item.label}</span>
    </Link>
  );
}
