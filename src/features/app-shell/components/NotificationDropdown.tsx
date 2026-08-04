"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { MOCK_ACTIVITY } from "../mock-data";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="notifikasi"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full bg-gray-bg text-ink-2"
      >
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red" />
        <Bell className="size-[18px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[55] max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-line bg-card p-4 shadow-xl">
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="text-sm font-bold">Activity Feed</h3>
            <button type="button" aria-label="tutup" onClick={() => setOpen(false)} className="text-ink-3">
              <X className="size-4" />
            </button>
          </div>
          {MOCK_ACTIVITY.map((item) => (
            <div key={item.id} className="flex gap-2.5 border-b border-line-2 py-2.5 last:border-b-0">
              <span
                className={`mt-1.5 size-1.5 shrink-0 rounded-full ${item.status === "ok" ? "bg-green" : "bg-red"}`}
              />
              <div>
                <div className="text-[12.5px] font-semibold leading-snug">{item.title}</div>
                <div className="mt-0.5 text-[11px] text-ink-3">{item.time}</div>
                <Link
                  href={item.linkHref}
                  onClick={() => setOpen(false)}
                  className="mt-0.5 block text-[11.5px] font-semibold text-accent-text"
                >
                  {item.linkLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
