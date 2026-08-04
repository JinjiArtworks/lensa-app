"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_CONNECTIONS, type PlatformConnection } from "../mock-data";

export function PlatformConnectionList() {
  const [connections, setConnections] = useState<PlatformConnection[]>(PLATFORM_CONNECTIONS);
  const [reconnecting, setReconnecting] = useState<string | null>(null);

  function reconnect(key: string) {
    setReconnecting(key);
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) => (c.key === key ? { ...c, syncStatus: "ok", lastSync: "baru saja" } : c))
      );
      setReconnecting(null);
    }, 1400);
  }

  return (
    <div className="flex max-w-[480px] flex-col gap-2.5">
      {connections.map((c) => {
        const isReconnecting = reconnecting === c.key;
        return (
          <div key={c.key} className="rounded-xl border-2 border-green bg-green-bg p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green text-[11.5px] font-bold text-white">
                {c.ic}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{c.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-3">{c.sub}</div>
              </div>
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-green bg-green">
                <Check className="size-3.5 text-white" />
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
              {isReconnecting ? (
                <span className="flex items-center gap-1.5 text-ink-3">
                  <span className="size-3 animate-spin rounded-full border-2 border-line border-t-accent" />
                  Menyambungkan ulang…
                </span>
              ) : c.syncStatus === "error" ? (
                <>
                  <span className="font-semibold text-red">Gagal sync sejak {c.lastSync}</span>
                  <Button
                    variant="destructive"
                    className="px-2.5 py-1 text-[10.5px]"
                    onClick={() => reconnect(c.key)}
                  >
                    Reconnect
                  </Button>
                </>
              ) : (
                <span className="text-ink-3">Terakhir sync: {c.lastSync}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
