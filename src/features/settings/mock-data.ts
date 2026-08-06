export interface AuditEntry {
  act: string;
  user: string;
  time: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { act: "Login berhasil", user: "Sinta W.", time: "Hari ini, 08:12" },
  { act: "Mengubah budget campaign Summer Sale 2025", user: "Rangga P.", time: "Hari ini, 07:40" },
  { act: "Ganti metode pembayaran", user: "Sinta W.", time: "Kemarin, 16:05" },
  { act: "Export laporan bulanan", user: "Dewi L.", time: "Kemarin, 10:22" },
  { act: "Reconnect TikTok Ads", user: "Rangga P.", time: "2 hari lalu, 09:31" },
];
