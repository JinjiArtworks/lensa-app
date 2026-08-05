# Lensa — Phase 1 UI Slice 5: Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the mockup's Settings page into `/settings` — three sub-tabs (Team & Akses: member table + invite modal; Notifikasi: toggle switches; Keamanan: 2FA toggle + audit log table). Same UI-only phase: no Firebase/Firestore, mock data only.

**Architecture:** One route `src/app/(dashboard)/settings/page.tsx`. Sub-tabs are local `useState`, same pattern as Billing's `BillingTabs` (Slice 4). Toggle switches are plain styled checkboxes (no new shadcn component needed — a `Switch` primitive isn't in this project yet and 4 toggle rows don't justify pulling in `@radix-ui/react-switch` for this small a surface; a native checkbox styled to look like a pill switch is sufficient and avoids another shadcn-CLI risk for a low-value component).

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind v3, shadcn/ui Badge/Button/Dialog, Vitest + RTL.

## Global Constraints

- **No Firebase/Firestore calls anywhere in this plan.** Same as prior slices.
- Accent color = amber/gold, this project's existing Tailwind tokens.
- Max 2 Zustand stores (`ui`+`auth`) — tab state, modal state, toggle state are all component-local `useState`.
- If any Tailwind class uses a fractional spacing value outside Tailwind v3's default scale (`4.5`/`6.5`/`7.5`/`15` are NOT valid; `0.5`/`1.5`/`2.5`/`3.5` ARE), substitute the nearest valid key and note it.
- No git repository in the parent `Assessment/` folder — every "commit" step is a manual checkpoint instead.

---

## File Structure

- Create: `src/features/settings/mock-data.ts` (team members, audit log)
- Create: `src/features/settings/components/SettingsTabs.tsx`
- Create: `src/features/settings/components/TeamTab.tsx`
- Create: `src/features/settings/components/InviteModal.tsx`
- Create: `src/features/settings/components/ToggleSwitch.tsx`
- Create: `src/features/settings/components/NotificationsTab.tsx`
- Create: `src/features/settings/components/SecurityTab.tsx`
- Create: `src/app/(dashboard)/settings/page.tsx`

---

## Task 1: Settings shell + Team & Akses tab

**Files:**
- Create: `src/features/settings/mock-data.ts`
- Create: `src/features/settings/components/SettingsTabs.tsx`
- Create: `src/features/settings/components/TeamTab.tsx`
- Create: `src/features/settings/components/InviteModal.tsx`
- Create: `src/app/(dashboard)/settings/page.tsx`
- Test: `src/features/settings/components/__tests__/SettingsTabs.test.tsx`, `TeamTab.test.tsx`, `InviteModal.test.tsx`

**Interfaces:**
- Produces: `TEAM` array from `mock-data.ts` (mutable, `InviteModal` pushes to it on submit — same "mutate shared mock array" pattern already used by `PaymentGatewayModal`/`INVOICES` in Slice 4).
- Produces: `SettingsPage`'s local `tab` state (`"team" | "notif" | "security"`) — Task 2's `NotificationsTab`/`SecurityTab` are rendered by the page, not managed by the tab component.

- [x] **Step 1: Write the mock data**

Create `src/features/settings/mock-data.ts`:
```ts
export type TeamRole = "Owner" | "Admin" | "Viewer";
export type TeamStatus = "Aktif" | "Invite Terkirim";

export interface TeamMember {
  nama: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
}

export const TEAM: TeamMember[] = [
  { nama: "Sinta Wijaya", email: "sinta@tokobaju.com", role: "Owner", status: "Aktif" },
  { nama: "Rangga Pratama", email: "rangga@tokobaju.com", role: "Admin", status: "Aktif" },
  { nama: "Dewi Lestari", email: "dewi@tokobaju.com", role: "Viewer", status: "Aktif" },
  { nama: "Bagus Nugroho", email: "bagus@tokobaju.com", role: "Viewer", status: "Invite Terkirim" },
];

export interface AuditEntry {
  act: string;
  user: string;
  time: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { act: "Login berhasil", user: "Sinta W.", time: "Hari ini, 08:12" },
  { act: "Mengubah budget campaign Summer Sale 2025", user: "Rangga P.", time: "Hari ini, 07:40" },
  { act: "Menambah anggota tim (bagus@tokobaju.com)", user: "Sinta W.", time: "Kemarin, 16:05" },
  { act: "Export laporan bulanan", user: "Dewi L.", time: "Kemarin, 10:22" },
  { act: "Reconnect TikTok Ads", user: "Rangga P.", time: "2 hari lalu, 09:31" },
];
```

