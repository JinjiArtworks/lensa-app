"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { CreateBusinessModal } from "@/components/shared/CreateBusinessModal";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useBusinesses } from "../api/use-businesses";

function initialsOf(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function BusinessSwitcher() {
  const showToast = useUiStore((s) => s.showToast);
  const activeBusinessId = useUiStore((s) => s.activeBusinessId);
  const setActiveBusinessId = useUiStore((s) => s.setActiveBusinessId);
  const uid = useAuthStore((s) => s.user?.uid);
  const { data: businesses = [] } = useBusinesses(uid);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [lockedFor, setLockedFor] = useState<"add" | string | null>(null);

  // The account's plan is whichever plan the FIRST business the owner ever
  // registered has — not whatever business happens to be active right now.
  // A business's own `plan` field can't be trusted for this: every business
  // is created with `plan: "free"` regardless of the account's plan at the
  // time (see `useAddBusiness`), so keying the "can I add/access a 2nd
  // business" gate off "whichever business is active" let a downgrade of
  // the primary business leave every extra business (added while Pro) fully
  // switchable forever — nothing ever re-locked them.
  const primaryBusiness = businesses[0];
  const isAccountFree = (primaryBusiness?.plan ?? "free") === "free";

  useEffect(() => {
    if (!primaryBusiness) return;
    const isActiveAccessible = !isAccountFree
      ? businesses.some((b) => b.id === activeBusinessId)
      : activeBusinessId === primaryBusiness.id;
    // Recovers from: a persisted id that's stale (business deleted, or
    // leftover from a different account on the same browser), or a business
    // that's still there but got locked out by a downgrade to Free.
    if (!isActiveAccessible) setActiveBusinessId(primaryBusiness.id);
  }, [activeBusinessId, businesses, isAccountFree, primaryBusiness, setActiveBusinessId]);

  const active = businesses.find((b) => b.id === activeBusinessId) ?? primaryBusiness;
  if (!active) return null;

  return (
    <div className="relative mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={`${active.name} · ${isAccountFree ? "Free" : "Pro"} plan`}
        className="flex w-full items-center gap-2 rounded-lg border border-line bg-bg p-2.5 text-left max-[760px]:justify-center max-[760px]:p-1.5"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-[11px] font-bold text-accent-text">
          {initialsOf(active.name)}
        </span>
        <span className="min-w-0 flex-1 max-[760px]:hidden">
          <span className="block truncate text-[12.5px] font-bold leading-tight text-ink">{active.name}</span>
          <span className="block text-[10.5px] font-semibold text-accent-text">
            {isAccountFree ? "Free" : "Pro"} plan
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-2 max-[760px]:hidden" />
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-50 max-h-64 w-64 overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-lg max-[760px]:left-1">
          {businesses.map((b) => {
            const locked = isAccountFree && b.id !== primaryBusiness?.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (locked) {
                    setLockedFor(b.name);
                    return;
                  }
                  setActiveBusinessId(b.id);
                  showToast(`Ganti ke bisnis: ${b.name}`);
                }}
                className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-[12.5px] ${
                  b.id === activeBusinessId ? "bg-accent-bg font-bold text-accent-text" : "hover:bg-bg"
                } ${locked ? "opacity-60" : ""}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10.5px] font-bold ${
                    b.id === activeBusinessId ? "bg-accent text-ink" : "bg-gray-bg text-ink-2"
                  }`}
                >
                  {initialsOf(b.name)}
                </span>
                <span className="min-w-0 flex-1 truncate">{b.name}</span>
                {locked && <Lock className="size-3 shrink-0 text-ink-3" />}
              </button>
            );
          })}
          <hr className="my-1.5 border-line" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (isAccountFree) setLockedFor("add");
              else setCreateOpen(true);
            }}
            className="flex w-full items-center justify-between gap-1.5 rounded-lg p-2 text-left text-[12.5px] font-bold text-accent-text hover:bg-bg"
          >
            + Tambah Bisnis Baru
            {isAccountFree && <ProLockBadge tooltip="Upgrade ke Pro untuk kelola lebih dari 1 bisnis" />}
          </button>
        </div>
      )}

      <CreateBusinessModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        ownerId={uid}
        onCreated={(businessId) => {
          setActiveBusinessId(businessId);
          showToast("Bisnis baru ditambahkan", "success");
        }}
      />
      <ProUpgradeDialog
        open={lockedFor !== null}
        onOpenChange={(o) => !o && setLockedFor(null)}
        title={lockedFor === "add" ? "Tambah bisnis baru?" : `Buka "${lockedFor}" lagi?`}
        description={
          lockedFor === "add"
            ? "Plan Free cuma bisa 1 bisnis. Upgrade ke Pro buat kelola beberapa bisnis sekaligus."
            : `Bisnis ini terkunci karena akunmu udah balik ke plan Free (cuma bisa akses 1 bisnis — "${primaryBusiness?.name}"). Upgrade ke Pro buat akses lagi.`
        }
      />
    </div>
  );
}
