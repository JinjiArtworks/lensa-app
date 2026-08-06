"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export type FilterPreset = "week" | "month" | "year" | "custom";

export interface FilterValue {
  preset: FilterPreset;
  from: string;
  to: string;
}

const PRESETS: { key: FilterPreset; label: string }[] = [
  { key: "week", label: "Minggu Ini" },
  { key: "month", label: "Bulan Ini" },
  { key: "year", label: "Tahun Ini" },
  { key: "custom", label: "Custom" },
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function presetRange(preset: FilterPreset): { from: string; to: string } {
  // Custom ranges are user-supplied (from/to), not derivable — callers must
  // never call this with "custom".
  if (preset === "custom") {
    throw new Error("presetRange() does not support the 'custom' preset");
  }
  const now = new Date();
  const to = isoDate(now);
  const from = new Date(now);
  if (preset === "week") from.setDate(now.getDate() - 7);
  else if (preset === "month") from.setMonth(now.getMonth() - 1);
  else from.setFullYear(now.getFullYear() - 1);
  return { from: isoDate(from), to };
}

export function FilterBar({
  defaultPreset = "month",
  onChange,
}: {
  defaultPreset?: FilterPreset;
  onChange: (value: FilterValue) => void;
}) {
  const [preset, setPreset] = useState<FilterPreset>(defaultPreset);
  const initialRange = presetRange(defaultPreset === "custom" ? "month" : defaultPreset);
  const [customFrom, setCustomFrom] = useState(initialRange.from);
  const [customTo, setCustomTo] = useState(initialRange.to);
  const [popoverOpen, setPopoverOpen] = useState(false);

  function selectPreset(next: FilterPreset) {
    setPreset(next);
    if (next === "custom") {
      setPopoverOpen(true);
      return;
    }
    onChange({ preset: next, ...presetRange(next) });
  }

  function applyCustom() {
    setPopoverOpen(false);
    onChange({ preset: "custom", from: customFrom, to: customTo });
  }

  return (
    <div className="flex items-center gap-1.5">
      {PRESETS.map((p) =>
        p.key === "custom" ? (
          <Popover key={p.key} open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={() => selectPreset("custom")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
                  preset === "custom" ? "bg-accent text-ink" : "bg-gray-bg text-ink-2 hover:bg-line"
                }`}
              >
                <Calendar className="size-3.5" />
                {p.label}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="flex flex-col gap-2.5">
                <label className="flex flex-col gap-1 text-[11.5px] font-semibold text-ink-2">
                  Dari
                  <input
                    type="date"
                    value={customFrom}
                    max={customTo}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="rounded-md border border-line bg-bg px-2 py-1.5 text-[12.5px]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[11.5px] font-semibold text-ink-2">
                  Sampai
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="rounded-md border border-line bg-bg px-2 py-1.5 text-[12.5px]"
                  />
                </label>
                <Button size="sm" onClick={applyCustom}>
                  Terapkan
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <button
            key={p.key}
            type="button"
            onClick={() => selectPreset(p.key)}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              preset === p.key ? "bg-accent text-ink" : "bg-gray-bg text-ink-2 hover:bg-line"
            }`}
          >
            {p.label}
          </button>
        )
      )}
    </div>
  );
}
