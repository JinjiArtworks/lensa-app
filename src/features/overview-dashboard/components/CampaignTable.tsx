"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import { CAMPAIGNS, PAGE_SIZE, STATUS_LABEL, formatRupiah, type Campaign, type CampaignStatus } from "../mock-data";
import { CampaignDetailModal } from "./CampaignDetailModal";

const STATUS_BADGE: Record<CampaignStatus, "active" | "paused" | "pending" | "archived"> = {
  active: "active",
  paused: "paused",
  pending: "pending",
  archived: "archived",
};

export function CampaignTable() {
  const showToast = useUiStore((s) => s.showToast);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const filtered = useMemo(
    () =>
      CAMPAIGNS.filter(
        (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.channel.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[180px] flex-1 items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2">
          <Search className="size-4 text-ink-3" />
          <input
            placeholder="Cari campaign, channel…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-ink outline-none"
          />
        </div>
        <Button variant="ghost" onClick={() => showToast("View disimpan")}>
          Save View
        </Button>
        <Button variant="ghost" onClick={() => showToast("Filter dibuka (simulasi)")}>
          Filters
        </Button>
      </div>

      <div className="rounded-2xl border border-line bg-card p-4">
        <h3 className="mb-3.5 text-sm font-bold">All campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Campaign</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Status</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Channel</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Spend</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">CTR</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Closing</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-ink-3">
                    Tidak ada campaign yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr
                    key={c.name}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer border-b border-line-2 last:border-b-0 hover:bg-bg"
                  >
                    <td className="px-2 py-3 text-xs">{c.name}</td>
                    <td className="px-2 py-3">
                      <Badge variant={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-2 py-3 text-xs text-ink-2 underline decoration-line underline-offset-2">
                      {c.channel}
                    </td>
                    <td className="px-2 py-3 text-right text-xs">{formatRupiah(c.spend)}</td>
                    <td className="px-2 py-3 text-right text-xs">{c.ctr}</td>
                    <td className="px-2 py-3 text-right text-xs">{c.conv}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3.5 flex items-center justify-end gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`size-8 rounded-lg border text-[12.5px] ${
                p === currentPage ? "border-accent bg-accent text-ink" : "border-line bg-card text-ink-2"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <CampaignDetailModal campaign={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
