"use client";

import { useState } from "react";
import { SettingsTabs, type SettingsTab } from "@/features/settings/components/SettingsTabs";
import { NotificationsTab } from "@/features/settings/components/NotificationsTab";
import { SecurityTab } from "@/features/settings/components/SecurityTab";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("notif");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[23px] font-extrabold tracking-tight">Settings</h1>
        <div className="mt-0.5 text-xs text-ink-3">Atur notifikasi dan keamanan akun</div>
      </div>
      <SettingsTabs active={tab} onChange={setTab} />
      {tab === "notif" && <NotificationsTab />}
      {tab === "security" && <SecurityTab />}
    </div>
  );
}
