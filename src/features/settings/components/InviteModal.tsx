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
