export function InsightStatsRow({
  stats,
}: {
  stats: { total: number; urgent: number; newRecommendations: number };
}) {
  const items = [
    { label: "Total insight", value: stats.total },
    { label: "Perlu aksi segera", value: stats.urgent },
    { label: "Rekomendasi baru", value: stats.newRecommendations },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2.5">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line bg-card px-4 py-2.5 text-xs text-ink-2">
          <b className="block text-[15px] text-ink">{it.value}</b>
          {it.label}
        </div>
      ))}
    </div>
  );
}
