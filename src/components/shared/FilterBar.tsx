"use client";

import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type FilterPreset = "week" | "month" | "year" | "custom";

export interface FilterValue {
  preset: FilterPreset;
  from: string;
  to: string;
}

const PRESET_LABELS: Record<FilterPreset, string> = {
  week: "Minggu Ini",
  month: "Bulan Ini",
  year: "Tahun Ini",
  custom: "Custom",
};

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

export function initialFilterValue(defaultPreset: FilterPreset): FilterValue {
  const preset = defaultPreset === "custom" ? "month" : defaultPreset;
  return { preset, ...presetRange(preset) };
}

export function FilterBar({
  defaultPreset = "month",
  onChange,
}: {
  defaultPreset?: FilterPreset;
  onChange: (value: FilterValue) => void;
}) {
  const [preset, setPreset] = useState<FilterPreset>(defaultPreset);
  const initialRange = initialFilterValue(defaultPreset);
  const [customFrom, setCustomFrom] = useState(initialRange.from);
  const [customTo, setCustomTo] = useState(initialRange.to);
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Plain positioned div instead of a Radix Popover here — nesting a Popover
  // inside a Select's own trigger caused the just-opened panel to read the
  // click that picked "Custom" (which closes Select's own dropdown) as an
  // outside click on itself, closing it again on the same frame.
  useEffect(() => {
    if (!showCustomPanel) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCustomPanel(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showCustomPanel]);

  // Selecting "custom" from the dropdown doesn't commit anything yet — it
  // only opens the date-range panel. The visible selection (and onChange)
  // only updates once the user clicks "Terapkan", so dismissing the panel
  // without applying leaves the previous preset active.
  function handleSelect(next: string) {
    const nextPreset = next as FilterPreset;
    if (nextPreset === "custom") {
      setShowCustomPanel(true);
      return;
    }
    setShowCustomPanel(false);
    setPreset(nextPreset);
    onChange({ preset: nextPreset, ...presetRange(nextPreset) });
  }

  function applyCustom() {
    setPreset("custom");
    setShowCustomPanel(false);
    onChange({ preset: "custom", from: customFrom, to: customTo });
  }

  return (
    <div ref={containerRef} className="relative">
      <Select value={preset} onValueChange={handleSelect}>
        <SelectTrigger className="h-9 w-[150px] border-line bg-gray-bg text-[11.5px] font-semibold text-ink-2">
          <SelectValue>{PRESET_LABELS[preset]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">{PRESET_LABELS.week}</SelectItem>
          <SelectItem value="month">{PRESET_LABELS.month}</SelectItem>
          <SelectItem value="year">{PRESET_LABELS.year}</SelectItem>
          <SelectItem value="custom">{PRESET_LABELS.custom}</SelectItem>
        </SelectContent>
      </Select>
      {showCustomPanel && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-md border border-line bg-card p-4 shadow-md">
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
        </div>
      )}
    </div>
  );
}
