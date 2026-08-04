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
