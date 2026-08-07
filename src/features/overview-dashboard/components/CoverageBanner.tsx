"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useUiStore } from "@/stores/ui";
import { useConnectedPlatforms } from "@/features/binding/api/use-connect-platform";
import { PLATFORM_LABELS, type PlatformKey } from "../mock-data";

const CATALOG_KEYS = Object.keys(PLATFORM_LABELS) as PlatformKey[];

export function CoverageBanner() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const total = CATALOG_KEYS.length;
  const missing = CATALOG_KEYS.filter((key) => !connectedPlatforms.includes(key)).map(
    (key) => PLATFORM_LABELS[key].name
  );

  return (
    <div className="mb-3.5 flex items-center gap-2.5 rounded-2xl bg-accent-bg px-4 py-2.5">
      <AlertCircle className="size-4 shrink-0 text-accent" />
      <div className="text-xs text-accent-text">
        Metrik di bawah ini adalah gabungan dari <b>{connectedPlatforms.length} dari {total}</b> platform yang
        terhubung
        {missing.length > 0 ? (
          <>
            {" "}
            — <b>{missing.join(", ")}</b> belum terhubung, jadi datanya belum ikut kehitung.{" "}
            <Link href="/binding" className="font-bold underline">
              Binding sekarang
            </Link>
          </>
        ) : (
          " — sudah mencakup semua data platformmu."
        )}
      </div>
    </div>
  );
}