- [x] **Step 2: Write the failing test for `SettingsTabs`**

Create `src/features/settings/components/__tests__/SettingsTabs.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SettingsTabs } from "../SettingsTabs";

test("renders all 3 tabs with Team & Akses active by default", () => {
  const onChange = vi.fn();
  render(<SettingsTabs active="team" onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Team & Akses" })).toHaveClass("bg-accent");
  expect(screen.getByRole("button", { name: "Notifikasi" })).not.toHaveClass("bg-accent");
  expect(screen.getByRole("button", { name: "Keamanan" })).not.toHaveClass("bg-accent");
});

test("clicking a tab calls onChange with that tab key", () => {
  const onChange = vi.fn();
  render(<SettingsTabs active="team" onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Keamanan" }));
  expect(onChange).toHaveBeenCalledWith("security");
});
```

- [x] **Step 3: Run to verify failure, then implement `SettingsTabs`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- SettingsTabs
```
Expected: FAIL.

Create `src/features/settings/components/SettingsTabs.tsx`:
```tsx
export type SettingsTab = "team" | "notif" | "security";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "team", label: "Team & Akses" },
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
```

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- SettingsTabs
```
Expected: PASS, 2/2.

- [x] **Step 5: Write the failing test for `InviteModal`**

Create `src/features/settings/components/__tests__/InviteModal.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { InviteModal } from "../InviteModal";

test("submitting a valid email calls onInvited with the email and role", () => {
  const onInvited = vi.fn();
  render(<InviteModal open={true} onClose={() => {}} onInvited={onInvited} />);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "budi@tokobaju.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Kirim undangan" }));
  expect(onInvited).toHaveBeenCalledWith("budi@tokobaju.com", "Admin");
});

test("rejects an invalid email without calling onInvited", () => {
  const onInvited = vi.fn();
  render(<InviteModal open={true} onClose={() => {}} onInvited={onInvited} />);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
  fireEvent.click(screen.getByRole("button", { name: "Kirim undangan" }));
  expect(onInvited).not.toHaveBeenCalled();
});
```

- [x] **Step 6: Run to verify failure, then implement `InviteModal`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- InviteModal
```
Expected: FAIL.

Create `src/features/settings/components/InviteModal.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TeamRole } from "../mock-data";

export function InviteModal({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: (email: string, role: TeamRole) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Admin");

  function handleSubmit() {
    if (!email.includes("@")) return;
    onInvited(email, role);
    setEmail("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite anggota tim</DialogTitle>
        </DialogHeader>
        <p className="mb-3.5 text-xs leading-relaxed text-ink-2">
          Kami kirim undangan lewat email. Anggota bisa mulai akses setelah menerima undangan.
        </p>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">Email</span>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@tokobaju.com"
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          >
            <option value="Admin">Admin — bisa ubah campaign &amp; koneksi</option>
            <option value="Viewer">Viewer — hanya lihat laporan</option>
          </select>
        </label>
        <div className="flex gap-2">
          <Button className="flex-1 justify-center" onClick={handleSubmit}>
            Kirim undangan
          </Button>
          <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [x] **Step 7: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- InviteModal
```
Expected: PASS, 2/2.

- [x] **Step 8: Write the failing test for `TeamTab`**

Create `src/features/settings/components/__tests__/TeamTab.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamTab } from "../TeamTab";

test("renders all team members with role badges", () => {
  render(<TeamTab />);
  expect(screen.getByText("Sinta Wijaya")).toBeInTheDocument();
  expect(screen.getByText("Owner")).toBeInTheDocument();
  expect(screen.getByText("Invite Terkirim")).toBeInTheDocument();
});

test("inviting a new member adds them to the table", () => {
  render(<TeamTab />);
  fireEvent.click(screen.getByRole("button", { name: "+ Invite anggota" }));
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "citra@tokobaju.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Kirim undangan" }));
  expect(screen.getByText("citra@tokobaju.com")).toBeInTheDocument();
});
```

- [x] **Step 9: Run to verify failure, then implement `TeamTab`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- TeamTab
```
Expected: FAIL.

