"use client";

import { useState } from "react";
import { ToggleSwitch } from "./ToggleSwitch";

interface NotifRow {
  key: string;
  title: string;
  desc: string;
  defaultOn: boolean;
}

const ROWS: NotifRow[] = [
  {
    key: "email",
    title: "Alert anomali via Email",
    desc: "Kirim email begitu AI mendeteksi lonjakan spend atau penurunan closing.",
    defaultOn: true,
  },
  {
    key: "whatsapp",
    title: "Alert anomali via WhatsApp",
    desc: "Notifikasi cepat ke nomor WhatsApp terdaftar untuk anomali mendesak.",
    defaultOn: false,
  },
  {
    key: "weekly",
    title: "Laporan mingguan otomatis",
    desc: "Ringkasan performa semua platform tiap Senin pagi.",
    defaultOn: true,
  },
  {
    key: "budget",
    title: "Notifikasi budget habis",
    desc: "Peringatan saat budget harian campaign hampir atau sudah habis.",
    defaultOn: true,
  },
];

export function NotificationsTab() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(ROWS.map((r) => [r.key, r.defaultOn]))
  );

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5">
        <h3 className="text-sm font-bold">Preferensi Notifikasi</h3>
        <div className="mt-0.5 text-[11.5px] text-ink-3">Pilih kabar apa saja yang mau kamu terima dari Lensa.</div>
      </div>
      {ROWS.map((row) => (
        <div key={row.key} className="flex items-center gap-3.5 border-b border-line-2 py-3 last:border-b-0">
          <div className="flex-1">
            <div className="text-[13px] font-semibold">{row.title}</div>
            <div className="mt-0.5 text-[11.5px] leading-relaxed text-ink-3">{row.desc}</div>
          </div>
          <ToggleSwitch
            checked={state[row.key]}
            onChange={(v) => setState((prev) => ({ ...prev, [row.key]: v }))}
            label={row.title}
          />
        </div>
      ))}
    </div>
  );
}
