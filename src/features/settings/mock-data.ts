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