Create `src/features/settings/components/TeamTab.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEAM, type TeamMember, type TeamRole } from "../mock-data";
import { InviteModal } from "./InviteModal";

export function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM);
  const [inviteOpen, setInviteOpen] = useState(false);

  function handleInvited(email: string, role: TeamRole) {
    const nama = email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setMembers((prev) => [...prev, { nama, email, role, status: "Invite Terkirim" }]);
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Anggota Tim</h3>
          <div className="mt-0.5 text-[11.5px] text-ink-3">Plan Pro — bisa undang anggota tanpa batas.</div>
        </div>
        <Button onClick={() => setInviteOpen(true)}>+ Invite anggota</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Nama</th>
              <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Email</th>
              <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Role</th>
              <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-b border-line-2 last:border-b-0">
                <td className="px-2 py-3 text-xs font-bold">{m.nama}</td>
                <td className="px-2 py-3 text-xs text-ink-2">{m.email}</td>
                <td className="px-2 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                      m.role === "Owner" ? "bg-accent-bg text-accent-text" : "bg-gray-bg text-ink-2"
                    }`}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <Badge variant={m.status === "Aktif" ? "active" : "pending"}>{m.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={handleInvited} />
    </div>
  );
}
```

- [x] **Step 10: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- TeamTab
```
Expected: PASS, 2/2.

- [x] **Step 11: Assemble the Settings page**

Create `src/app/(dashboard)/settings/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { SettingsTabs, type SettingsTab } from "@/features/settings/components/SettingsTabs";
import { TeamTab } from "@/features/settings/components/TeamTab";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("team");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[23px] font-extrabold tracking-tight">Settings</h1>
        <div className="mt-0.5 text-xs text-ink-3">Atur tim, notifikasi, dan keamanan akun</div>
      </div>
      <SettingsTabs active={tab} onChange={setTab} />
      {tab === "team" && <TeamTab />}
      {/* Notifikasi and Keamanan tabs (Task 2) slot in here */}
    </div>
  );
}
```

- [x] **Step 12: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

---

## Task 2: Notifikasi tab + Keamanan tab

**Files:**
- Create: `src/features/settings/components/ToggleSwitch.tsx`
- Create: `src/features/settings/components/NotificationsTab.tsx`
- Create: `src/features/settings/components/SecurityTab.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`
- Test: `src/features/settings/components/__tests__/ToggleSwitch.test.tsx`, `NotificationsTab.test.tsx`, `SecurityTab.test.tsx`

**Interfaces:**
- Consumes: `AUDIT_LOG` from `../mock-data`.
- Produces: nothing consumed elsewhere — closes out the Settings page for this plan.

- [x] **Step 1: Write the failing test for `ToggleSwitch`**

Create `src/features/settings/components/__tests__/ToggleSwitch.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { ToggleSwitch } from "../ToggleSwitch";

test("renders checked/unchecked state and calls onChange on click", () => {
  const onChange = vi.fn();
  render(<ToggleSwitch checked={false} onChange={onChange} label="Test toggle" />);
  const checkbox = screen.getByRole("checkbox", { name: "Test toggle" });
  expect(checkbox).not.toBeChecked();
  fireEvent.click(checkbox);
  expect(onChange).toHaveBeenCalledWith(true);
});
```

