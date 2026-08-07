"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Sparkles,
  CreditCard,
  Plus,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/features/auth/use-logout";
import { useAuthStore } from "@/stores/auth";
import { useUiStore, type DetailPlatformView } from "@/stores/ui";
import { useUserProfile } from "@/features/auth/api/use-user-profile";
import { useProGate } from "@/components/shared/use-pro-gate";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useConnectedPlatforms } from "@/features/binding/api/use-connect-platform";
import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";
import { DETAIL_VIEW_LABELS, DETAIL_VIEW_ORDER } from "@/features/detail-platform/lib/detail-view";
import { BusinessSwitcher } from "./BusinessSwitcher";

const PLATFORM_KEYS = Object.keys(PLATFORM_LABELS) as PlatformKey[];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const NAV_ITEMS = {
  menu: [
    { href: "/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/detail", label: "Detail Platform", icon: BarChart3 },
    { href: "/insight", label: "AI Insight", icon: Sparkles },
  ],
  lainnya: [
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/binding", label: "Binding", icon: Plus },
  ],
};

export function Sidebar() {
  const activePath = usePathname();
  const logout = useLogout();
  const authUser = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile(authUser?.uid);
  const name = profile?.name ?? authUser?.email?.split("@")[0] ?? "Pengguna";

  return (
    <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-line bg-card p-3.5 max-[760px]:w-[72px] max-[760px]:px-2">
      <div className="flex items-center gap-2 px-1.5 pb-4 pt-1 text-[15px] font-extrabold max-[760px]:justify-center max-[760px]:px-0">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-xs text-ink">L</span>
        <span className="max-[760px]:hidden">Lensa</span>
      </div>

      <BusinessSwitcher />

      <div className="px-2.5 pb-2 pt-3.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-3 max-[760px]:hidden">Menu</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.menu.map((item) =>
          item.href === "/detail" ? (
            <DetailPlatformNavItem key={item.href} item={item} active={activePath === item.href} />
          ) : (
            <NavLink key={item.href} item={item} active={activePath === item.href} />
          )
        )}
      </nav>

      <div className="px-2.5 pb-2 pt-3.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-3 max-[760px]:hidden">Lainnya</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.lainnya.map((item) => (
          <NavLink key={item.href} item={item} active={activePath === item.href} />
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5 max-[760px]:flex-col max-[760px]:gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#ffe27a] text-xs font-bold text-ink">
          {initialsOf(name)}
        </div>
        <div className="min-w-0 flex-1 max-[760px]:hidden">
          <div className="truncate text-[12.5px] font-bold">{name}</div>
          <div className="text-[10.5px] text-ink-3">Owner</div>
        </div>
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

// Detail Platform's nav item expands into a submenu (Semua Platform / Meta
// Ads / TikTok Ads) instead of the page owning an in-page switcher — this is
// the sidebar's own "current view" state, shared with the /detail page via
// useUiStore.detailPlatformView. On desktop the submenu auto-expands while
// /detail is active; on the collapsed-rail mobile layout it's a toggleable
// flyout instead (no room to show it inline without covering other UI).
function DetailPlatformNavItem({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = item.icon;
  const router = useRouter();
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const detailPlatformView = useUiStore((s) => s.detailPlatformView);
  const setDetailPlatformView = useUiStore((s) => s.setDetailPlatformView);
  const { isFree, isPlatformLocked } = useProGate(activeBusinessId);
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const [pendingUpgrade, setPendingUpgrade] = useState<DetailPlatformView | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const platformLimit = isFree ? 1 : PLATFORM_KEYS.length;

  // Only relevant on the collapsed-rail mobile layout — the desktop submenu
  // stays purely `active`-driven (auto-shown, no toggle). Reset whenever this
  // item stops being active so a later return to /detail starts closed
  // instead of reopening on top of whatever page-level UI is now there.
  useEffect(() => {
    if (!active) setMobileMenuOpen(false);
  }, [active]);

  function isViewLocked(key: DetailPlatformView): boolean {
    return isPlatformLocked(connectedPlatforms.includes(key), connectedPlatforms.length, platformLimit);
  }

  // Stored view can go stale (e.g. plan downgraded elsewhere) — snap back to
  // the one connected platform once the current selection is locked.
  useEffect(() => {
    if (connectedPlatforms.length === 0) return;
    if (!isFree || connectedPlatforms.includes(detailPlatformView)) return;
    setDetailPlatformView((connectedPlatforms[0] as PlatformKey) ?? "meta");
  }, [connectedPlatforms, isFree, detailPlatformView, setDetailPlatformView]);

  function selectView(key: DetailPlatformView) {
    if (isViewLocked(key)) {
      setPendingUpgrade(key);
      return;
    }
    setDetailPlatformView(key);
    setMobileMenuOpen(false);
    router.push("/detail");
  }

  const currentPlatformNames = connectedPlatforms
    .map((key) => PLATFORM_LABELS[key as PlatformKey]?.name)
    .filter(Boolean)
    .join(", ");
  const pendingPlatformName = pendingUpgrade ? PLATFORM_LABELS[pendingUpgrade].name : "";

  const platformOptions = DETAIL_VIEW_ORDER.map((key) => {
    const isActive = detailPlatformView === key;
    const locked = isViewLocked(key);
    return (
      <button
        key={key}
        type="button"
        onClick={() => selectView(key)}
        title={locked ? "Upgrade ke Pro untuk buka multi platform" : undefined}
        className={`flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-semibold ${
          isActive ? "bg-accent-bg text-accent-text" : locked ? "text-ink-3" : "text-ink-2 hover:bg-bg"
        }`}
      >
        {DETAIL_VIEW_LABELS[key]}
        {isActive ? (
          <Check className="size-3.5 shrink-0" />
        ) : locked ? (
          <ProLockBadge tooltip="Upgrade ke Pro untuk buka multi platform" />
        ) : null}
      </button>
    );
  });

  return (
    <div className="relative">
      <Link
        href={item.href}
        title={item.label}
        onClick={(e) => {
          // Already on /detail — a normal Link click here is a same-route
          // no-op navigation, so hijack it to toggle the mobile flyout
          // instead (desktop's submenu doesn't use this state at all, so
          // toggling it has no effect there).
          if (active) {
            e.preventDefault();
            setMobileMenuOpen((o) => !o);
          }
        }}
        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium max-[760px]:justify-center max-[760px]:px-0 ${
          active ? "bg-accent text-ink" : "text-ink-2 hover:bg-bg"
        }`}
      >
        <Icon className="size-[17px] shrink-0" />
        <span className="min-w-0 flex-1 max-[760px]:hidden">{item.label}</span>
        {active ? (
          <ChevronDown className="size-3.5 shrink-0 max-[760px]:hidden" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 max-[760px]:hidden" />
        )}
      </Link>
      {active && (
        <div className="ml-2 mt-2 hidden flex-col gap-1 border-l border-line pl-2.5 min-[761px]:flex">
          {platformOptions}
        </div>
      )}
      {active && mobileMenuOpen && (
        <>
          {/* Tap-outside-to-close backdrop — mobile flyout only, desktop never renders this. */}
          <div className="fixed inset-0 z-40 min-[761px]:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-full top-0 z-50 ml-1.5 flex w-44 flex-col gap-1 rounded-xl border border-line bg-card p-1.5 shadow-lg min-[761px]:hidden">
            {platformOptions}
          </div>
        </>
      )}
      <ProUpgradeDialog
        open={pendingUpgrade !== null}
        onOpenChange={(o) => !o && setPendingUpgrade(null)}
        title={`${pendingPlatformName} terkunci`}
        description={
          <>
            Plan Free cuma bisa 1 platform aktif, dan pilihan itu terkunci permanen setelah connect — kamu udah
            connect <b>{currentPlatformNames}</b>. Upgrade ke Pro buat lihat <b>{pendingPlatformName}</b> juga tanpa
            lepas yang sekarang.
          </>
        }
      />
    </div>
  );
}
