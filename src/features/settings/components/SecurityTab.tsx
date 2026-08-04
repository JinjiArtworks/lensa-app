"use client";

import { useState } from "react";
import { AUDIT_LOG } from "../mock-data";
import { ToggleSwitch } from "./ToggleSwitch";

export function SecurityTab() {
  const [twoFa, setTwoFa] = useState(false);

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-line bg-card p-4">
        <div className="mb-3.5">
          <h3 className="text-sm font-bold">Keamanan Akun</h3>
          <div className="mt-0.5 text-[11.5px] text-ink-3">Lapisan perlindungan tambahan untuk akun bisnismu.</div>
        </div>
        <div className="flex items-center gap-3.5 py-3">
          <div className="flex-1">
            <div className="text-[13px] font-semibold">Aktifkan 2FA</div>
            <div className="mt-0.5 text-[11.5px] leading-relaxed text-ink-3">
              Minta kode verifikasi tambahan setiap login dari perangkat baru.
            </div>
          </div>
          <ToggleSwitch checked={twoFa} onChange={setTwoFa} label="Aktifkan 2FA" />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-sm font-bold">Log Aktivitas</h3>
          <span className="text-[11.5px] text-ink-3">5 aktivitas terakhir</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">
                  Aktivitas
                </th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">User</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOG.map((a) => (
                <tr key={a.act + a.time} className="border-b border-line-2 last:border-b-0">
                  <td className="px-2 py-3 text-xs">{a.act}</td>
                  <td className="px-2 py-3 text-xs text-ink-2">{a.user}</td>
                  <td className="px-2 py-3 text-xs text-ink-3">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