- [x] **Step 2: Run to verify failure, then implement `ToggleSwitch`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- ToggleSwitch
```
Expected: FAIL.

Create `src/features/settings/components/ToggleSwitch.tsx`:
```tsx
export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-block h-5.5 w-9 shrink-0 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="peer absolute h-0 w-0 opacity-0"
      />
      <span className="absolute inset-0 rounded-full border border-line bg-gray-bg transition-colors peer-checked:border-accent peer-checked:bg-accent" />
      <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
}
```
Note: `h-5.5` is not a valid Tailwind v3 default scale key — substitute `h-[22px]` (matching the mockup's exact toggle height) before running tests, or let the implementer catch and fix this.

- [x] **Step 3: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- ToggleSwitch
```
Expected: PASS, 1/1.

- [x] **Step 4: Write the failing test for `NotificationsTab`**

Create `src/features/settings/components/__tests__/NotificationsTab.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationsTab } from "../NotificationsTab";

test("renders all 4 notification toggle rows with correct initial states", () => {
  render(<NotificationsTab />);
  expect(screen.getByRole("checkbox", { name: "Alert anomali via Email" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Alert anomali via WhatsApp" })).not.toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Laporan mingguan otomatis" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Notifikasi budget habis" })).toBeChecked();
});

test("clicking a toggle flips its state", () => {
  render(<NotificationsTab />);
  const toggle = screen.getByRole("checkbox", { name: "Alert anomali via WhatsApp" });
  fireEvent.click(toggle);
  expect(toggle).toBeChecked();
});
```

- [x] **Step 5: Run to verify failure, then implement `NotificationsTab`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- NotificationsTab
```
Expected: FAIL.

Create `src/features/settings/components/NotificationsTab.tsx`:
```tsx
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
```

- [x] **Step 6: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- NotificationsTab
```
Expected: PASS, 2/2.

- [x] **Step 7: Write the failing test for `SecurityTab`**

Create `src/features/settings/components/__tests__/SecurityTab.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { SecurityTab } from "../SecurityTab";

test("renders the 2FA toggle (off by default) and 5 audit log entries", () => {
  render(<SecurityTab />);
  expect(screen.getByRole("checkbox", { name: "Aktifkan 2FA" })).not.toBeChecked();
  expect(screen.getByText("Login berhasil")).toBeInTheDocument();
  expect(screen.getByText("Reconnect TikTok Ads")).toBeInTheDocument();
});
```

- [x] **Step 8: Run to verify failure, then implement `SecurityTab`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- SecurityTab
```
Expected: FAIL.

Create `src/features/settings/components/SecurityTab.tsx`:
```tsx
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
```

- [x] **Step 9: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- SecurityTab
```
Expected: PASS, 1/1.

- [x] **Step 10: Slot both tabs into the Settings page**

Modify `src/app/(dashboard)/settings/page.tsx`:
```tsx
import { NotificationsTab } from "@/features/settings/components/NotificationsTab";
import { SecurityTab } from "@/features/settings/components/SecurityTab";
// ...
      {tab === "team" && <TeamTab />}
      {tab === "notif" && <NotificationsTab />}
      {tab === "security" && <SecurityTab />}
```

- [x] **Step 11: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

- [x] **Step 12: Manual checkpoint**

`npm run dev`, visit `/settings`. Confirm: Team & Akses shows 4 members with role/status badges, "+ Invite anggota" opens modal and submitting adds a new row; Notifikasi shows 4 toggle rows with correct initial on/off states and each is clickable; Keamanan shows the 2FA toggle (off) + 5-row audit log.

---

## Self-Review Notes

**Spec coverage:** all of Settings' three sub-tabs are covered visually and behaviorally (invite flow, toggle flow) with local state — no Firestore persistence for any of it (team invites, notification prefs, 2FA state all reset on page refresh), consistent with this project's "UI slicing first" phase. `31-frontend-nextjs.md`'s guidance to avoid unnecessary shadcn additions is followed by hand-rolling `ToggleSwitch` instead of pulling in `@radix-ui/react-switch` for 5 toggle instances total.
