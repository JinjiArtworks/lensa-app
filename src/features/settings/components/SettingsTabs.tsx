export type SettingsTab = "notif" | "security";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "notif", label: "Notifikasi" },
  { key: "security", label: "Keamanan" },
];

export function SettingsTabs({
  active,
  onChange,
}: {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
            t.key === active ? "border-accent bg-accent text-ink" : "border-line bg-card text-ink-2"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
